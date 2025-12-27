import { BookOpen, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { useUserEnrollments } from "@/hooks/useCourses";

const ProgressStats = () => {
  const { data: enrollments = [] } = useUserEnrollments();

  const totalEnrolled = enrollments.length;
  const completedCourses = enrollments.filter(e => (e.progress ?? 0) >= 100).length;
  const inProgressCourses = enrollments.filter(e => (e.progress ?? 0) > 0 && (e.progress ?? 0) < 100).length;
  
  // Calculate average progress across all enrolled courses
  const averageProgress = totalEnrolled > 0 
    ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress ?? 0), 0) / totalEnrolled)
    : 0;
  
  // Calculate total lessons completed
  const totalLessonsCompleted = enrollments.reduce((sum, e) => sum + (e.completed_lessons ?? 0), 0);

  const stats = [
    { icon: BookOpen, label: "Enrolled", value: totalEnrolled, color: "text-primary bg-primary/10" },
    { icon: TrendingUp, label: "In Progress", value: inProgressCourses, color: "text-warning bg-warning/10" },
    { icon: CheckCircle, label: "Completed", value: completedCourses, color: "text-success bg-success/10" },
  ];

  return (
    <div className="dashboard-card h-full">
      <h2 className="text-lg font-semibold text-foreground mb-4">Your Progress</h2>

      {/* Main percentage */}
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-4xl font-bold text-foreground">{averageProgress}%</span>
        <span className="text-muted-foreground">Average completion</span>
      </div>
      
      {/* Lessons completed */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Clock className="w-4 h-4" />
        <span>{totalLessonsCompleted} lessons completed</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-3 bg-secondary rounded-full overflow-hidden mb-2">
        <div 
          className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500"
          style={{ width: `${averageProgress}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground mb-6">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-primary" />
          Progress ({averageProgress}%)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-secondary" />
          Remaining ({100 - averageProgress}%)
        </span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold text-foreground">{stat.value}</span>
            <span className="text-xs text-muted-foreground text-center">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressStats;
