import { Link } from "react-router-dom";
import { Play, Clock, BookOpen, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useRecentCourses } from "@/hooks/useCourses";
import { formatDistanceToNow } from "date-fns";

const ContinueLearning = () => {
  const { data: recentCourses = [], isLoading } = useRecentCourses(1);
  const recentCourse = recentCourses[0];

  if (isLoading) {
    return (
      <div className="dashboard-card h-full animate-pulse">
        <div className="h-4 w-32 bg-secondary rounded mb-4" />
        <div className="h-24 bg-secondary rounded mb-4" />
        <div className="h-8 bg-secondary rounded" />
      </div>
    );
  }

  if (!recentCourse) {
    return (
      <div className="dashboard-card h-full flex flex-col items-center justify-center text-center py-8">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <BookOpen className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-medium text-foreground mb-1">No courses yet</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Enroll in a course to start learning
        </p>
        <Link to="/courses">
          <Button size="sm" variant="outline">
            Browse Courses
          </Button>
        </Link>
      </div>
    );
  }

  const course = recentCourse.courses;
  const progress = recentCourse.progress ?? 0;
  const completedLessons = recentCourse.completed_lessons ?? 0;
  const totalLessons = course?.total_lessons ?? 0;
  const lastStudied = recentCourse.last_studied_at 
    ? formatDistanceToNow(new Date(recentCourse.last_studied_at), { addSuffix: true })
    : "Never";
  const isCompleted = progress >= 100;

  return (
    <div className="dashboard-card h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Continue Learning</h2>
        {isCompleted && (
          <span className="flex items-center gap-1 text-xs text-success font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </span>
        )}
      </div>

      {/* Course Info */}
      <div className="flex gap-4 mb-4">
        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
          <img 
            src={course?.image_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&h=200&fit=crop"} 
            alt={course?.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground line-clamp-2 mb-1">
            {course?.title}
          </h3>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {lastStudied}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {completedLessons}/{totalLessons} lessons
            </span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium text-foreground">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Resume Button */}
      <Link to={`/course/${recentCourse.course_id}`} className="block">
        <Button className="w-full gap-2">
          <Play className="w-4 h-4" />
          {isCompleted ? "Review Course" : "Resume Learning"}
        </Button>
      </Link>
    </div>
  );
};

export default ContinueLearning;
