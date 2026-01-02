// =====================================================
// COURSE PAGE COMPONENT
// =====================================================
// This is the main course learning page where users study lessons.
// Features:
// - Collapsible sidebar with modules and lessons navigation
// - Lesson content display area with real AI-generated content
// - Study time tracking (logged to database)
// - AI chatbot for asking questions about the lesson
// =====================================================

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { 
  ChevronRight, 
  ChevronDown,
  CheckCircle2,
  Circle,
  BarChart3,
  Home,
  MessageCircleQuestion,
  Loader2
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import LessonContent from "@/components/course/LessonContent";
import CourseChatbot from "@/components/course/CourseChatbot";
import { useAuth } from "@/contexts/AuthContext";
import { useLogActivity } from "@/hooks/useActivity";
import { useCourseDetails } from "@/hooks/useCourseDetails";

// =====================================================
// MAIN COMPONENT
// =====================================================
const CoursePage = () => {
  // -------------------------------------------------
  // URL PARAMETERS & NAVIGATION
  // -------------------------------------------------
  // Get the courseId from the URL (e.g., /course/abc-123)
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  // -------------------------------------------------
  // AUTHENTICATION & DATA FETCHING
  // -------------------------------------------------
  // Get current user and check if still loading auth state
  const { user, loading: authLoading } = useAuth();
  // Fetch complete course data (course, modules, lessons)
  const { data: course, isLoading: courseLoading } = useCourseDetails(courseId);
  
  // -------------------------------------------------
  // LOCAL STATE
  // -------------------------------------------------
  // Track which modules are expanded in the sidebar
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  // Track the currently selected/active lesson
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  // Whether the AI chatbot panel is open
  const [isChatOpen, setIsChatOpen] = useState(false);
  // Whether the sidebar is collapsed (hidden)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // -------------------------------------------------
  // ACTIVITY TRACKING
  // -------------------------------------------------
  // Hook to log study time to the database
  const logActivity = useLogActivity();
  // Reference to track when the user started viewing current lesson
  const startTimeRef = useRef<number>(Date.now());

  // -------------------------------------------------
  // EFFECT: REDIRECT UNAUTHENTICATED USERS
  // -------------------------------------------------
  // If user is not logged in, redirect to auth page
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // -------------------------------------------------
  // EFFECT: INITIALIZE SIDEBAR & ACTIVE LESSON
  // -------------------------------------------------
  // When course data loads, expand first two modules and
  // select the first lesson by default
  useEffect(() => {
    if (course && course.modules.length > 0) {
      // Expand first two modules for better UX
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

  // -------------------------------------------------
  // EFFECT: TRACK STUDY TIME ON LESSON CHANGE
  // -------------------------------------------------
  // Log activity when user switches to a new lesson
  // Also logs when component unmounts (user leaves page)
  useEffect(() => {
    if (!activeLesson || !user) return;
    
    // Reset timer and log initial activity (3 minutes = 0.05 hours)
    startTimeRef.current = Date.now();
    logActivity.mutate(0.05);
    
    // Cleanup: log time spent when leaving this lesson
    return () => {
      const timeSpent = (Date.now() - startTimeRef.current) / 1000 / 60 / 60; // Convert ms to hours
      // Only log if user spent at least 30 seconds (0.008 hours)
      if (timeSpent >= 0.008 && user) {
        logActivity.mutate(timeSpent);
      }
    };
  }, [activeLesson, user]);

  // -------------------------------------------------
  // EFFECT: PERIODIC ACTIVITY LOGGING
  // -------------------------------------------------
  // Log activity every 2 minutes while user is studying
  // This ensures we don't lose data if user stays on one lesson
  useEffect(() => {
    if (!user || !activeLesson) return;
    
    const interval = setInterval(() => {
      const now = Date.now();
      const timeSpent = (now - startTimeRef.current) / 1000 / 60 / 60;
      // Log if at least 2 minutes (0.03 hours) have passed
      if (timeSpent >= 0.03) {
        logActivity.mutate(timeSpent);
        startTimeRef.current = now; // Reset timer after logging
      }
    }, 2 * 60 * 1000); // Check every 2 minutes

    return () => clearInterval(interval);
  }, [user, activeLesson]);

  // -------------------------------------------------
  // HANDLER: TOGGLE MODULE EXPAND/COLLAPSE
  // -------------------------------------------------
  // Toggle a module's expanded state in the sidebar
  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)  // Collapse if expanded
        : [...prev, moduleId]                  // Expand if collapsed
    );
  };

  // -------------------------------------------------
  // HANDLER: NAVIGATE TO LESSON
  // -------------------------------------------------
  // Called when user clicks Previous/Next or selects a lesson
  // Also ensures the containing module is expanded
  const handleNavigate = (lessonId: string) => {
    setActiveLesson(lessonId);
    
    // Find and expand the module containing this lesson
    if (course) {
      const module = course.modules.find(m => 
        m.lessons.some(l => l.id === lessonId)
      );
      if (module && !expandedModules.includes(module.id)) {
        setExpandedModules(prev => [...prev, module.id]);
      }
    }
  };

  // -------------------------------------------------
  // LOADING STATE
  // -------------------------------------------------
  // Show spinner while checking auth or fetching course
  if (authLoading || courseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // -------------------------------------------------
  // NOT AUTHENTICATED
  // -------------------------------------------------
  // Return null while redirecting to auth page
  if (!user) {
    return null;
  }

  // -------------------------------------------------
  // COURSE NOT FOUND
  // -------------------------------------------------
  // Show message if course doesn't exist or failed to load
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

  // -------------------------------------------------
  // PREPARE DATA FOR RENDERING
  // -------------------------------------------------
  // Flatten all lessons into a single array for navigation
  const allLessons = course.modules.flatMap(m => m.lessons);
  // Find the currently active lesson object
  const currentLesson = allLessons.find(l => l.id === activeLesson);
  // Find the module containing the active lesson
  const currentModule = course.modules.find(m => 
    m.lessons.some(l => l.id === activeLesson)
  );

  // =====================================================
  // RENDER
  // =====================================================
  return (
    <div className="min-h-screen bg-background flex">
      {/* ============================================= */}
      {/* SIDEBAR - Course Navigation */}
      {/* ============================================= */}
      <aside className={`sticky top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-200 ${sidebarCollapsed ? 'w-0 overflow-hidden' : 'w-80'}`}>
        
        {/* --------------------------------------------- */}
        {/* SIDEBAR HEADER - Course Title & Back Link */}
        {/* --------------------------------------------- */}
        <div className="p-4 border-b border-sidebar-border">
          {/* Back to courses link */}
          <Link to="/courses" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
            <Home className="w-4 h-4" />
            Back to Courses
          </Link>
          {/* Course title */}
          <h2 className="font-display font-semibold text-foreground line-clamp-2">
            {course.title}
          </h2>
        </div>

        {/* --------------------------------------------- */}
        {/* SIDEBAR NAV - Modules & Lessons List */}
        {/* --------------------------------------------- */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-2">
          {course.modules.map((module) => (
            <div key={module.id}>
              {/* Module Header (clickable to expand/collapse) */}
              <button
                onClick={() => toggleModule(module.id)}
                className="w-full flex items-center gap-2 p-3 rounded-lg hover:bg-sidebar-accent text-left transition-colors"
              >
                {/* Expand/Collapse icon */}
                {expandedModules.includes(module.id) ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
                {/* Module title */}
                <span className="flex-1 text-sm font-medium text-foreground line-clamp-2">
                  {module.title}
                </span>
                {/* Completion checkmark (shown when all lessons completed) */}
                {module.completed && (
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                )}
              </button>

              {/* Lessons List (shown when module is expanded) */}
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
                      {/* Completion status icon */}
                      {lesson.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 shrink-0" />
                      )}
                      {/* Lesson title */}
                      <span className="line-clamp-1">{lesson.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* --------------------------------------------- */}
        {/* SIDEBAR FOOTER - Performance Report Link */}
        {/* --------------------------------------------- */}
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

      {/* ============================================= */}
      {/* MAIN CONTENT AREA */}
      {/* ============================================= */}
      <main className="flex-1 min-w-0">
        {/* Lesson Content Display */}
        <LessonContent 
          lesson={currentLesson}
          moduleTitle={currentModule?.title}
          allLessons={allLessons}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          sidebarCollapsed={sidebarCollapsed}
          onNavigate={handleNavigate}
        />

        {/* --------------------------------------------- */}
        {/* FLOATING CHAT BUTTON */}
        {/* --------------------------------------------- */}
        {/* Opens the AI chatbot when clicked */}
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

        {/* --------------------------------------------- */}
        {/* AI CHATBOT PANEL */}
        {/* --------------------------------------------- */}
        {/* Slide-in panel for asking questions about the lesson */}
        <CourseChatbot 
          isOpen={isChatOpen} 
          onClose={() => setIsChatOpen(false)} 
          context={{
            course: course.title,                    // Course name for context
            lesson: currentLesson?.title,            // Current lesson name
            lessonContent: currentLesson?.content,   // Lesson content for AI reference
          }}
        />
      </main>
    </div>
  );
};

export default CoursePage;
