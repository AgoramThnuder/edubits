import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeaturedCourseProps {
  onCreateNew: () => void;
}

const FeaturedCourse = ({ onCreateNew }: FeaturedCourseProps) => {
  return (
    <div className="dashboard-card h-full bg-card flex flex-col items-center justify-center text-center">
      {/* Icon */}
      <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-4">
        <Sparkles className="w-8 h-8 text-accent" />
      </div>

      {/* Title & Description */}
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Create New Course
      </h3>
      <p className="text-sm text-muted-foreground mb-6 leading-relaxed max-w-xs">
        Generate a personalized AI-powered course on any topic you want to learn.
      </p>

      {/* Action button */}
      <Button onClick={onCreateNew} className="gap-2">
        <Plus className="w-4 h-4" />
        Create Course
      </Button>
    </div>
  );
};

export default FeaturedCourse;
