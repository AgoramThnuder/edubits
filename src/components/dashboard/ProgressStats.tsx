import { BookOpen, CheckCircle, XCircle } from "lucide-react";

const ProgressStats = () => {
  const totalCourses = 12;
  const attendedCourses = 8;
  const nonAttendedCourses = totalCourses - attendedCourses;
  const attendanceRate = Math.round((attendedCourses / totalCourses) * 100);

  const stats = [
    { icon: BookOpen, label: "Total Courses", value: totalCourses, color: "text-primary bg-primary/10" },
    { icon: CheckCircle, label: "Attended", value: attendedCourses, color: "text-success bg-success/10" },
    { icon: XCircle, label: "Not Attended", value: nonAttendedCourses, color: "text-destructive bg-destructive/10" },
  ];

  return (
    <div className="dashboard-card h-full">
      <h2 className="text-lg font-semibold text-foreground mb-4">Course Statistics</h2>

      {/* Main percentage */}
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-4xl font-bold text-foreground">{attendanceRate}%</span>
        <span className="text-muted-foreground">Attendance rate</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-3 bg-secondary rounded-full overflow-hidden mb-2">
        <div 
          className="h-full bg-gradient-to-r from-success to-success/80 rounded-full transition-all duration-500"
          style={{ width: `${attendanceRate}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground mb-6">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-success" />
          Attended ({attendedCourses})
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-secondary" />
          Not Attended ({nonAttendedCourses})
        </span>
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
