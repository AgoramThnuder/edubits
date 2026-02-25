import { forwardRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Menu, Clock, Loader2 } from "lucide-react";
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
  hasQuiz
}, ref) => {
  const { markComplete } = useMarkLessonComplete(courseId);
  const [isCompleting, setIsCompleting] = useState(false);

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

  // Parse content into paragraphs
  const contentParagraphs = lesson.content
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
          className="max-w-3xl mx-auto"
        >
          <div className="notebook-block py-12">
            {/* Lesson title */}
            <h1 className="text-3xl font-display font-semibold text-foreground mb-8">
              {lesson.title}
            </h1>

            {/* Lesson content */}
            <div className="space-y-6">
              {contentParagraphs.map((paragraph, index) => (
                <p key={index} className="text-foreground/90 leading-loose">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Key Takeaway */}
            {contentParagraphs.length > 0 && (
              <div className="bg-primary/5 rounded-lg p-5 border border-primary/20 mt-10">
                <p className="text-sm font-medium text-foreground mb-2">📌 Summary</p>
                <p className="text-foreground/90 leading-relaxed">
                  {contentParagraphs[0].slice(0, 200)}
                  {contentParagraphs[0].length > 200 ? '...' : ''}
                </p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-8 mt-10 border-t border-border">
              <Button
                variant="outline"
                className="gap-2 shrink-0"
                disabled={!previousLesson}
                onClick={() => previousLesson && onNavigate(previousLesson.id)}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <Button
                className="gap-2"
                onClick={handleNext}
                disabled={isCompleting || (!nextLesson && !hasQuiz)}
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
