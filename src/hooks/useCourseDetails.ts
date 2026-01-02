import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Lesson {
  id: string;
  title: string;
  content: string;
  duration_minutes: number;
  order_index: number;
  completed: boolean;
}

export interface Module {
  id: string;
  title: string;
  order_index: number;
  lessons: Lesson[];
  completed: boolean;
}

export interface CourseDetails {
  id: string;
  title: string;
  description: string | null;
  duration_hours: number | null;
  total_lessons: number | null;
  modules: Module[];
}

export const useCourseDetails = (courseId: string | undefined) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["course-details", courseId, user?.id],
    queryFn: async (): Promise<CourseDetails | null> => {
      if (!courseId) return null;

      // Fetch course
      const { data: course, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single();

      if (courseError || !course) {
        console.error("Error fetching course:", courseError);
        return null;
      }

      // Fetch modules for this course
      const { data: modules, error: modulesError } = await supabase
        .from("modules")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index");

      if (modulesError) {
        console.error("Error fetching modules:", modulesError);
        return null;
      }

      // Fetch all lessons for these modules
      const moduleIds = modules?.map((m) => m.id) || [];
      let lessons: any[] = [];
      
      if (moduleIds.length > 0) {
        const { data: lessonsData, error: lessonsError } = await supabase
          .from("lessons")
          .select("*")
          .in("module_id", moduleIds)
          .order("order_index");

        if (lessonsError) {
          console.error("Error fetching lessons:", lessonsError);
        } else {
          lessons = lessonsData || [];
        }
      }

      // Fetch lesson completions for current user
      let completedLessonIds: string[] = [];
      if (user) {
        const { data: completions } = await supabase
          .from("lesson_completions")
          .select("lesson_id")
          .eq("user_id", user.id)
          .eq("course_id", courseId);

        completedLessonIds = completions?.map((c) => c.lesson_id) || [];
      }

      // Build the course structure with modules and lessons
      const modulesWithLessons: Module[] = (modules || []).map((module) => {
        const moduleLessons = lessons
          .filter((l) => l.module_id === module.id)
          .map((l) => ({
            id: l.id,
            title: l.title,
            content: l.content,
            duration_minutes: l.duration_minutes || 5,
            order_index: l.order_index,
            completed: completedLessonIds.includes(l.id),
          }));

        const allLessonsCompleted = moduleLessons.length > 0 && moduleLessons.every((l) => l.completed);

        return {
          id: module.id,
          title: module.title,
          order_index: module.order_index,
          lessons: moduleLessons,
          completed: allLessonsCompleted,
        };
      });

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        duration_hours: course.duration_hours,
        total_lessons: course.total_lessons,
        modules: modulesWithLessons,
      };
    },
    enabled: !!courseId,
  });
};
