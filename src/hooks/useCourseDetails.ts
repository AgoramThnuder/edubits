// =====================================================
// USE COURSE DETAILS HOOK
// =====================================================
// This custom React hook fetches complete course data from the database
// including the course info, all modules, all lessons, and completion status.
// It uses React Query for efficient caching and automatic refetching.
// =====================================================

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// =====================================================
// TYPE DEFINITIONS
// =====================================================
// These interfaces define the shape of our data structures.
// TypeScript uses these to ensure type safety throughout the app.

/**
 * Lesson - Represents a single lesson within a module
 * @property id - Unique identifier (UUID)
 * @property title - Lesson title shown in sidebar and content
 * @property content - The actual lesson text/content
 * @property duration_minutes - Estimated time to complete
 * @property order_index - Position within the module (0, 1, 2...)
 * @property completed - Whether the user has completed this lesson
 */
export interface Lesson {
  id: string;
  title: string;
  content: string;
  duration_minutes: number;
  order_index: number;
  completed: boolean;
}

/**
 * Module - Represents a group of related lessons
 * @property id - Unique identifier (UUID)
 * @property title - Module title shown in sidebar
 * @property order_index - Position within the course (0, 1, 2...)
 * @property lessons - Array of lessons in this module
 * @property completed - True if ALL lessons in this module are completed
 */
export interface Module {
  id: string;
  title: string;
  order_index: number;
  lessons: Lesson[];
  completed: boolean;
}

/**
 * CourseDetails - Complete course data with nested modules and lessons
 * @property id - Unique identifier (UUID)
 * @property title - Course title (e.g., "C++ Programming Fundamentals")
 * @property description - Brief course description
 * @property duration_hours - Total estimated time for the course
 * @property total_lessons - Total number of lessons across all modules
 * @property modules - Array of modules with their lessons
 */
export interface CourseDetails {
  id: string;
  title: string;
  description: string | null;
  duration_hours: number | null;
  total_lessons: number | null;
  modules: Module[];
}

// =====================================================
// MAIN HOOK: useCourseDetails
// =====================================================
/**
 * Fetches complete course data including modules, lessons, and completion status.
 * 
 * @param courseId - The UUID of the course to fetch
 * @returns React Query result with course data, loading state, and error state
 * 
 * @example
 * const { data: course, isLoading, error } = useCourseDetails(courseId);
 * if (isLoading) return <Spinner />;
 * if (!course) return <NotFound />;
 * return <CourseDisplay course={course} />;
 */
export const useCourseDetails = (courseId: string | undefined) => {
  // Get current user from auth context (needed for completion status)
  const { user } = useAuth();

  return useQuery({
    // -------------------------------------------------
    // QUERY KEY
    // -------------------------------------------------
    // Unique key for caching. React Query will refetch if any
    // of these values change (courseId or user.id).
    queryKey: ["course-details", courseId, user?.id],
    
    // -------------------------------------------------
    // QUERY FUNCTION
    // -------------------------------------------------
    // This async function fetches all the data we need.
    queryFn: async (): Promise<CourseDetails | null> => {
      // Return null if no courseId provided (prevents unnecessary fetches)
      if (!courseId) return null;

      // -------------------------------------------------
      // FETCH 1: GET COURSE
      // -------------------------------------------------
      // Fetch the main course record from the "courses" table
      const { data: course, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)    // Filter by course ID
        .single();             // Expect exactly one result

      if (courseError || !course) {
        console.error("Error fetching course:", courseError);
        return null;
      }

      // -------------------------------------------------
      // FETCH 2: GET MODULES
      // -------------------------------------------------
      // Fetch all modules that belong to this course
      // Ordered by order_index so they display in correct order
      const { data: modules, error: modulesError } = await supabase
        .from("modules")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index");    // Sort: 0, 1, 2, 3...

      if (modulesError) {
        console.error("Error fetching modules:", modulesError);
        return null;
      }

      // -------------------------------------------------
      // FETCH 3: GET ALL LESSONS
      // -------------------------------------------------
      // Fetch all lessons for the modules we just retrieved.
      // We use .in() to get lessons for multiple modules in one query.
      const moduleIds = modules?.map((m) => m.id) || [];
      let lessons: any[] = [];
      
      if (moduleIds.length > 0) {
        const { data: lessonsData, error: lessonsError } = await supabase
          .from("lessons")
          .select("*")
          .in("module_id", moduleIds)   // Get lessons for these modules
          .order("order_index");         // Sort within each module

        if (lessonsError) {
          console.error("Error fetching lessons:", lessonsError);
        } else {
          lessons = lessonsData || [];
        }
      }

      // -------------------------------------------------
      // FETCH 4: GET USER'S COMPLETION STATUS
      // -------------------------------------------------
      // Check which lessons the current user has completed.
      // This is stored in the "lesson_completions" table.
      let completedLessonIds: string[] = [];
      if (user) {
        const { data: completions } = await supabase
          .from("lesson_completions")
          .select("lesson_id")
          .eq("user_id", user.id)
          .eq("course_id", courseId);

        // Extract just the lesson IDs into an array
        completedLessonIds = completions?.map((c) => c.lesson_id) || [];
      }

      // -------------------------------------------------
      // BUILD NESTED STRUCTURE
      // -------------------------------------------------
      // Organize the flat data into a nested structure:
      // Course → Modules → Lessons
      const modulesWithLessons: Module[] = (modules || []).map((module) => {
        // Filter lessons to get only those belonging to this module
        const moduleLessons = lessons
          .filter((l) => l.module_id === module.id)
          .map((l) => ({
            id: l.id,
            title: l.title,
            content: l.content,
            duration_minutes: l.duration_minutes || 5,
            order_index: l.order_index,
            // Check if this lesson is in the completed list
            completed: completedLessonIds.includes(l.id),
          }));

        // A module is "completed" only if ALL its lessons are completed
        const allLessonsCompleted = moduleLessons.length > 0 && moduleLessons.every((l) => l.completed);

        return {
          id: module.id,
          title: module.title,
          order_index: module.order_index,
          lessons: moduleLessons,
          completed: allLessonsCompleted,
        };
      });

      // -------------------------------------------------
      // RETURN COMPLETE COURSE DATA
      // -------------------------------------------------
      return {
        id: course.id,
        title: course.title,
        description: course.description,
        duration_hours: course.duration_hours,
        total_lessons: course.total_lessons,
        modules: modulesWithLessons,
      };
    },
    
    // -------------------------------------------------
    // QUERY OPTIONS
    // -------------------------------------------------
    // Only run the query if courseId exists
    // This prevents unnecessary API calls with undefined ID
    enabled: !!courseId,
  });
};
