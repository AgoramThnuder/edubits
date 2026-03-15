import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Circle,
  BarChart3,
  Home,
  Loader2,
  Trophy
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import LessonContent from "@/components/course/LessonContent";
import CourseChatbot, { Message } from "@/components/course/CourseChatbot";
import CourseQuiz from "@/components/course/CourseQuiz";
import CreateCourseModal from "@/components/dashboard/CreateCourseModal";
import { useAuth } from "@/contexts/AuthContext";
import { useLogActivity } from "@/hooks/useActivity";
import { useCourseDetails } from "@/hooks/useCourseDetails";

const CoursePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: course, isLoading: courseLoading } = useCourseDetails(courseId);

  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [isTakingQuiz, setIsTakingQuiz] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [nextCourseInfo, setNextCourseInfo] = useState({ topic: "", difficulty: "beginner" });

  // Store chat messages keyed by lesson ID — load from localStorage so history survives page reloads
  const STORAGE_KEY = `chat_histories_${courseId}`;
  const [chatHistories, setChatHistories] = useState<Record<string, Message[]>>(() => {
    try {
      const stored = localStorage.getItem(`chat_histories_${courseId}`);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Persist chatHistories to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chatHistories));
    } catch {
      // ignore storage errors (e.g. private mode quota exceeded)
    }
  }, [chatHistories, STORAGE_KEY]);

  const logActivity = useLogActivity();
  const startTimeRef = useRef<number>(Date.now());

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Set initial expanded modules and active lesson when course loads
  useEffect(() => {
    if (course && course.modules.length > 0) {
      // Expand first two modules by default
      const initialExpanded = course.modules.slice(0, 2).map(m => m.id);
      setExpandedModules(initialExpanded);

      // Set first lesson as active if none selected
      if (!activeLesson) {
        const firstLesson = course.modules[0]?.lessons[0];
        if (firstLesson) {
          setActiveLesson(firstLesson.id);
        }
      }
    }
  }, [course]);

  // Track study time when lesson changes or component unmounts
  useEffect(() => {
    if (!activeLesson || !user) return;

    startTimeRef.current = Date.now();
    logActivity.mutate(0.05); // Log 3 minutes as initial activity

    return () => {
      const timeSpent = (Date.now() - startTimeRef.current) / 1000 / 60 / 60;
      if (timeSpent >= 0.008 && user) {
        logActivity.mutate(timeSpent);
      }
    };
  }, [activeLesson, user]);

  // Log activity periodically (every 2 minutes)
  useEffect(() => {
    if (!user || !activeLesson) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const timeSpent = (now - startTimeRef.current) / 1000 / 60 / 60;
      if (timeSpent >= 0.03) {
        logActivity.mutate(timeSpent);
        startTimeRef.current = now;
      }
    }, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user, activeLesson]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleNavigate = (lessonId: string) => {
    setActiveLesson(lessonId);
    setIsTakingQuiz(false);
    // Ensure the module containing the lesson is expanded
    if (course) {
      const module = course.modules.find(m =>
        m.lessons.some(l => l.id === lessonId)
      );
      if (module && !expandedModules.includes(module.id)) {
        setExpandedModules(prev => [...prev, module.id]);
      }
    }
  };

  const handleGenerateNextCourse = () => {
    if (!course) return;
    
    // Attempt to guess the previous topic and next difficulty
    let nextDiff = "beginner";
    let baseTopic = course.title;
    
    const lowerTitle = course.title.toLowerCase();
    if (lowerTitle.includes("beginner")) {
      nextDiff = "intermediate";
      baseTopic = course.title.replace(/beginner/i, "").trim();
    } else if (lowerTitle.includes("intermediate")) {
      nextDiff = "advanced";
      baseTopic = course.title.replace(/intermediate/i, "").trim();
    } else if (lowerTitle.includes("advanced")) {
       // if they finished advanced, maybe let them pick a new topic or difficulty freely
      nextDiff = "advanced";
      baseTopic = course.title.replace(/advanced/i, "").trim();
    }
    
    // Clean up trailing dashes or colons
    baseTopic = baseTopic.replace(/^[-:\s]+|[-:\s]+$/g, "");

    setNextCourseInfo({ topic: baseTopic, difficulty: nextDiff });
    setIsCreateModalOpen(true);
  };

  // Loading state
  if (authLoading || courseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // No course found
  if (!course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <p className="text-muted-foreground">Course not found or still loading...</p>
        <Link to="/courses" className="text-primary hover:underline">
          Back to Courses
        </Link>
      </div>
    );
  }

  // Get all lessons flattened
  const allLessons = course.modules.flatMap(m => m.lessons);
  const currentLesson = allLessons.find(l => l.id === activeLesson);
  const currentModule = course.modules.find(m =>
    m.lessons.some(l => l.id === activeLesson)
  );

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
                {module.completed && (
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                )}
              </button>

              {/* Lessons */}
              {expandedModules.includes(module.id) && (
                <div className="ml-6 space-y-1 mt-1">
                  {module.lessons.map((lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => handleNavigate(lesson.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors ${activeLesson === lesson.id && !isTakingQuiz
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-muted-foreground hover:bg-sidebar-accent/50"
                        }`}
                    >
                      {lesson.title === "Module Quiz" ? (
                         <div className="w-4 h-4 shrink-0 flex items-center justify-center bg-primary/20 rounded-full">
                           <span className="text-[10px] select-none text-primary font-bold">?</span>
                         </div>
                      ) : lesson.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 shrink-0" />
                      )}
                      <span className={`line-clamp-1 ${lesson.title === "Module Quiz" ? "text-primary font-medium" : ""}`}>{lesson.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {course.quiz && course.quiz.questions.length > 0 && (
            <div className="mt-4 pt-4 border-t border-sidebar-border/50">
              <button
                onClick={() => setIsTakingQuiz(true)}
                className={`w-full flex items-center gap-2 px-3 py-3 rounded-lg text-left text-sm font-medium transition-colors ${isTakingQuiz
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                  }`}
              >
                <Trophy className="w-4 h-4 shrink-0" />
                <span>Final Quiz</span>
              </button>
            </div>
          )}
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
        {/* Lesson content or Quiz */}
        {isTakingQuiz && course.quiz ? (
          <CourseQuiz
            quiz={course.quiz}
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
            onFinish={(score, total) => {
              // Note: Normally we would record this completion to the DB here
              console.log("Quiz finished with score", score, "/", total);
            }}
            onGenerateNextCourse={handleGenerateNextCourse}
          />
        ) : (
          <LessonContent
            courseId={course.id}
            lesson={currentLesson}
            moduleTitle={currentModule?.title}
            allLessons={allLessons}
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
            sidebarCollapsed={sidebarCollapsed}
            onNavigate={handleNavigate}
            onTakeQuiz={() => setIsTakingQuiz(true)}
            hasQuiz={!!(course.quiz && course.quiz.questions.length > 0)}
            onOpenChat={() => setIsChatOpen(true)}
          />
        )}

        {/* Chatbot panel */}
        {(() => {
          const contextKey = currentLesson?.id || "course";
          const currentMessages = chatHistories[contextKey] || [
            {
              id: "1",
              role: "assistant",
              content: `I'm here to help you understand "${currentLesson?.title || course.title}". What would you like to know?`,
            },
          ];

          return (
            <CourseChatbot
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
              context={{
                course: course.title,
                lesson: currentLesson?.title,
                lessonContent: currentLesson?.content,
              }}
              messages={currentMessages}
              setMessages={(newMessages) => {
                setChatHistories(prev => {
                  const currentHistory = prev[contextKey] || [
                    {
                      id: "1",
                      role: "assistant",
                      content: `I'm here to help you understand "${currentLesson?.title || course.title}". What would you like to know?`,
                    },
                  ];
                  
                  // If it's a function (like prev => [...prev, newMsg]), pass the specific array
                  const updatedHistory = typeof newMessages === 'function' 
                    ? newMessages(currentHistory) 
                    : newMessages;
                    
                  return {
                    ...prev,
                    [contextKey]: updatedHistory
                  };
                });
              }}
            />
          );
        })()}

        {/* Generate Next Course Modal */}
        <CreateCourseModal 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)} 
          initialTopic={nextCourseInfo.topic}
          initialDifficulty={nextCourseInfo.difficulty}
        />
      </main>
    </div>
  );
};

export default CoursePage;
