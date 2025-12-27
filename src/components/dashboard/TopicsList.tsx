import { TrendingUp, BookOpen } from "lucide-react";
import { useUserEnrollments } from "@/hooks/useCourses";
import { useMemo } from "react";
import { isWithinInterval, subDays } from "date-fns";

const TopicsList = () => {
  const { data: enrollments = [], isLoading } = useUserEnrollments();

  // Calculate study time by course for last 7 days
  const weeklyTopics = useMemo(() => {
    const sevenDaysAgo = subDays(new Date(), 7);

    const courseStats: { 
      id: string; 
      name: string; 
      lessonsCompleted: number; 
      hoursStudied: number;
      imageUrl: string | null;
    }[] = [];

    enrollments.forEach((enrollment) => {
      if (!enrollment.courses) return;
      
      const lastStudied = enrollment.last_studied_at ? new Date(enrollment.last_studied_at) : null;
      const isRecent = lastStudied && isWithinInterval(lastStudied, { start: sevenDaysAgo, end: new Date() });
      
      if (isRecent) {
        courseStats.push({
          id: enrollment.courses.id,
          name: enrollment.courses.title,
          lessonsCompleted: enrollment.completed_lessons || 0,
          hoursStudied: (enrollment.completed_lessons || 0) * 0.5,
          imageUrl: enrollment.courses.image_url,
        });
      }
    });

    return courseStats
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
        {weeklyTopics.map((topic, index) => (
          <div 
            key={topic.id}
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-secondary">
              {topic.imageUrl ? (
                <img 
                  src={topic.imageUrl} 
                  alt={topic.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
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
        ))}
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
