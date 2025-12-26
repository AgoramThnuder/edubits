import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const difficulties = [
  { value: "beginner", label: "Beginner", description: "New to the topic" },
  { value: "intermediate", label: "Intermediate", description: "Some prior knowledge" },
  { value: "advanced", label: "Advanced", description: "Deep understanding" },
];

const CreateCourseModal = ({ isOpen, onClose }: CreateCourseModalProps) => {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("beginner");
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!topic.trim()) {
      toast({
        title: "Topic required",
        description: "Please enter a topic you'd like to learn about.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-course', {
        body: { topic: topic.trim(), difficulty }
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Course created!",
        description: `Your mini-course on "${topic}" is ready.`,
      });
      
      onClose();
      setTopic("");
      setDifficulty("beginner");
      
      if (data?.course?.id) {
        navigate(`/course/${data.course.id}`);
      } else {
        navigate("/courses");
      }
    } catch (error: any) {
      console.error('Course generation error:', error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg mx-4 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-display font-semibold text-foreground">
                    Create New Course
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    AI will generate a complete mini-course for you
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={isGenerating}
                className="p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Topic input */}
              <div className="space-y-2">
                <Label htmlFor="topic" className="text-foreground">
                  What would you like to learn?
                </Label>
                <Input
                  id="topic"
                  placeholder="e.g., Introduction to Machine Learning, The French Revolution..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="text-base"
                  autoFocus
                  disabled={isGenerating}
                />
                <p className="text-xs text-muted-foreground">
                  Be specific for better results. "Machine Learning basics" works better than just "AI".
                </p>
              </div>

              {/* Difficulty selection */}
              <div className="space-y-3">
                <Label className="text-foreground">Your current level</Label>
                <div className="grid gap-3">
                  {difficulties.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setDifficulty(d.value)}
                      disabled={isGenerating}
                      className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200 disabled:opacity-50 ${
                        difficulty === d.value
                          ? "border-primary bg-accent/50"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        difficulty === d.value ? "border-primary" : "border-muted-foreground"
                      }`}>
                        {difficulty === d.value && (
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{d.label}</p>
                        <p className="text-sm text-muted-foreground">{d.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit button */}
              <Button 
                type="submit" 
                size="lg"
                className="w-full"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating your course...
                  </>
                ) : (
                  <>
                    <BookOpen className="w-4 h-4" />
                    Generate Course
                  </>
                )}
              </Button>

              {isGenerating && (
                <p className="text-xs text-center text-muted-foreground">
                  This may take 15-30 seconds while AI creates your personalized course...
                </p>
              )}
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateCourseModal;
