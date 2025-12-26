import { Brain, Code, History, Calculator, TrendingUp, BookOpen } from "lucide-react";
import { useUserEnrollments } from "@/hooks/useCourses";
import { useMemo } from "react";
import { isWithinInterval, subDays } from "date-fns";

const iconMap: Record<string, any> = {
  "AI & Data Science": Brain,
  "Programming": Code,
  "History": History,
  "Mathematics": Calculator,
};

const colorMap: Record<string, string> = {
  "AI & Data Science": "bg-accent/10 text-accent",
  "Programming": "bg-primary/10 text-primary",
  "History": "bg-success/10 text-success",
  "Mathematics": "bg-warning/10 text-warning",
};

const TopicsList = () => {
  const { data: enrollments = [], isLoading } = useUserEnrollments();

  // Calculate study time by category for last 7 days
  const weeklyTopics = useMemo(() => {
    const sevenDaysAgo = subDays(new Date(), 7);
    
    const categoryStats: Record<string, { name: string; lessonsCompleted: number; hoursStudied: number }> = {};

    enrollments.forEach((enrollment) => {
      if (!enrollment.courses) return;
      
      const lastStudied = enrollment.last_studied_at ? new Date(enrollment.last_studied_at) : null;
      const isRecent = lastStudied && isWithinInterval(lastStudied, { start: sevenDaysAgo, end: new Date() });
      
      if (isRecent) {
        const categoryName = enrollment.courses.categories?.name || "General";
        
        if (!categoryStats[categoryName]) {
          categoryStats[categoryName] = {
            name: categoryName,
            lessonsCompleted: 0,
            hoursStudied: 0,
          };
        }
        
        categoryStats[categoryName].lessonsCompleted += enrollment.completed_lessons;
        // Estimate hours based on lessons (assume 0.5 hours per lesson)
        categoryStats[categoryName].hoursStudied += enrollment.completed_lessons * 0.5;
      }
    });

    return Object.values(categoryStats)
      .sort((a, b) => b.hoursStudied - a.hoursStudied)
      .slice(0, 4);
  }, [enrollments]);

  const totalHours = weeklyTopics.reduce((sum, topic) => sum + topic.hoursStudied, 0);

  if (isLoading) {
    return (
      <div className="dashboard-card h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-32 bg-secondary rounded animate-pulse" />
          <div className="h-5 w-20 bg-secondary rounded-full animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-secondary/50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (weeklyTopics.length === 0) {
    return (
      <div className="dashboard-card h-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Most Studied</h2>
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">Last 7 days</span>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <BookOpen className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm">No study activity this week</p>
          <p className="text-xs text-muted-foreground mt-1">Start learning to see your progress</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Most Studied</h2>
        <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">Last 7 days</span>
      </div>

      <div className="space-y-3">
        {weeklyTopics.map((topic, index) => {
          const Icon = iconMap[topic.name] || BookOpen;
          const color = colorMap[topic.name] || "bg-secondary text-muted-foreground";
          
          return (
            <div 
              key={topic.name}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{topic.name}</p>
                <p className="text-xs text-muted-foreground">{topic.lessonsCompleted} lessons completed</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <span className="text-lg font-semibold text-foreground">{topic.hoursStudied.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">hrs</span>
                </div>
                {index === 0 && (
                  <div className="flex items-center gap-1 text-xs text-accent">
                    <TrendingUp className="w-3 h-3" />
                    <span>Top</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total this week</span>
          <span className="font-semibold text-foreground">{totalHours.toFixed(1)} hours</span>
        </div>
      </div>
    </div>
  );
};

export default TopicsList;
