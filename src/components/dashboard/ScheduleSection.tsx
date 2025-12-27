import { Clock, BookOpen, ArrowRight, Play } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useRecentCourses } from "@/hooks/useCourses";
import { formatDistanceToNow } from "date-fns";

const ScheduleSection = () => {
  const { data: recentCourses, isLoading } = useRecentCourses(4);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="dashboard-card h-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Recent Courses</h2>
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl bg-secondary/50 h-32 animate-pulse" />
          <div className="grid sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-secondary/50 h-48 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!recentCourses || recentCourses.length === 0) {
    return (
      <div className="dashboard-card h-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Recent Courses</h2>
          <Link 
            to="/courses" 
            className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            Browse courses
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No courses yet</p>
          <p className="text-sm text-muted-foreground mt-1">Enroll in a course to start learning</p>
        </div>
      </div>
    );
  }

  const [mostRecent, ...otherCourses] = recentCourses;
  const mostRecentCourse = mostRecent?.courses;

  const handleResume = () => {
    if (mostRecentCourse) {
      navigate(`/course/${mostRecentCourse.id}`);
    }
  };

  return (
    <div className="dashboard-card h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Recent Courses</h2>
        <Link 
          to="/courses" 
          className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
        >
          View all
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-4">
        {/* Resume Card - Most Recent Course */}
        {mostRecentCourse && (
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
            <div className="flex flex-col sm:flex-row gap-4 p-4">
              {/* Course Image */}
              <div className="relative w-full sm:w-40 h-24 sm:h-auto rounded-xl overflow-hidden flex-shrink-0">
                <img 
                  src={mostRecentCourse.image_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop"} 
                  alt={mostRecentCourse.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>

              {/* Course Info */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-primary/20 text-primary rounded-full text-xs font-medium">
                      Continue Learning
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground line-clamp-1 text-lg">
                    {mostRecentCourse.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {mostRecent.last_studied_at
                        ? formatDistanceToNow(new Date(mostRecent.last_studied_at), { addSuffix: true })
                        : "Not started"}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {mostRecent.completed_lessons}/{mostRecentCourse.total_lessons} lessons
                    </span>
                  </div>
                </div>

                {/* Progress and Resume */}
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium text-foreground">{mostRecent.progress}%</span>
                    </div>
                    <Progress value={mostRecent.progress} className="h-2" />
                  </div>
                  <Button 
                    onClick={handleResume}
                    className="gap-2 shrink-0"
                    size="sm"
                  >
                    <Play className="w-4 h-4" />
                    Resume
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other Recent Courses */}
        {otherCourses.length > 0 && (
          <div className="grid sm:grid-cols-3 gap-4">
            {otherCourses.map((enrollment) => {
              const course = enrollment.courses;
              if (!course) return null;

              const lastStudied = enrollment.last_studied_at
                ? formatDistanceToNow(new Date(enrollment.last_studied_at), { addSuffix: true })
                : "Not started";

              return (
                <Link
                  key={enrollment.id}
                  to={`/course/${course.id}`}
                  className="group flex flex-col rounded-2xl overflow-hidden bg-secondary/50 hover:bg-secondary transition-all duration-200 hover:scale-[1.02]"
                >
                  {/* Course Image */}
                  <div className="relative h-28 overflow-hidden flex-shrink-0">
                    <img 
                      src={course.image_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop"} 
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-1 bg-card/90 backdrop-blur-sm rounded-full text-xs font-medium text-foreground">
                        {course.categories?.name || "General"}
                      </span>
                    </div>
                  </div>

                  {/* Course Info */}
                  <div className="p-3">
                    <h3 className="font-medium text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors text-sm min-h-[2.5rem]">
                      {course.title}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {lastStudied}
                      </span>
                    </div>

                    {/* Progress */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{enrollment.completed_lessons}/{course.total_lessons}</span>
                        <span className="font-medium text-foreground">{enrollment.progress}%</span>
                      </div>
                      <Progress value={enrollment.progress} className="h-1.5" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleSection;
