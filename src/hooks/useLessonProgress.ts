import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface LessonCompletion {
  id: string;
  lesson_id: string;
  course_id: string;
  completed_at: string;
}

export function useLessonProgress(courseId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch completed lessons for this course
  const { data: completedLessons = [], isLoading } = useQuery({
    queryKey: ["lesson-completions", courseId, user?.id],
    queryFn: async (): Promise<LessonCompletion[]> => {
      if (!courseId || !user) return [];

      const { data, error } = await supabase
        .from("lesson_completions")
        .select("*")
        .eq("course_id", courseId)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching lesson completions:", error);
        return [];
      }

      return data || [];
    },
    enabled: !!courseId && !!user,
  });

  // Fetch last studied lesson
  const { data: enrollment } = useQuery({
    queryKey: ["enrollment-progress", courseId, user?.id],
    queryFn: async () => {
      if (!courseId || !user) return null;

      const { data, error } = await supabase
        .from("user_enrollments")
        .select("*")
        .eq("course_id", courseId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching enrollment:", error);
        return null;
      }

      return data;
    },
    enabled: !!courseId && !!user,
  });

  // Mark lesson as complete
  const completeLessonMutation = useMutation({
    mutationFn: async ({ lessonId, totalLessons }: { lessonId: string; totalLessons: number }) => {
      if (!courseId || !user) throw new Error("Missing course or user");

      // Insert completion record
      const { error: completionError } = await supabase
        .from("lesson_completions")
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          course_id: courseId,
        }, { onConflict: 'user_id,lesson_id' });

      if (completionError) {
        console.error("Error marking lesson complete:", completionError);
        throw completionError;
      }

      // Calculate new progress
      const completedCount = completedLessons.filter(l => l.lesson_id !== lessonId).length + 1;
      const progressPercent = Math.round((completedCount / totalLessons) * 100);

      // Update enrollment progress
      const { error: enrollmentError } = await supabase
        .from("user_enrollments")
        .update({
          completed_lessons: completedCount,
          progress: progressPercent,
          last_studied_at: new Date().toISOString(),
          last_lesson_id: lessonId,
        })
        .eq("course_id", courseId)
        .eq("user_id", user.id);

      if (enrollmentError) {
        console.error("Error updating enrollment:", enrollmentError);
      }

      return { lessonId, completedCount, progressPercent };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lesson-completions", courseId] });
      queryClient.invalidateQueries({ queryKey: ["enrollment-progress", courseId] });
      queryClient.invalidateQueries({ queryKey: ["user-enrollments"] });
    },
  });

  // Update last studied lesson position
  const updateLastLessonMutation = useMutation({
    mutationFn: async (lessonId: string) => {
      if (!courseId || !user) return;

      await supabase
        .from("user_enrollments")
        .update({
          last_studied_at: new Date().toISOString(),
          last_lesson_id: lessonId,
        })
        .eq("course_id", courseId)
        .eq("user_id", user.id);
    },
  });

  const completedLessonIds = new Set(completedLessons.map(l => l.lesson_id));
  const lastLessonId = enrollment?.last_lesson_id;

  const markLessonComplete = useCallback(
    (lessonId: string, totalLessons: number) => {
      completeLessonMutation.mutate({ lessonId, totalLessons });
    },
    [completeLessonMutation]
  );

  const updateLastLesson = useCallback(
    (lessonId: string) => {
      updateLastLessonMutation.mutate(lessonId);
    },
    [updateLastLessonMutation]
  );

  return {
    completedLessonIds,
    lastLessonId,
    isLoading,
    markLessonComplete,
    updateLastLesson,
    completedCount: completedLessons.length,
    progress: enrollment?.progress ?? 0,
  };
}
