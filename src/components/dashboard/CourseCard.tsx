import { Link } from "react-router-dom";
import { Clock, BookOpen, ArrowRight } from "lucide-react";

interface Course {
  id: string;
  title: string;
  difficulty: string;
  progress: number;
  modulesCount: number;
  lessonsCount: number;
  lastAccessed: string;
}

interface CourseCardProps {
  course: Course;
}

const difficultyColors: Record<string, string> = {
  Beginner: "bg-success/10 text-success",
  Intermediate: "bg-warning/10 text-warning",
  Advanced: "bg-destructive/10 text-destructive",
};

const CourseCard = ({ course }: CourseCardProps) => {
  return (
    <Link 
      to={`/course/${course.id}`}
      className="block group"
    >
      <div className="h-full p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-200 card-lift">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${difficultyColors[course.difficulty]}`}>
            {course.difficulty}
          </span>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-display font-medium text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            {course.modulesCount} modules
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {course.lastAccessed}
          </span>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-foreground">{course.progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div 
              className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${course.progress}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
