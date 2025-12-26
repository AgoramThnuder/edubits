import { Calendar, ChevronDown } from "lucide-react";
import { useState, useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type TimeRange = "today" | "7days" | "1month" | "1year" | `${number}months`;

const timeRangeLabels: Record<TimeRange, string> = {
  today: "Today",
  "7days": "Last 7 days",
  "1month": "Last 1 month",
  "1year": "1 year",
  "2months": "2 months",
  "3months": "3 months",
  "4months": "4 months",
  "5months": "5 months",
  "6months": "6 months",
  "7months": "7 months",
  "8months": "8 months",
  "9months": "9 months",
  "10months": "10 months",
  "11months": "11 months",
  "12months": "12 months",
};

// Activity data for AI Mini Course Builder
const activityData = {
  today: [
    { label: "6am", hours: 0.5 },
    { label: "9am", hours: 1.2 },
    { label: "12pm", hours: 0.8 },
    { label: "3pm", hours: 1.5 },
    { label: "6pm", hours: 2.1 },
    { label: "9pm", hours: 0.3 },
  ],
  "7days": [
    { label: "Mon", hours: 2.5 },
    { label: "Tue", hours: 3.8 },
    { label: "Wed", hours: 1.2 },
    { label: "Thu", hours: 4.5 },
    { label: "Fri", hours: 3.2 },
    { label: "Sat", hours: 5.1 },
    { label: "Sun", hours: 2.8 },
  ],
  "1month": [
    { label: "Week 1", hours: 12.5 },
    { label: "Week 2", hours: 18.3 },
    { label: "Week 3", hours: 15.7 },
    { label: "Week 4", hours: 21.2 },
  ],
  "1year": [
    { label: "Jan", hours: 32 },
    { label: "Feb", hours: 28 },
    { label: "Mar", hours: 45 },
    { label: "Apr", hours: 38 },
    { label: "May", hours: 52 },
    { label: "Jun", hours: 41 },
    { label: "Jul", hours: 35 },
    { label: "Aug", hours: 48 },
    { label: "Sep", hours: 55 },
    { label: "Oct", hours: 42 },
    { label: "Nov", hours: 38 },
    { label: "Dec", hours: 29 },
  ],
};

// Generate data based on time range
const generateData = (range: TimeRange) => {
  const today = new Date();
  
  if (range === "today") {
    return activityData.today;
  }
  
  if (range === "7days") {
    return activityData["7days"];
  }
  
  if (range === "1month") {
    return activityData["1month"];
  }
  
  if (range === "1year") {
    return activityData["1year"];
  }
  
  // Custom months (2-11 months)
  const monthCount = parseInt(range.replace("months", ""));
  const months = [];
  for (let i = monthCount - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setMonth(date.getMonth() - i);
    const monthLabel = date.toLocaleString("default", { month: "short" });
    const yearData = activityData["1year"];
    const monthData = yearData.find(m => m.label === monthLabel);
    months.push({
      label: monthLabel,
      hours: monthData ? monthData.hours : Math.floor(Math.random() * 30) + 20,
    });
  }
  return months;
};

const ActivityChart = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("7days");
  
  const data = useMemo(() => generateData(timeRange), [timeRange]);
  const totalHours = data.reduce((acc, d) => acc + d.hours, 0);
  const avgHours = totalHours / data.length;
  const maxHours = Math.max(...data.map(d => d.hours));

  return (
    <div className="dashboard-card h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Activity</h2>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border text-sm text-muted-foreground hover:bg-secondary transition-colors">
              <Calendar className="w-4 h-4" />
              {timeRangeLabels[timeRange]}
              <ChevronDown className="w-3 h-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => setTimeRange("today")}>
              Today
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTimeRange("7days")}>
              Last 7 days
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTimeRange("1month")}>
              Last 1 month
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTimeRange("1year")}>
              1 year
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Custom months</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num) => (
                  <DropdownMenuItem
                    key={num}
                    onClick={() => setTimeRange(`${num}months` as TimeRange)}
                  >
                    {num} months
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Total hours */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-foreground">{totalHours.toFixed(1)}</span>
          <span className="text-muted-foreground">Hours spent</span>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        {/* Chart area */}
        <div className="relative h-32 mb-2">
          {/* Avg line */}
          <div 
            className="absolute left-0 right-0 border-t-2 border-dashed border-muted-foreground/30 flex items-center z-10"
            style={{ bottom: `${(avgHours / maxHours) * 100}%` }}
          >
            <span className="absolute -left-1 -top-3 bg-foreground text-background text-xs px-2 py-0.5 rounded whitespace-nowrap">
              {avgHours.toFixed(1)} hours
            </span>
          </div>

          {/* Bars */}
          <div className="flex items-end justify-between h-full gap-2">
            {data.map((d, i) => (
              <div 
                key={d.label}
                className="flex-1 rounded-t-lg transition-all duration-300 hover:opacity-80 min-w-0"
                style={{ 
                  height: `${(d.hours / maxHours) * 100}%`,
                  backgroundColor: i === data.length - 1 
                    ? 'hsl(var(--accent))' 
                    : 'hsl(var(--primary))'
                }}
              />
            ))}
          </div>
        </div>

        {/* Labels */}
        <div className="flex justify-between gap-2">
          {data.map((d) => (
            <span key={d.label} className="flex-1 text-xs text-muted-foreground text-center truncate">
              {d.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityChart;
