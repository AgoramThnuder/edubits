import { forwardRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Menu, ClipboardList, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Lesson {
  id: string;
  title: string;
  completed: boolean;
}

interface LessonContentProps {
  lesson: Lesson | undefined;
  allLessons: Lesson[];
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
  onNavigate: (lessonId: string, options?: { completeLessonId?: string }) => void;
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
            <span>Supervised Learning</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium">{lesson.title}</span>
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

            {/* Subtopic 1 */}
            <section className="mb-10">
              <h2 className="text-xl font-display font-medium text-foreground mb-4">
                Understanding the Concept
              </h2>
              <p className="text-foreground/90 leading-loose mb-4">
                Supervised learning is a type of machine learning where the algorithm learns from 
                <span className="text-highlight font-medium"> labeled training data</span>. 
                The goal is to learn a mapping from inputs to outputs based on example input-output pairs.
              </p>
              <p className="text-foreground/90 leading-loose">
                Think of it like learning with a teacher who provides correct answers during practice. 
                The algorithm uses these examples to find patterns and make predictions on new, unseen data.
              </p>
            </section>

            {/* Key Insight */}
            <div className="bg-accent/40 rounded-lg p-5 mb-10 border-l-4 border-primary">
              <p className="text-sm font-medium text-foreground mb-1">💡 Key Insight</p>
              <p className="text-muted-foreground leading-relaxed">
                The "supervision" comes from the labels in the training data. Without labels, 
                the algorithm wouldn't know what correct outputs look like.
              </p>
            </div>

            {/* Subtopic 2 */}
            <section className="mb-10">
              <h2 className="text-xl font-display font-medium text-foreground mb-4">
                Two Main Types
              </h2>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-card border border-border">
                  <h3 className="font-medium text-foreground mb-2">Classification</h3>
                  <p className="text-sm text-muted-foreground">
                    Predict a category or class. Example: Is this email spam or not spam?
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border">
                  <h3 className="font-medium text-foreground mb-2">Regression</h3>
                  <p className="text-sm text-muted-foreground">
                    Predict a continuous value. Example: What will be the house price?
                  </p>
                </div>
              </div>
            </section>

            {/* Examples */}
            <section className="mb-10">
              <h2 className="text-xl font-display font-medium text-foreground mb-4">
                Real-World Examples
              </h2>
              <ul className="space-y-3 text-foreground/90">
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1 font-bold">•</span>
                  <span><strong>Email spam detection</strong> — Classify emails as spam or not spam</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1 font-bold">•</span>
                  <span><strong>House price prediction</strong> — Predict price based on features like size, location</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1 font-bold">•</span>
                  <span><strong>Medical diagnosis</strong> — Predict disease probability from symptoms</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1 font-bold">•</span>
                  <span><strong>Credit scoring</strong> — Predict whether a loan applicant will default</span>
                </li>
              </ul>
            </section>

            {/* Quick Check */}
            <div className="bg-secondary rounded-lg p-5 mb-10">
              <p className="text-sm font-medium text-foreground mb-3">🧠 Quick Check</p>
              <p className="text-muted-foreground mb-4">
                If you're predicting customer churn (will leave or stay), is this classification or regression?
              </p>
              <details className="group">
                <summary className="text-sm text-primary cursor-pointer hover:underline">
                  Reveal Answer
                </summary>
                <p className="mt-2 text-sm text-muted-foreground">
                  This is <strong>classification</strong> because you're predicting a category (leave or stay), 
                  not a continuous number.
                </p>
              </details>
            </div>

            {/* Key Takeaway */}
            <div className="bg-primary/5 rounded-lg p-5 border border-primary/20 mb-10">
              <p className="text-sm font-medium text-foreground mb-2">📌 Key Takeaway</p>
              <p className="text-foreground/90 leading-relaxed">
                Supervised learning uses labeled data to teach algorithms. The two main tasks are 
                <strong> classification</strong> (predicting categories) and <strong>regression</strong> (predicting numbers).
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
                <Button 
                  className="gap-2"
                  onClick={() => {
                    onFinishCourse();
                  }}
                >
                  <Trophy className="w-4 h-4" />
                  Finish Course
                </Button>
              ) : isLastLessonInModule ? (
                <Button 
                  className="gap-2"
                  onClick={() => {
                    onOpenQuiz();
                  }}
                >
                  <ClipboardList className="w-4 h-4" />
                  Attend Quiz
                </Button>
              ) : (
                <Button 
                  className="gap-2"
                  disabled={!nextLesson}
                  onClick={() =>
                    nextLesson && onNavigate(nextLesson.id, { completeLessonId: lesson.id })
                  }
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
