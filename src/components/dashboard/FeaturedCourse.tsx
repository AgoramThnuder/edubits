import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

interface FeaturedCourseProps {
  onCreateNew: () => void;
}

const FeaturedCourse = ({ onCreateNew }: FeaturedCourseProps) => {
  return (
    <div className="dashboard-card h-full bg-card">
      {/* Tags */}
      <div className="flex gap-2 mb-3">
        <span className="px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-medium">
          AI Generated
        </span>
        <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
          Intermediate
        </span>
      </div>

      {/* Title & Description */}
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Introduction to Machine Learning
      </h3>
      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
        Master the fundamentals of ML including supervised learning, neural networks, and model evaluation techniques.
      </p>

      {/* Stats row */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <Avatar key={i} className="w-7 h-7 border-2 border-card">
                <AvatarImage src={`https://i.pravatar.cc/100?img=${i + 10}`} />
                <AvatarFallback>U{i}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <span className="text-xs text-muted-foreground ml-1">+12 learners</span>
        </div>

        <div className="text-right">
          <p className="text-xs text-muted-foreground">Course progress</p>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-foreground">65%</span>
            <div className="w-16 h-2 rounded-full bg-secondary overflow-hidden">
              <div className="h-full w-[65%] bg-accent rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button asChild className="flex-1">
          <Link to="/course/1">Continue learning</Link>
        </Button>
        <Button variant="outline" size="icon" onClick={onCreateNew}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default FeaturedCourse;
