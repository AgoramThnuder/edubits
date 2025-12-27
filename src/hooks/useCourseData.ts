import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Lesson {
  id: string;
  title: string;
  content: string;
  duration_minutes: number;
  order_index: number;
}

export interface Module {
  id: string;
  title: string;
  order_index: number;
  lessons: Lesson[];
}

export interface CourseWithModules {
  id: string;
  title: string;
  description: string | null;
  duration_hours: number | null;
  total_lessons: number | null;
  image_url: string | null;
  created_by: string | null;
  modules: Module[];
}

export function useCourseWithModules(courseId: string | undefined) {
  return useQuery({
    queryKey: ["course-with-modules", courseId],
    queryFn: async (): Promise<CourseWithModules | null> => {
      if (!courseId) return null;

      // Fetch course
      const { data: course, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single();

      if (courseError) {
        console.error("Error fetching course:", courseError);
        throw courseError;
      }

      if (!course) return null;

      // Fetch modules with lessons
      const { data: modules, error: modulesError } = await supabase
        .from("modules")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index");

      if (modulesError) {
        console.error("Error fetching modules:", modulesError);
        throw modulesError;
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
          throw lessonsError;
        }
        lessons = lessonsData || [];
      }

      // Group lessons by module
      const modulesWithLessons: Module[] = (modules || []).map((module) => ({
        id: module.id,
        title: module.title,
        order_index: module.order_index,
        lessons: lessons
          .filter((l) => l.module_id === module.id)
          .map((l) => ({
            id: l.id,
            title: l.title,
            content: l.content,
            duration_minutes: l.duration_minutes,
            order_index: l.order_index,
          })),
      }));

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        duration_hours: course.duration_hours,
        total_lessons: course.total_lessons,
        image_url: course.image_url,
        created_by: course.created_by,
        modules: modulesWithLessons,
      };
    },
    enabled: !!courseId,
  });
}
