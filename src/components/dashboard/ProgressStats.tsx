import { BookOpen, Sparkles, Users, Layers } from "lucide-react";

const ProgressStats = () => {
  const stats = [
    { icon: BookOpen, label: "Courses Created", value: 5, color: "text-primary bg-primary/10" },
    { icon: Layers, label: "Total Lessons", value: 24, color: "text-success bg-success/10" },
    { icon: Sparkles, label: "AI Generations", value: 47, color: "text-accent bg-accent/10" },
  ];

  return (
    <div className="dashboard-card h-full">
      <h2 className="text-lg font-semibold text-foreground mb-4">Creator Statistics</h2>

      {/* Main percentage */}
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-4xl font-bold text-foreground">89%</span>
        <span className="text-muted-foreground">Course completion rate</span>
      </div>

      {/* Progress bar segments */}
      <div className="flex gap-1 mb-2">
        <div className="progress-segment bg-primary flex-[35]" />
        <div className="progress-segment bg-success flex-[45]" />
        <div className="progress-segment bg-accent flex-[20]" />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground mb-6">
        <span>Published</span>
        <span>Draft</span>
        <span>In Review</span>
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
