import { forwardRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Menu, Clock, Loader2, MessageCircleQuestion, Terminal, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMarkLessonComplete } from "@/hooks/useCourseDetails";

interface Lesson {
  id: string;
  title: string;
  content: string;
  duration_minutes: number;
  completed: boolean;
}

interface LessonContentProps {
  courseId: string;
  lesson: Lesson | undefined;
  moduleTitle?: string;
  allLessons: Lesson[];
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
  onNavigate: (lessonId: string) => void;
  onTakeQuiz?: () => void;
  hasQuiz?: boolean;
  onOpenChat?: () => void;
}

const LessonContent = forwardRef<HTMLDivElement, LessonContentProps>(({
  courseId,
  lesson,
  moduleTitle,
  allLessons,
  onToggleSidebar,
  sidebarCollapsed,
  onNavigate,
  onTakeQuiz,
  hasQuiz,
  onOpenChat
}, ref) => {
  const { markComplete } = useMarkLessonComplete(courseId);
  const [isCompleting, setIsCompleting] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Reset MCQ state when lesson changes
  useEffect(() => {
    setSelectedOption(null);
    setShowResult(false);
  }, [lesson?.id]);

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <p className="text-muted-foreground">Select a lesson to begin</p>
      </div>
    );
  }

  const currentIndex = allLessons.findIndex(l => l.id === lesson.id);
  const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  // Attempt to parse content as JSON
  let theoryText = lesson.content;
  let codeSnippet = null;
  let mcq = null;
  let isModuleQuiz = false;
  let moduleQuizData: any = null;

  try {
    const parsed = JSON.parse(lesson.content);
    if (parsed && typeof parsed === 'object') {
      if (parsed.is_module_quiz) {
        isModuleQuiz = true;
        moduleQuizData = parsed.quiz;
        theoryText = '';
      } else {
        theoryText = parsed.theory || '';
        codeSnippet = parsed.code || null;
        mcq = parsed.mcq || null;
      }
    }
  } catch (e) {
    // If it fails to parse, it means it's a legacy string content.
  }

  // Parse content into paragraphs
  const contentParagraphs = theoryText
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  const handleNext = async () => {
    setIsCompleting(true);
    // Mark current lesson as complete
    await markComplete(lesson.id);
    setIsCompleting(false);

    // Navigate to next lesson or quiz
    if (nextLesson) {
      onNavigate(nextLesson.id);
    } else if (hasQuiz && onTakeQuiz) {
      onTakeQuiz();
    }
  };

  return (
    <div ref={ref} className="min-h-screen">
      {/* Toolbar */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{moduleTitle || "Module"}</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium">{lesson.title}</span>
          </div>
          <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{lesson.duration_minutes} min</span>
          </div>
        </div>
      </div>

      {/* Notebook content */}
      <div className="notebook-paper min-h-[calc(100vh-60px)]">
        <motion.div
          key={lesson.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`mx-auto max-w-4xl px-4`}
        >
          <div className="notebook-block py-12">
            <div className="flex flex-col">
              <div className="flex flex-col">
                {/* Lesson title */}
                {!isModuleQuiz && (
                  <h1 className="text-3xl font-display font-semibold text-foreground mb-8">
                    {lesson.title}
                  </h1>
                )}

                {/* Lesson content */}
                {!isModuleQuiz && (
                  <div className="space-y-6">
                    {contentParagraphs.map((paragraph, index) => (
                      <p key={index} className="text-foreground/90 leading-loose">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Stacked Code Example (Terminal/ChatGPT Style) */}
              {codeSnippet && !isModuleQuiz && (
                <div className="mt-8 w-full rounded-xl overflow-hidden border border-border/50 bg-[#0d1117] shadow-lg">
                  {/* Header Bar */}
                  <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-white/10 text-slate-300">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4" />
                      <span className="text-xs font-semibold tracking-wider text-slate-300">Example Code</span>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(codeSnippet);
                        setIsCopied(true);
                        setTimeout(() => setIsCopied(false), 2000);
                      }}
                      className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-medium">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy code</span>
                        </>
                      )}
                    </button>
                  </div>
                  {/* Code Area */}
                  <div className="p-4 overflow-x-auto">
                    <code className="text-sm font-mono whitespace-pre text-slate-50 leading-relaxed block">
                      {codeSnippet}
                    </code>
                  </div>
                </div>
              )}

              {/* Lesson MCQ */}
              {mcq && !isModuleQuiz && (
                <div className="mt-8 border border-border bg-card rounded-xl p-6 shadow-sm w-full">
                  <h3 className="text-xl font-medium text-foreground mb-4">Check Your Understanding</h3>
                  <p className="text-foreground/90 mb-4">{mcq.question}</p>
                  <div className="space-y-3">
                    {mcq.options.map((option: string, i: number) => {
                      const isSelected = selectedOption === i;
                      const isCorrect = i === mcq.correct_option_index;
                      const showAsCorrect = showResult && isCorrect;
                      const showAsWrong = showResult && isSelected && !isCorrect;

                      return (
                        <button
                          key={i}
                          onClick={() => {
                            if (!showResult) {
                              setSelectedOption(i);
                            }
                          }}
                          disabled={showResult}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${showAsCorrect
                              ? "border-success bg-success/10 text-success"
                              : showAsWrong
                                ? "border-destructive bg-destructive/10 text-destructive"
                                : isSelected
                                  ? "border-primary bg-primary/5 text-primary"
                                  : "border-border hover:border-primary/50 bg-background"
                            }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                  {!showResult && selectedOption !== null && (
                    <Button
                      className="mt-6"
                      onClick={() => setShowResult(true)}
                    >
                      Check Answer
                    </Button>
                  )}
                  {showResult && (
                    <div className="mt-4 p-4 rounded-lg bg-muted text-foreground/80 flex items-center justify-between">
                      <span>
                        {selectedOption === mcq.correct_option_index
                          ? "Great job! That's correct."
                          : "Not quite! Try again."}
                      </span>
                      {selectedOption !== mcq.correct_option_index && (
                        <Button variant="outline" size="sm" onClick={() => {
                          setShowResult(false);
                          setSelectedOption(null);
                        }}>Try Again</Button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Module Assessment */}
              {isModuleQuiz && moduleQuizData && (
                <div className="mt-8 border border-border bg-card rounded-xl p-6 shadow-sm w-full">
                  <h3 className="text-2xl font-semibold text-foreground mb-4">Module Assessment</h3>
                  <p className="text-foreground/90 text-lg mb-6">{moduleQuizData.question}</p>
                  <div className="space-y-3 mb-6">
                    {moduleQuizData.options.map((option: string, i: number) => {
                      const isSelected = selectedOption === i;
                      const isCorrect = i === moduleQuizData.correct_option_index;
                      const showAsCorrect = showResult && isCorrect;
                      const showAsWrong = showResult && isSelected && !isCorrect;

                      return (
                        <button
                          key={i}
                          onClick={() => {
                            if (!showResult) {
                              setSelectedOption(i);
                            }
                          }}
                          disabled={showResult}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${showAsCorrect
                              ? "border-success bg-success/10 text-success"
                              : showAsWrong
                                ? "border-destructive bg-destructive/10 text-destructive"
                                : isSelected
                                  ? "border-primary bg-primary/5 text-primary"
                                  : "border-border hover:border-primary/50 bg-background"
                            }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                  
                  {!showResult && selectedOption !== null && (
                    <Button
                      size="lg"
                      className="w-full sm:w-auto"
                      onClick={() => setShowResult(true)}
                    >
                      Check Answer
                    </Button>
                  )}
                  
                  {showResult && (
                    <div className={`mt-4 p-6 rounded-lg ${selectedOption === moduleQuizData.correct_option_index ? 'bg-success/10 border border-success/20' : 'bg-destructive/10 border border-destructive/20'}`}>
                      <div className="flex items-start gap-3">
                         <div className="flex-1">
                          <h4 className={`text-lg font-semibold mb-2 ${selectedOption === moduleQuizData.correct_option_index ? 'text-success' : 'text-destructive'}`}>
                            {selectedOption === moduleQuizData.correct_option_index ? "Correct! Great job." : "Incorrect. Let's review."}
                          </h4>
                          <p className="text-foreground/90 leading-relaxed">
                            <span className="font-semibold block mb-1">Explanation:</span>{" "}
                            {moduleQuizData.explanation}
                          </p>
                        </div>
                      </div>
                      
                      {selectedOption !== moduleQuizData.correct_option_index && (
                        <Button 
                          variant="outline" 
                          className="mt-6"
                          onClick={() => {
                          setShowResult(false);
                          setSelectedOption(null);
                        }}>
                          Retry Assessment
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-8 mt-10 border-t border-border gap-4 flex-wrap">
              <Button
                variant="outline"
                className="gap-2 shrink-0"
                disabled={!previousLesson}
                onClick={() => previousLesson && onNavigate(previousLesson.id)}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              {onOpenChat && (
                <Button
                  variant="secondary"
                  onClick={onOpenChat}
                  className="gap-2 flex-1 md:flex-none border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary"
                >
                  <MessageCircleQuestion className="w-4 h-4" />
                  Ask AI Tutor
                </Button>
              )}

              <Button
                className="gap-2"
                onClick={handleNext}
                disabled={isCompleting || (!nextLesson && !hasQuiz) || (mcq && (!showResult || selectedOption !== mcq.correct_option_index)) || (isModuleQuiz && (!showResult || selectedOption !== moduleQuizData?.correct_option_index))}
              >
                {isCompleting && <Loader2 className="w-4 h-4 animate-spin" />}
                {nextLesson ? "Next Lesson" : hasQuiz ? "Take Course Quiz" : "Finished"}
                {(!isCompleting && (nextLesson || hasQuiz)) && <ChevronRight className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
});

LessonContent.displayName = "LessonContent";

export default LessonContent;
