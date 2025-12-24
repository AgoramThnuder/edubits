import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

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

    // Simulate course generation (in real app, this would call AI)
    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: "Course created!",
        description: `Your mini-course on "${topic}" is ready.`,
      });
      onClose();
      navigate("/course/1");
    }, 2000);
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
                className="p-2 rounded-lg hover:bg-muted transition-colors"
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
                      className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200 ${
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
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateCourseModal;
