import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

export interface UserActivity {
  id: string;
  user_id: string;
  date: string;
  hours_studied: number;
}

export const useUserActivity = (days: number = 7) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-activity", user?.id, days],
    queryFn: async () => {
      if (!user) return [];

      const startDate = format(subDays(new Date(), days - 1), "yyyy-MM-dd");
      const endDate = format(new Date(), "yyyy-MM-dd");

      const { data, error } = await supabase
        .from("user_activity")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: true });

      if (error) throw error;
      return data as UserActivity[];
    },
    enabled: !!user,
  });
};

export const useLogActivity = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (hours: number) => {
      if (!user) throw new Error("Not authenticated");

      const today = format(new Date(), "yyyy-MM-dd");

      // Try to update existing record first
      const { data: existing } = await supabase
        .from("user_activity")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from("user_activity")
          .update({
            hours_studied: existing.hours_studied + hours,
          })
          .eq("id", existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("user_activity")
          .insert({
            user_id: user.id,
            date: today,
            hours_studied: hours,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-activity"] });
    },
  });
};

export const useTotalStudyTime = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["total-study-time", user?.id],
    queryFn: async () => {
      if (!user) return 0;

      const { data, error } = await supabase
        .from("user_activity")
        .select("hours_studied")
        .eq("user_id", user.id);

      if (error) throw error;
      
      return data.reduce((sum, record) => sum + Number(record.hours_studied), 0);
    },
    enabled: !!user,
  });
};
