import { Calendar } from "lucide-react";

const weekData = [
  { day: "Mon", hours: 2.5, height: 45 },
  { day: "Tue", hours: 1.8, height: 32 },
  { day: "Wed", hours: 3.2, height: 58 },
  { day: "Thu", hours: 4.8, height: 87 },
  { day: "Fri", hours: 5.2, height: 94 },
  { day: "Sat", hours: 2.1, height: 38 },
  { day: "Sun", hours: 1.5, height: 27 },
];

const ActivityChart = () => {
  const totalHours = weekData.reduce((acc, d) => acc + d.hours, 0);
  const avgHours = (totalHours / 7).toFixed(1);

  return (
    <div className="dashboard-card h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Activity</h2>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border text-sm text-muted-foreground hover:bg-secondary transition-colors">
          <Calendar className="w-4 h-4" />
          Last 7 days
        </button>
      </div>

      {/* Total hours */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-foreground">{totalHours.toFixed(1)}</span>
          <span className="text-muted-foreground">Hours spent</span>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-40">
        {/* Avg line */}
        <div 
          className="absolute left-0 right-0 border-t-2 border-dashed border-muted-foreground/30 flex items-center"
          style={{ top: `${100 - (parseFloat(avgHours) / 6) * 100}%` }}
        >
          <span className="absolute -left-1 -top-3 bg-foreground text-background text-xs px-2 py-0.5 rounded">
            {avgHours} hours
          </span>
        </div>

        {/* Bars */}
        <div className="flex items-end justify-between h-full gap-3 pt-6">
          {weekData.map((d, i) => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
              <div 
                className="w-full rounded-t-lg transition-all duration-300 hover:opacity-80"
                style={{ 
                  height: `${d.height}%`,
                  background: i === 4 
                    ? 'hsl(var(--chart-highlight))' 
                    : 'hsl(var(--chart-primary))'
                }}
              />
              <span className="text-xs text-muted-foreground">{d.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityChart;
