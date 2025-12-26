import { Calendar, ChevronDown, BarChart3 } from "lucide-react";
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
import { useUserActivity } from "@/hooks/useActivity";
import { format, subDays, eachDayOfInterval, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from "date-fns";

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

const getDaysForRange = (range: TimeRange): number => {
  if (range === "today") return 1;
  if (range === "7days") return 7;
  if (range === "1month") return 30;
  if (range === "1year") return 365;
  const months = parseInt(range.replace("months", ""));
  return months * 30;
};

const ActivityChart = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("7days");
  const days = getDaysForRange(timeRange);
  const { data: activityData = [], isLoading } = useUserActivity(days);

  const chartData = useMemo(() => {
    const today = new Date();

    if (timeRange === "7days") {
      const last7Days = eachDayOfInterval({
        start: subDays(today, 6),
        end: today,
      });
      
      return last7Days.map((date) => {
        const dateStr = format(date, "yyyy-MM-dd");
        const activity = activityData.find((a) => a.date === dateStr);
        return {
          label: format(date, "EEE"),
          hours: activity ? Number(activity.hours_studied) : 0,
        };
      });
    }

    if (timeRange === "1month") {
      // Group by week
      const weeks = [
        { label: "Week 1", hours: 0 },
        { label: "Week 2", hours: 0 },
        { label: "Week 3", hours: 0 },
        { label: "Week 4", hours: 0 },
      ];
      
      activityData.forEach((activity) => {
        const date = new Date(activity.date);
        const dayOfMonth = date.getDate();
        const weekIndex = Math.min(Math.floor((dayOfMonth - 1) / 7), 3);
        weeks[weekIndex].hours += Number(activity.hours_studied);
      });
      
      return weeks;
    }

    if (timeRange === "1year" || timeRange.endsWith("months")) {
      const monthCount = timeRange === "1year" ? 12 : parseInt(timeRange.replace("months", ""));
      const months = eachMonthOfInterval({
        start: subMonths(today, monthCount - 1),
        end: today,
      });

      return months.map((month) => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        
        const monthHours = activityData
          .filter((a) => {
            const date = new Date(a.date);
            return date >= monthStart && date <= monthEnd;
          })
          .reduce((sum, a) => sum + Number(a.hours_studied), 0);

        return {
          label: format(month, "MMM"),
          hours: monthHours,
        };
      });
    }

    // Today - show hours of today
    const todayStr = format(today, "yyyy-MM-dd");
    const todayActivity = activityData.find((a) => a.date === todayStr);
    return [{ label: "Today", hours: todayActivity ? Number(todayActivity.hours_studied) : 0 }];
  }, [timeRange, activityData]);

  const totalHours = chartData.reduce((acc, d) => acc + d.hours, 0);
  const avgHours = chartData.length > 0 ? totalHours / chartData.length : 0;
  const maxHours = Math.max(...chartData.map((d) => d.hours), 1);

  if (isLoading) {
    return (
      <div className="dashboard-card h-full">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-24 bg-secondary rounded animate-pulse" />
          <div className="h-8 w-32 bg-secondary rounded-full animate-pulse" />
        </div>
        <div className="h-8 w-40 bg-secondary rounded animate-pulse mb-6" />
        <div className="h-32 bg-secondary/50 rounded animate-pulse" />
      </div>
    );
  }

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

      {totalHours === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 text-center">
          <BarChart3 className="w-10 h-10 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No activity data yet</p>
          <p className="text-xs text-muted-foreground">Start learning to track your progress</p>
        </div>
      ) : (
        /* Chart */
        <div className="relative">
          {/* Chart area */}
          <div className="relative h-32 mb-2">
            {/* Avg line */}
            {avgHours > 0 && (
              <div 
                className="absolute left-0 right-0 border-t-2 border-dashed border-muted-foreground/30 flex items-center z-10"
                style={{ bottom: `${(avgHours / maxHours) * 100}%` }}
              >
                <span className="absolute -left-1 -top-3 bg-foreground text-background text-xs px-2 py-0.5 rounded whitespace-nowrap">
                  {avgHours.toFixed(1)} hours
                </span>
              </div>
            )}

            {/* Bars */}
            <div className="flex items-end justify-between h-full gap-2">
              {chartData.map((d, i) => (
                <div 
                  key={d.label}
                  className="flex-1 rounded-t-lg transition-all duration-300 hover:opacity-80 min-w-0"
                  style={{ 
                    height: `${Math.max((d.hours / maxHours) * 100, 2)}%`,
                    backgroundColor: i === chartData.length - 1 
                      ? 'hsl(var(--accent))' 
                      : 'hsl(var(--primary))'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Labels */}
          <div className="flex justify-between gap-2">
            {chartData.map((d) => (
              <span key={d.label} className="flex-1 text-xs text-muted-foreground text-center truncate">
                {d.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityChart;
