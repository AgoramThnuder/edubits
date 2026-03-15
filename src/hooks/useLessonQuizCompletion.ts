import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Hook to read and persist lesson MCQ and module quiz completions in Supabase.
 * Also writes to localStorage as an optimistic cache so the UI responds immediately.
 */
export const useLessonQuizCompletion = (
  courseId: string | undefined,
  lessonId: string | undefined
) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["lesson-quiz-completion", lessonId, user?.id],
    queryFn: async () => {
      if (!user || !lessonId) return { mcqCompleted: false, modQuizCompleted: false };

      const { data: completions } = await supabase
        .from("lesson_quiz_completions" as any)
        .select("quiz_type")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId);

      const types: string[] = (completions as any[])?.map((c: any) => c.quiz_type) ?? [];
      return {
        mcqCompleted: types.includes("mcq"),
        modQuizCompleted: types.includes("module_quiz"),
      };
    },
    enabled: !!user && !!lessonId,
    staleTime: 60_000, // cache for 1 minute
  });

  const markComplete = async (quizType: "mcq" | "module_quiz") => {
    if (!user || !lessonId || !courseId) return;

    // Write to localStorage immediately for instant UI feedback
    const lsKey = quizType === "mcq"
      ? `edubits_mcq_${lessonId}`
      : `edubits_modquiz_${lessonId}`;
    localStorage.setItem(lsKey, "1");

    // Persist to Supabase
    await supabase.from("lesson_quiz_completions" as any).upsert({
      user_id: user.id,
      lesson_id: lessonId,
      course_id: courseId,
      quiz_type: quizType,
      completed_at: new Date().toISOString(),
    }, { onConflict: "user_id,lesson_id,quiz_type" });

    // Invalidate so re-reads pick up the latest
    queryClient.invalidateQueries({ queryKey: ["lesson-quiz-completion", lessonId, user.id] });
  };

  // Combine Supabase data with localStorage cache (either source is sufficient)
  const mcqCompleted =
    (data?.mcqCompleted ?? false) ||
    (typeof window !== "undefined" && !!localStorage.getItem(`edubits_mcq_${lessonId}`));
  const modQuizCompleted =
    (data?.modQuizCompleted ?? false) ||
    (typeof window !== "undefined" && !!localStorage.getItem(`edubits_modquiz_${lessonId}`));

  return { mcqCompleted, modQuizCompleted, markComplete };
};
