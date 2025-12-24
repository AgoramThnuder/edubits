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

// Generate mock data based on time range
const generateData = (range: TimeRange) => {
  const today = new Date();
  
  if (range === "today") {
    // Hourly data for today
    const hours = ["6am", "9am", "12pm", "3pm", "6pm", "9pm"];
    return hours.map((hour, i) => ({
      label: hour,
      hours: Math.random() * 2,
      height: Math.random() * 100,
    }));
  }
  
  if (range === "7days") {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day) => ({
      label: day,
      hours: Math.random() * 5 + 0.5,
      height: Math.random() * 80 + 20,
    }));
  }
  
  if (range === "1month") {
    // Weekly data for 1 month
    return ["Week 1", "Week 2", "Week 3", "Week 4"].map((week) => ({
      label: week,
      hours: Math.random() * 20 + 5,
      height: Math.random() * 80 + 20,
    }));
  }
  
  if (range === "1year") {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months.map((month) => ({
      label: month,
      hours: Math.random() * 40 + 10,
      height: Math.random() * 80 + 20,
    }));
  }
  
  // Custom months (2-12 months)
  const monthCount = parseInt(range.replace("months", ""));
  const months = [];
  for (let i = monthCount - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setMonth(date.getMonth() - i);
    months.push(date.toLocaleString("default", { month: "short" }));
  }
  return months.map((month) => ({
    label: month,
    hours: Math.random() * 40 + 10,
    height: Math.random() * 80 + 20,
  }));
};

const ActivityChart = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("7days");
  
  const data = useMemo(() => generateData(timeRange), [timeRange]);
  const totalHours = data.reduce((acc, d) => acc + d.hours, 0);
  const avgHours = (totalHours / data.length).toFixed(1);
  const maxBarHeight = 6; // Scale factor for avg line position

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
      <div className="relative h-40">
        {/* Avg line */}
        <div 
          className="absolute left-0 right-0 border-t-2 border-dashed border-muted-foreground/30 flex items-center"
          style={{ top: `${100 - (parseFloat(avgHours) / maxBarHeight) * 100}%` }}
        >
          <span className="absolute -left-1 -top-3 bg-foreground text-background text-xs px-2 py-0.5 rounded">
            {avgHours} hours
          </span>
        </div>

        {/* Bars */}
        <div className="flex items-end justify-between h-full gap-1 pt-6">
          {data.map((d, i) => (
            <div key={d.label} className="flex-1 flex flex-col items-center gap-2 min-w-0">
              <div 
                className="w-full rounded-t-lg transition-all duration-300 hover:opacity-80"
                style={{ 
                  height: `${d.height}%`,
                  background: i === data.length - 1 
                    ? 'hsl(var(--chart-highlight))' 
                    : 'hsl(var(--chart-primary))'
                }}
              />
              <span className="text-xs text-muted-foreground truncate w-full text-center">{d.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityChart;
