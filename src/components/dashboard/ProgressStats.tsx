import { Clock, CheckCircle2, Calendar } from "lucide-react";

const ProgressStats = () => {
  const stats = [
    { icon: Clock, label: "In progress", value: 3, color: "text-warning bg-warning/10" },
    { icon: CheckCircle2, label: "Completed", value: 8, color: "text-success bg-success/10" },
    { icon: Calendar, label: "Upcoming", value: 5, color: "text-accent bg-accent/10" },
  ];

  return (
    <div className="dashboard-card h-full">
      <h2 className="text-lg font-semibold text-foreground mb-4">Progress statistics</h2>

      {/* Main percentage */}
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-4xl font-bold text-foreground">72%</span>
        <span className="text-muted-foreground">Total activity</span>
      </div>

      {/* Progress bar segments */}
      <div className="flex gap-1 mb-2">
        <div className="progress-segment bg-primary flex-[24]" />
        <div className="progress-segment bg-success flex-[48]" />
        <div className="progress-segment bg-warning flex-[28]" />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground mb-6">
        <span>24%</span>
        <span>48%</span>
        <span>28%</span>
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
