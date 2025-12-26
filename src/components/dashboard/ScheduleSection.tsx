import { Clock, BookOpen, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";

const recentCourses = [
  {
    id: 1,
    title: "Introduction to Machine Learning",
    lastStudied: "2 hours ago",
    progress: 65,
    lessons: 12,
    completedLessons: 8,
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=250&fit=crop",
    category: "AI & Data Science",
  },
  {
    id: 2,
    title: "Python Programming Basics",
    lastStudied: "Yesterday",
    progress: 42,
    lessons: 8,
    completedLessons: 3,
    image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=250&fit=crop",
    category: "Programming",
  },
  {
    id: 3,
    title: "Statistics for Data Analysis",
    lastStudied: "3 days ago",
    progress: 28,
    lessons: 6,
    completedLessons: 2,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop",
    category: "Mathematics",
  },
];

const ScheduleSection = () => {
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

      <div className="grid sm:grid-cols-3 gap-4">
        {recentCourses.map((course) => (
          <Link
            key={course.id}
            to={`/course/${course.id}`}
            className="group block rounded-2xl overflow-hidden bg-secondary/50 hover:bg-secondary transition-all duration-200 hover:scale-[1.02]"
          >
            {/* Course Image */}
            <div className="relative h-28 overflow-hidden">
              <img 
                src={course.image} 
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 left-2">
                <span className="px-2 py-1 bg-card/90 backdrop-blur-sm rounded-full text-xs font-medium text-foreground">
                  {course.category}
                </span>
              </div>
            </div>

            {/* Course Info */}
            <div className="p-4">
              <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                {course.title}
              </h3>

              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {course.lastStudied}
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  {course.completedLessons}/{course.lessons}
                </span>
              </div>

              {/* Progress */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium text-foreground">{course.progress}%</span>
                </div>
                <Progress value={course.progress} className="h-1.5" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ScheduleSection;
