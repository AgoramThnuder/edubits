import { useQuery, useQueryClient } from "@tanstack/react-query";
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

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_option_index: number;
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
}

export interface CourseDetails {
  id: string;
  title: string;
  description: string | null;
  duration_hours: number | null;
  total_lessons: number | null;
  modules: Module[];
  quiz: Quiz | null;
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

      // Fetch quiz for this course
      const { data: quizData } = await supabase
        .from("quizzes")
        .select("*")
        .eq("course_id", courseId)
        .single();

      let quiz: Quiz | null = null;

      if (quizData) {
        const { data: questionsData } = await supabase
          .from("quiz_questions")
          .select("*")
          .eq("quiz_id", quizData.id)
          .order("order_index");

        quiz = {
          id: quizData.id,
          title: quizData.title,
          questions: (questionsData || []).map(q => ({
            id: q.id,
            question: q.question,
            options: q.options as string[],
            correct_option_index: q.correct_option_index
          }))
        };
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
        quiz
      };
    },
    enabled: !!courseId,
  });
};

export const useMarkLessonComplete = (courseId: string | undefined) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Note: we'd usually use useMutation here and a queryClient to invalidate
  // but to keep it simple, we'll return an async function that the component can await
  // and then optionally trigger a refetch

  const markComplete = async (lessonId: string) => {
    if (!user || !courseId) return false;

    try {
      // First insert the completion record
      const { error: completionError } = await supabase
        .from('lesson_completions')
        .upsert({
          user_id: user.id,
          course_id: courseId,
          lesson_id: lessonId
        }, { onConflict: 'user_id,lesson_id' });

      if (completionError) {
        console.error("Failed to mark lesson complete:", completionError);
        return false;
      }

      // Calculate new progress
      const { count: completedCount } = await supabase
        .from('lesson_completions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('course_id', courseId);

      const { data: courseData } = await supabase
        .from('courses')
        .select('total_lessons')
        .eq('id', courseId)
        .single();

      const totalLessons = courseData?.total_lessons || 1;
      const progress = Math.min(100, Math.round(((completedCount || 0) / totalLessons) * 100));

      // Then update the last_lesson_id, completed_lessons, and progress in enrollments
      await supabase
        .from('user_enrollments')
        .update({
          last_lesson_id: lessonId,
          completed_lessons: completedCount || 0,
          progress: progress
        })
        .eq('user_id', user.id)
        .eq('course_id', courseId);

      // Invalidate the course details query to trigger a re-render
      await queryClient.invalidateQueries({ queryKey: ["course-details", courseId, user.id] });
      // Also invalidate courses if a dashboard shows it
      await queryClient.invalidateQueries({ queryKey: ["courses", user.id] });

      return true;
    } catch (err) {
      console.error("Error marking lesson complete:", err);
      return false;
    }
  };

  return { markComplete };
};
