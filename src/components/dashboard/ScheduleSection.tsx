import { Clock, BookOpen, ArrowRight, Play } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { useRecentCourses } from "@/hooks/useCourses";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

const ScheduleSection = () => {
  const { data: recentCourses, isLoading } = useRecentCourses(4);

  if (isLoading) {
    return (
      <div className="dashboard-card h-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Recent Courses</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl bg-secondary/50 h-64 animate-pulse" />
          ))}
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

  // Get the most recently studied course (first one, already sorted by last_studied_at)
  const continueLearningCourse = recentCourses[0];
  const otherCourses = recentCourses.slice(1);

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

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Continue Learning - Featured Card */}
        {continueLearningCourse && continueLearningCourse.courses && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="sm:col-span-2 lg:col-span-2 lg:row-span-1"
          >
            <Link
              to={`/course/${continueLearningCourse.courses.id}`}
              className="group relative flex flex-col h-full rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-secondary border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
            >
              <div className="absolute top-3 left-3 z-10">
                <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-semibold flex items-center gap-1.5">
                  <Play className="w-3 h-3" />
                  Continue Learning
                </span>
              </div>

              <div className="flex flex-col sm:flex-row h-full">
                {/* Course Image */}
                <div className="relative h-36 sm:h-auto sm:w-2/5 overflow-hidden flex-shrink-0">
                  <img 
                    src={continueLearningCourse.courses.image_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop"} 
                    alt={continueLearningCourse.courses.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary/5" />
                </div>

                {/* Course Info */}
                <div className="flex-1 p-5 flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-primary font-medium">
                      {continueLearningCourse.courses.categories?.name || "General"}
                    </span>
                    <h3 className="font-bold text-lg text-foreground mt-1 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {continueLearningCourse.courses.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {continueLearningCourse.courses.description || "Continue where you left off"}
                    </p>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {continueLearningCourse.last_studied_at
                          ? formatDistanceToNow(new Date(continueLearningCourse.last_studied_at), { addSuffix: true })
                          : "Not started"}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        {continueLearningCourse.completed_lessons}/{continueLearningCourse.courses.total_lessons} lessons
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold text-primary">{continueLearningCourse.progress}%</span>
                      </div>
                      <Progress value={continueLearningCourse.progress} className="h-2" />
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all">
                      Resume Course
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Other Recent Courses */}
        {otherCourses.map((enrollment, index) => {
          const course = enrollment.courses;
          if (!course) return null;

          const lastStudied = enrollment.last_studied_at
            ? formatDistanceToNow(new Date(enrollment.last_studied_at), { addSuffix: true })
            : "Not started";

          return (
            <motion.div
              key={enrollment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
            >
              <Link
                to={`/course/${course.id}`}
                className="group flex flex-col h-full rounded-2xl overflow-hidden bg-secondary/50 hover:bg-secondary transition-all duration-200 hover:scale-[1.02]"
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
                <div className="p-3 flex-1 flex flex-col">
                  <h3 className="font-semibold text-sm text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {lastStudied}
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="mt-auto space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{enrollment.completed_lessons}/{course.total_lessons}</span>
                      <span className="font-medium text-foreground">{enrollment.progress}%</span>
                    </div>
                    <Progress value={enrollment.progress} className="h-1.5" />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ScheduleSection;
