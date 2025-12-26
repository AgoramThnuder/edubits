import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Course {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  category_id: string | null;
  total_lessons: number;
  duration_hours: number;
  created_by: string | null;
  created_at: string;
  categories?: {
    id: string;
    name: string;
    color: string;
  } | null;
}

export interface UserEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  progress: number;
  completed_lessons: number;
  last_studied_at: string | null;
  enrolled_at: string;
  courses?: Course;
}

export const useCourses = () => {
  return useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select(`
          *,
          categories (
            id,
            name,
            color
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Course[];
    },
  });
};

export const useUserEnrollments = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["enrollments", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("user_enrollments")
        .select(`
          *,
          courses (
            *,
            categories (
              id,
              name,
              color
            )
          )
        `)
        .eq("user_id", user.id)
        .order("last_studied_at", { ascending: false });

      if (error) throw error;
      return data as UserEnrollment[];
    },
    enabled: !!user,
  });
};

export const useRecentCourses = (limit = 3) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["recent-courses", user?.id, limit],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("user_enrollments")
        .select(`
          *,
          courses (
            *,
            categories (
              id,
              name,
              color
            )
          )
        `)
        .eq("user_id", user.id)
        .order("last_studied_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as UserEnrollment[];
    },
    enabled: !!user,
  });
};

export const useEnrollInCourse = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (courseId: string) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_enrollments")
        .insert({
          user_id: user.id,
          course_id: courseId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["recent-courses"] });
    },
  });
};

export const useUpdateProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      enrollmentId,
      progress,
      completedLessons,
    }: {
      enrollmentId: string;
      progress: number;
      completedLessons: number;
    }) => {
      const { data, error } = await supabase
        .from("user_enrollments")
        .update({
          progress,
          completed_lessons: completedLessons,
          last_studied_at: new Date().toISOString(),
        })
        .eq("id", enrollmentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["recent-courses"] });
    },
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    },
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (course: {
      title: string;
      description?: string;
      image_url?: string;
      category_id?: string;
      total_lessons?: number;
      duration_hours?: number;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("courses")
        .insert({
          ...course,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
};
