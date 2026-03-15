import { useState, useRef, useEffect, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

/** Lightweight inline markdown renderer – no external dependencies needed */
function renderMarkdown(text: string) {
  // Split into lines and process each
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];

  lines.forEach((line, lineIdx) => {
    // Heading 3
    if (line.startsWith("### ")) {
      elements.push(<p key={lineIdx} className="font-bold text-base mt-2 mb-1">{parseLine(line.slice(4))}</p>);
    // Heading 2
    } else if (line.startsWith("## ")) {
      elements.push(<p key={lineIdx} className="font-bold text-base mt-2 mb-1">{parseLine(line.slice(3))}</p>);
    // Heading 1
    } else if (line.startsWith("# ")) {
      elements.push(<p key={lineIdx} className="font-bold text-base mt-2 mb-1">{parseLine(line.slice(2))}</p>);
    // Bullet list
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(<li key={lineIdx} className="ml-4 list-disc">{parseLine(line.slice(2))}</li>);
    // Numbered list
    } else if (/^\d+\. /.test(line)) {
      elements.push(<li key={lineIdx} className="ml-4 list-decimal">{parseLine(line.replace(/^\d+\. /, ""))}</li>);
    // Empty line — add spacing
    } else if (line.trim() === "") {
      elements.push(<br key={lineIdx} />);
    // Normal paragraph
    } else {
      elements.push(<p key={lineIdx} className="mb-1">{parseLine(line)}</p>);
    }
  });

  return <>{elements}</>;
}

/** Parse inline tokens: **bold**, *italic*, `code` */
function parseLine(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[2]) {
      parts.push(<strong key={match.index}>{match[2]}</strong>);
    } else if (match[3]) {
      parts.push(<em key={match.index}>{match[3]}</em>);
    } else if (match[4]) {
      parts.push(<code key={match.index} className="bg-black/20 rounded px-1 font-mono text-xs">{match[4]}</code>);
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

interface CourseChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  context: {
    course: string;
    lesson: string | undefined;
    lessonContent?: string;
  };
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/course-chat`;

const CourseChatbot = forwardRef<HTMLDivElement, CourseChatbotProps>(({ isOpen, onClose, context, messages, setMessages }, ref) => {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // We removed the useEffect that resets messages on context change.
  // The parent component will now pass down the correct messages array for the current context.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    let assistantContent = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          context,
          geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY,
        }),
      });

      if (!resp.ok) {
        if (resp.status === 429) {
          toast({
            title: "Rate limit exceeded",
            description: "Please try again in a moment.",
            variant: "destructive",
          });
          throw new Error("Rate limit exceeded");
        }
        if (resp.status === 402) {
          toast({
            title: "AI credits exhausted",
            description: "Please add credits to continue.",
            variant: "destructive",
          });
          throw new Error("Credits exhausted");
        }
        throw new Error("Failed to get response");
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      // Create initial assistant message
      const assistantId = (Date.now() + 1).toString();
      const initialAssistantMsg: Message = { id: assistantId, role: "assistant", content: "" };
      
      setMessages((prev) => [...prev, initialAssistantMsg]);

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
           let line = textBuffer.slice(0, newlineIndex);
           textBuffer = textBuffer.slice(newlineIndex + 1);

           if (line.endsWith("\r")) line = line.slice(0, -1);
           if (line.startsWith(":") || line.trim() === "") continue;
           if (!line.startsWith("data: ")) continue;

           const jsonStr = line.slice(6).trim();
           if (jsonStr === "[DONE]") {
             streamDone = true;
             break;
           }

           try {
             const parsed = JSON.parse(jsonStr);
             const content = parsed.candidates?.[0]?.content?.parts?.[0]?.text as string | undefined;
             if (content) {
               assistantContent += content;
               // Important: pass a new reference and ensure we only map over the LATEST messages
               setMessages((prev) => {
                 return prev.map((m) =>
                   m.id === assistantId ? { ...m, content: assistantContent } : m
                 );
               });
             }
           } catch {
             textBuffer = line + "\n" + textBuffer;
             break;
           }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.candidates?.[0]?.content?.parts?.[0]?.text as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: assistantContent } : m
                )
              );
            }
          } catch {
            /* ignore */
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      if (!assistantContent) {
        // Remove the empty assistant message if no content was received
        setMessages((prev) => prev.filter((m) => m.content !== ""));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-card border-l border-border shadow-2xl z-50 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-medium text-foreground text-sm">Learning Assistant</h3>
                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {context.lesson || context.course}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${message.role === "user" ? "bg-primary" : "bg-accent"
                    }`}
                >
                  {message.role === "user" ? (
                    <User className="w-4 h-4 text-primary-foreground" />
                  ) : (
                    <Bot className="w-4 h-4 text-accent-foreground" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                    }`}
                >
                  {message.role === "user" ? (
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </p>
                  ) : (
                    <div className="text-sm leading-relaxed space-y-1">
                      {renderMarkdown(message.content || (isLoading ? "..." : ""))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                  <Bot className="w-4 h-4 text-accent-foreground" />
                </div>
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-border">
            <div className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about this concept..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                type="submit"
                variant="default"
                size="icon"
                disabled={!input.trim() || isLoading}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

CourseChatbot.displayName = "CourseChatbot";

export default CourseChatbot;
