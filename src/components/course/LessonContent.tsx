import { forwardRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Menu, ClipboardList, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Lesson {
  id: string;
  title: string;
  content?: string;
  duration_minutes?: number;
}

interface LessonContentProps {
  lesson: Lesson | undefined;
  allLessons: Lesson[];
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
  onNavigate: (lessonId: string, options?: {
    completeLessonId?: string;
  }) => void;
  onOpenQuiz: () => void;
  onFinishCourse: () => void;
  isLastLessonInModule: boolean;
  isLastLessonInCourse: boolean;
}

const LessonContent = forwardRef<HTMLDivElement, LessonContentProps>(({
  lesson,
  allLessons,
  onToggleSidebar,
  sidebarCollapsed,
  onNavigate,
  onOpenQuiz,
  onFinishCourse,
  isLastLessonInModule,
  isLastLessonInCourse
}, ref) => {
  if (!lesson) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Select a lesson to begin</p>
      </div>
    );
  }

  const currentIndex = allLessons.findIndex(l => l.id === lesson.id);
  const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  // Split content into paragraphs for better display
  const contentParagraphs = lesson.content?.split('\n').filter(p => p.trim()) || [];

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
            <span>Lesson {currentIndex + 1} of {allLessons.length}</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium">{lesson.title}</span>
          </div>
          {lesson.duration_minutes && (
            <span className="ml-auto text-sm text-muted-foreground">
              ~{lesson.duration_minutes} min
            </span>
          )}
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
            {contentParagraphs.length > 0 ? (
              <div className="prose prose-lg max-w-none">
                {contentParagraphs.map((paragraph, index) => (
                  <p key={index} className="text-foreground/90 leading-loose mb-6">
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : (
              <div className="space-y-8">
                {/* Default content when no AI-generated content */}
                <section className="mb-10">
                  <h2 className="text-xl font-display font-medium text-foreground mb-4">
                    Understanding the Concept
                  </h2>
                  <p className="text-foreground/90 leading-loose mb-4">
                    This lesson covers important concepts that will help you understand the topic better.
                    Take your time to read through and make notes.
                  </p>
                </section>

                <div className="bg-accent/40 rounded-lg p-5 mb-10 border-l-4 border-primary">
                  <p className="text-sm font-medium text-foreground mb-1">💡 Tip</p>
                  <p className="text-muted-foreground leading-relaxed">
                    Create a course with AI to get detailed, personalized lesson content.
                  </p>
                </div>
              </div>
            )}

            {/* Key Takeaway */}
            <div className="bg-primary/5 rounded-lg p-5 border border-primary/20 mb-10 mt-10">
              <p className="text-sm font-medium text-foreground mb-2">📌 Key Takeaway</p>
              <p className="text-foreground/90 leading-relaxed">
                Make sure you understand the core concepts before moving to the next lesson. 
                Use the quiz at the end of each module to test your understanding.
              </p>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-8 border-t border-border">
              <Button 
                variant="outline" 
                className="gap-2" 
                disabled={!previousLesson} 
                onClick={() => previousLesson && onNavigate(previousLesson.id)}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous Lesson
              </Button>
              
              {isLastLessonInCourse ? (
                <Button className="gap-2" onClick={() => onFinishCourse()}>
                  <Trophy className="w-4 h-4" />
                  Finish Course
                </Button>
              ) : isLastLessonInModule ? (
                <Button className="gap-2" onClick={() => onOpenQuiz()}>
                  <ClipboardList className="w-4 h-4" />
                  Attend Quiz
                </Button>
              ) : (
                <Button 
                  className="gap-2" 
                  disabled={!nextLesson} 
                  onClick={() => nextLesson && onNavigate(nextLesson.id, { completeLessonId: lesson.id })}
                >
                  Next Lesson
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
});

LessonContent.displayName = "LessonContent";
export default LessonContent;
