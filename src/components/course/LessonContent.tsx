// =====================================================
// LESSON CONTENT COMPONENT
// =====================================================
// This component displays the main lesson content area.
// Features:
// - Sticky toolbar with breadcrumb navigation
// - Lesson title and content rendered from database
// - Summary card highlighting key points
// - Previous/Next lesson navigation buttons
// =====================================================

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Menu, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

// =====================================================
// TYPE DEFINITIONS
// =====================================================

/**
 * Lesson - Represents lesson data from the database
 * @property id - Unique identifier (UUID)
 * @property title - Lesson title displayed in header
 * @property content - The main lesson text (AI-generated)
 * @property duration_minutes - Estimated reading time
 * @property completed - Whether user has finished this lesson
 */
interface Lesson {
  id: string;
  title: string;
  content: string;
  duration_minutes: number;
  completed: boolean;
}

/**
 * Props for the LessonContent component
 * @property lesson - Current lesson to display (undefined if none selected)
 * @property moduleTitle - Parent module title for breadcrumb
 * @property allLessons - All lessons in course (for prev/next navigation)
 * @property onToggleSidebar - Callback to show/hide sidebar
 * @property sidebarCollapsed - Current sidebar state
 * @property onNavigate - Callback when user clicks prev/next
 */
interface LessonContentProps {
  lesson: Lesson | undefined;
  moduleTitle?: string;
  allLessons: Lesson[];
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
  onNavigate: (lessonId: string) => void;
}

// =====================================================
// MAIN COMPONENT
// =====================================================
// Using forwardRef to allow parent to get a ref to the container
const LessonContent = forwardRef<HTMLDivElement, LessonContentProps>(({ 
  lesson, 
  moduleTitle,
  allLessons, 
  onToggleSidebar, 
  sidebarCollapsed,
  onNavigate 
}, ref) => {
  
  // -------------------------------------------------
  // EMPTY STATE
  // -------------------------------------------------
  // Show placeholder when no lesson is selected
  if (!lesson) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Select a lesson to begin</p>
      </div>
    );
  }

  // -------------------------------------------------
  // NAVIGATION HELPERS
  // -------------------------------------------------
  // Find current lesson position and determine prev/next lessons
  const currentIndex = allLessons.findIndex(l => l.id === lesson.id);
  const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  // -------------------------------------------------
  // CONTENT PARSING
  // -------------------------------------------------
  // Split the lesson content into paragraphs for better readability.
  // The AI generates content as plain text with double newlines
  // between paragraphs, so we split on those.
  const contentParagraphs = lesson.content
    .split(/\n\n+/)           // Split on 2+ newlines
    .map(p => p.trim())        // Remove extra whitespace
    .filter(p => p.length > 0); // Remove empty paragraphs

  // =====================================================
  // RENDER
  // =====================================================
  return (
    <div ref={ref} className="min-h-screen">
      {/* ============================================= */}
      {/* STICKY TOOLBAR - Breadcrumb & Duration */}
      {/* ============================================= */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Sidebar toggle button */}
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5 text-muted-foreground" />
          </button>
          
          {/* Breadcrumb: Module > Lesson */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{moduleTitle || "Module"}</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium">{lesson.title}</span>
          </div>
          
          {/* Duration badge (right side) */}
          <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{lesson.duration_minutes} min</span>
          </div>
        </div>
      </div>

      {/* ============================================= */}
      {/* NOTEBOOK CONTENT AREA */}
      {/* ============================================= */}
      {/* Uses notebook-paper class for lined paper effect */}
      <div className="notebook-paper min-h-[calc(100vh-60px)]">
        <motion.div
          key={lesson.id}  // Key change triggers animation on lesson switch
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-3xl mx-auto"
        >
          <div className="notebook-block py-12">
            
            {/* --------------------------------------------- */}
            {/* LESSON TITLE */}
            {/* --------------------------------------------- */}
            <h1 className="text-3xl font-display font-semibold text-foreground mb-8">
              {lesson.title}
            </h1>

            {/* --------------------------------------------- */}
            {/* LESSON CONTENT - Rendered as Paragraphs */}
            {/* --------------------------------------------- */}
            {/* Each paragraph from the AI content is displayed 
                as a separate <p> element with good spacing */}
            <div className="space-y-6">
              {contentParagraphs.map((paragraph, index) => (
                <p key={index} className="text-foreground/90 leading-loose">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* --------------------------------------------- */}
            {/* SUMMARY CARD */}
            {/* --------------------------------------------- */}
            {/* Shows a brief summary using the first paragraph */}
            {contentParagraphs.length > 0 && (
              <div className="bg-primary/5 rounded-lg p-5 border border-primary/20 mt-10">
                <p className="text-sm font-medium text-foreground mb-2">📌 Summary</p>
                <p className="text-foreground/90 leading-relaxed">
                  {/* Truncate first paragraph to 200 chars for summary */}
                  {contentParagraphs[0].slice(0, 200)}
                  {contentParagraphs[0].length > 200 ? '...' : ''}
                </p>
              </div>
            )}

            {/* --------------------------------------------- */}
            {/* NAVIGATION BUTTONS - Previous/Next Lesson */}
            {/* --------------------------------------------- */}
            <div className="flex items-center justify-between pt-8 mt-10 border-t border-border">
              {/* Previous Lesson Button */}
              <Button 
                variant="outline" 
                className="gap-2"
                disabled={!previousLesson}  // Disabled on first lesson
                onClick={() => previousLesson && onNavigate(previousLesson.id)}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous Lesson
              </Button>
              
              {/* Next Lesson Button */}
              <Button 
                className="gap-2"
                disabled={!nextLesson}  // Disabled on last lesson
                onClick={() => nextLesson && onNavigate(nextLesson.id)}
              >
                Next Lesson
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
});

// Display name for React DevTools
LessonContent.displayName = "LessonContent";

export default LessonContent;
