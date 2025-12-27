import { useMemo, useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  ChevronRight,
  ChevronDown,
  FileText,
  CheckCircle2,
  Circle,
  ClipboardList,
  BarChart3,
  Home,
  MessageCircleQuestion,
  Loader2,
  PartyPopper,
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import LessonContent from "@/components/course/LessonContent";
import AssignmentContent from "@/components/course/AssignmentContent";
import CourseChatbot from "@/components/course/CourseChatbot";
import { useAuth } from "@/contexts/AuthContext";
import { useCourseWithModules } from "@/hooks/useCourseData";
import { useLessonProgress } from "@/hooks/useLessonProgress";
import { Button } from "@/components/ui/button";

const CoursePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const { data: course, isLoading: courseLoading, error } = useCourseWithModules(courseId);
  const { 
    completedLessonIds, 
    lastLessonId, 
    markLessonComplete, 
    updateLastLesson,
    isLoading: progressLoading,
    progress,
  } = useLessonProgress(courseId);
  
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [activeAssignmentModuleId, setActiveAssignmentModuleId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const initializedRef = useRef(false);
  const celebratedRef = useRef(false);

  // Trigger confetti when course is completed
  useEffect(() => {
    if (progress >= 100 && !celebratedRef.current && !progressLoading) {
      celebratedRef.current = true;
      setShowCelebration(true);
      
      // Fire confetti
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.8 },
          colors: ['#6366f1', '#8b5cf6', '#a855f7', '#22c55e', '#eab308'],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.8 },
          colors: ['#6366f1', '#8b5cf6', '#a855f7', '#22c55e', '#eab308'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
      
      // Also fire a burst in the center
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#8b5cf6', '#a855f7', '#22c55e', '#eab308'],
        });
      }, 500);
    }
  }, [progress, progressLoading]);

  // Initialize state when course and progress loads
  useEffect(() => {
    if (course && course.modules.length > 0 && !progressLoading && !initializedRef.current) {
      initializedRef.current = true;
      
      // Expand first two modules
      const initialExpanded = course.modules.slice(0, 2).map(m => m.id);
      
      // If user has a last lesson, expand that module too
      if (lastLessonId) {
        const moduleWithLastLesson = course.modules.find(m => 
          m.lessons.some(l => l.id === lastLessonId)
        );
        if (moduleWithLastLesson && !initialExpanded.includes(moduleWithLastLesson.id)) {
          initialExpanded.push(moduleWithLastLesson.id);
        }
        setActiveLesson(lastLessonId);
      } else {
        // Set first lesson as active
        const firstLesson = course.modules[0]?.lessons[0];
        if (firstLesson) {
          setActiveLesson(firstLesson.id);
        }
      }
      
      setExpandedModules(initialExpanded);
    }
  }, [course, progressLoading, lastLessonId]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]
    );
  };

  const allLessons = useMemo(() => 
    course?.modules.flatMap((m) => m.lessons) || [], 
    [course]
  );

  const currentLesson = allLessons.find((l) => l.id === activeLesson);

  const currentModule = course?.modules.find((m) =>
    m.lessons.some((l) => l.id === activeLesson)
  );

  const activeAssignment = activeAssignmentModuleId
    ? { id: activeAssignmentModuleId, title: `${course?.modules.find(m => m.id === activeAssignmentModuleId)?.title} Quiz`, score: null }
    : null;

  const handleNavigate = (
    lessonId: string,
    options?: { completeLessonId?: string }
  ) => {
    if (options?.completeLessonId && allLessons.length > 0) {
      markLessonComplete(options.completeLessonId, allLessons.length);
    }

    setActiveAssignmentModuleId(null);
    setActiveLesson(lessonId);
    updateLastLesson(lessonId);

    const module = course?.modules.find((m) =>
      m.lessons.some((l) => l.id === lessonId)
    );
    if (module) {
      setExpandedModules((prev) => (prev.includes(module.id) ? prev : [...prev, module.id]));
    }
  };

  const openAssignment = (moduleId: string, options?: { completeLessonId?: string }) => {
    if (options?.completeLessonId && allLessons.length > 0) {
      markLessonComplete(options.completeLessonId, allLessons.length);
    }
    setActiveAssignmentModuleId(moduleId);
    if (!expandedModules.includes(moduleId)) {
      setExpandedModules((prev) => [...prev, moduleId]);
    }
  };

  const handleQuizComplete = () => {
    if (!activeAssignmentModuleId || !course) return;
    
    const currentModuleIndex = course.modules.findIndex(m => m.id === activeAssignmentModuleId);
    const nextModule = course.modules[currentModuleIndex + 1];
    
    if (nextModule && nextModule.lessons.length > 0) {
      setActiveAssignmentModuleId(null);
      setActiveLesson(nextModule.lessons[0].id);
      if (!expandedModules.includes(nextModule.id)) {
        setExpandedModules((prev) => [...prev, nextModule.id]);
      }
    } else {
      setActiveAssignmentModuleId(null);
    }
  };

  const handleFinishCourse = () => {
    if (!course || allLessons.length === 0) return;
    const lastModule = course.modules[course.modules.length - 1];
    const lastLesson = lastModule.lessons[lastModule.lessons.length - 1];
    markLessonComplete(lastLesson.id, allLessons.length);
  };

  const isLessonCompleted = (lessonId: string) => completedLessonIds.has(lessonId);

  const isModuleCompleted = (moduleId: string) => {
    const module = course?.modules.find((m) => m.id === moduleId);
    if (!module) return false;
    return module.lessons.every((l) => isLessonCompleted(l.id));
  };

  const isLastLessonInCurrentModule = useMemo(() => {
    if (!currentModule || !currentLesson) return false;
    const lastLesson = currentModule.lessons[currentModule.lessons.length - 1];
    return lastLesson.id === currentLesson.id;
  }, [currentModule, currentLesson]);

  const isLastLessonInCourse = useMemo(() => {
    if (!course || course.modules.length === 0) return false;
    const lastModule = course.modules[course.modules.length - 1];
    const lastLesson = lastModule.lessons[lastModule.lessons.length - 1];
    return currentLesson?.id === lastLesson?.id;
  }, [course, currentLesson]);

  if (authLoading || courseLoading || progressLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Course not found</h2>
          <p className="text-muted-foreground mb-4">This course may have been deleted or doesn't exist.</p>
          <Link to="/courses" className="text-primary hover:underline">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  if (course.modules.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">{course.title}</h2>
          <p className="text-muted-foreground mb-4">This course doesn't have any content yet.</p>
          <Link to="/courses" className="text-primary hover:underline">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`sticky top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-200 ${sidebarCollapsed ? 'w-0 overflow-hidden' : 'w-80'}`}>
        {/* Course header */}
        <div className="p-4 border-b border-sidebar-border">
          <Link to="/courses" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
            <Home className="w-4 h-4" />
            Back to Courses
          </Link>
          <h2 className="font-display font-semibold text-foreground line-clamp-2">
            {course.title}
          </h2>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-2">
          {course.modules.map((module) => (
            <div key={module.id}>
              {/* Module header */}
              <button
                onClick={() => toggleModule(module.id)}
                className="w-full flex items-center gap-2 p-3 rounded-lg hover:bg-sidebar-accent text-left transition-colors"
              >
                {expandedModules.includes(module.id) ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
                <span className="flex-1 text-sm font-medium text-foreground line-clamp-2">
                  {module.title}
                </span>
                {isModuleCompleted(module.id) && (
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                )}
              </button>

              {/* Lessons */}
              {expandedModules.includes(module.id) && (
                <div className="ml-6 space-y-1 mt-1">
                  {module.lessons.map((lesson) => {
                    const completed = isLessonCompleted(lesson.id);

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => handleNavigate(lesson.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                          activeLesson === lesson.id
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-muted-foreground hover:bg-sidebar-accent/50"
                        }`}
                      >
                        {completed ? (
                          <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 shrink-0" />
                        )}
                        <span className="line-clamp-1">{lesson.title}</span>
                      </button>
                    );
                  })}

                  {/* Assignment link */}
                  <button
                    type="button"
                    onClick={() => openAssignment(module.id)}
                    className={
                      "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors " +
                      (activeAssignmentModuleId === module.id
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-muted-foreground hover:bg-sidebar-accent/50")
                    }
                  >
                    <ClipboardList className="w-4 h-4 shrink-0" />
                    <span className="line-clamp-1">{module.title} Quiz</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Performance link */}
        <div className="p-3 border-t border-sidebar-border">
          <Link
            to={`/course/${courseId}/performance`}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-sidebar-accent text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            View Performance Report
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {activeAssignment ? (
          <AssignmentContent
            assignment={activeAssignment}
            onBackToLessons={handleQuizComplete}
          />
        ) : currentLesson ? (
          <LessonContent
            lesson={currentLesson}
            allLessons={allLessons}
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
            sidebarCollapsed={sidebarCollapsed}
            onNavigate={handleNavigate}
            onOpenQuiz={() => currentModule && openAssignment(currentModule.id, { completeLessonId: currentLesson?.id })}
            onFinishCourse={handleFinishCourse}
            isLastLessonInModule={isLastLessonInCurrentModule}
            isLastLessonInCourse={isLastLessonInCourse}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Select a lesson to begin</p>
          </div>
        )}

        {/* Floating chat button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-24 right-6 flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-shadow z-40"
        >
          <MessageCircleQuestion className="w-5 h-5" />
          <span className="font-medium">Have a doubt?</span>
        </motion.button>

        {/* Chatbot panel */}
        <CourseChatbot 
          isOpen={isChatOpen} 
          onClose={() => setIsChatOpen(false)} 
          context={{
            course: course.title,
            lesson: currentLesson?.title,
          }}
        />

        {/* Celebration overlay */}
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setShowCelebration(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-card border border-border rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
                <PartyPopper className="w-10 h-10 text-success" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Congratulations! 🎉
              </h2>
              <p className="text-muted-foreground mb-6">
                You've completed <span className="font-semibold text-foreground">{course.title}</span>! 
                You're one step closer to mastering this topic.
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => setShowCelebration(false)}
                >
                  Keep Reviewing
                </Button>
                <Button
                  onClick={() => navigate("/courses")}
                >
                  Browse More Courses
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default CoursePage;
