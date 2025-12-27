import { useState, useEffect, useRef } from "react";
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
  Loader2
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import LessonContent from "@/components/course/LessonContent";
import CourseChatbot from "@/components/course/CourseChatbot";
import { useAuth } from "@/contexts/AuthContext";
import { useLogActivity } from "@/hooks/useActivity";

// Mock course data
const mockCourse = {
  id: "1",
  title: "Introduction to Machine Learning",
  overview: "This course provides a comprehensive introduction to machine learning, covering fundamental concepts, algorithms, and practical applications.",
  outcomes: [
    "Understand the difference between supervised and unsupervised learning",
    "Implement basic ML algorithms from scratch",
    "Evaluate model performance using appropriate metrics",
    "Apply ML techniques to real-world problems",
  ],
  modules: [
    {
      id: "m1",
      title: "Foundations of Machine Learning",
      completed: true,
      lessons: [
        { id: "l1", title: "What is Machine Learning?", completed: true },
        { id: "l2", title: "Types of Machine Learning", completed: true },
        { id: "l3", title: "The ML Workflow", completed: false },
      ],
      assignment: { id: "a1", title: "Module 1 Quiz", score: 85 },
    },
    {
      id: "m2",
      title: "Supervised Learning",
      completed: false,
      lessons: [
        { id: "l4", title: "What is Supervised Learning?", completed: false },
        { id: "l5", title: "Linear Regression", completed: false },
        { id: "l6", title: "Classification Basics", completed: false },
      ],
      assignment: { id: "a2", title: "Module 2 Quiz", score: null },
    },
    {
      id: "m3",
      title: "Unsupervised Learning",
      completed: false,
      lessons: [
        { id: "l7", title: "Clustering Algorithms", completed: false },
        { id: "l8", title: "Dimensionality Reduction", completed: false },
      ],
      assignment: { id: "a3", title: "Module 3 Quiz", score: null },
    },
  ],
};

const CoursePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [expandedModules, setExpandedModules] = useState<string[]>(["m1", "m2"]);
  const [activeLesson, setActiveLesson] = useState("l4");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const logActivity = useLogActivity();
  const startTimeRef = useRef<number>(Date.now());
  const lastLoggedRef = useRef<number>(0);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Track study time when lesson changes or component unmounts
  useEffect(() => {
    startTimeRef.current = Date.now();
    
    // Log initial activity when starting to study
    if (user) {
      logActivity.mutate(0.05); // Log 3 minutes as initial activity
    }
    
    return () => {
      const timeSpent = (Date.now() - startTimeRef.current) / 1000 / 60 / 60; // Convert to hours
      if (timeSpent >= 0.008 && user) { // Only log if spent at least ~30 seconds
        logActivity.mutate(timeSpent);
      }
    };
  }, [activeLesson, user]);

  // Log activity periodically (every 2 minutes)
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      const now = Date.now();
      const timeSpent = (now - startTimeRef.current) / 1000 / 60 / 60;
      if (timeSpent >= 0.03) { // ~2 minutes
        logActivity.mutate(timeSpent);
        startTimeRef.current = now;
      }
    }, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const allLessons = mockCourse.modules.flatMap(m => m.lessons);
  
  const currentLesson = allLessons.find(l => l.id === activeLesson);
  
  // Find the current module's assignment
  const currentModule = mockCourse.modules.find(m => 
    m.lessons.some(l => l.id === activeLesson)
  );
  const currentAssignment = currentModule?.assignment;

  const handleNavigate = (lessonId: string) => {
    setActiveLesson(lessonId);
    // Ensure the module containing the lesson is expanded
    const module = mockCourse.modules.find(m => 
      m.lessons.some(l => l.id === lessonId)
    );
    if (module && !expandedModules.includes(module.id)) {
      setExpandedModules(prev => [...prev, module.id]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
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
            {mockCourse.title}
          </h2>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-2">
          {mockCourse.modules.map((module) => (
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
                      onClick={() => setActiveLesson(lesson.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                        activeLesson === lesson.id
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-muted-foreground hover:bg-sidebar-accent/50"
                      }`}
                    >
                      {lesson.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 shrink-0" />
                      )}
                      <span className="line-clamp-1">{lesson.title}</span>
                    </button>
                  ))}

                  {/* Assignment link */}
                  <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                    <ClipboardList className="w-4 h-4 shrink-0" />
                    <span>{module.assignment.title}</span>
                    {module.assignment.score !== null && (
                      <span className="ml-auto text-xs bg-success/10 text-success px-2 py-0.5 rounded-full">
                        {module.assignment.score}%
                      </span>
                    )}
                  </div>
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
        {/* Lesson content */}
        <LessonContent 
          lesson={currentLesson}
          allLessons={allLessons}
          currentAssignment={currentAssignment}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          sidebarCollapsed={sidebarCollapsed}
          onNavigate={handleNavigate}
        />

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
            course: mockCourse.title,
            lesson: currentLesson?.title,
          }}
        />
      </main>
    </div>
  );
};

export default CoursePage;
