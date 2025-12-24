import { ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

const scheduleItems = [
  {
    id: 1,
    time: "10:30 — 12:00",
    title: "Supervised Learning Basics",
    level: "Beginner",
    levelColor: "bg-primary/10 text-primary",
    mentor: "AI Tutor",
    mentorAvatar: "https://i.pravatar.cc/100?img=32",
    isNow: false,
    bgColor: "bg-card",
  },
  {
    id: 2,
    time: "13:00 — 14:00",
    title: "Neural Networks Deep Dive",
    level: "Advanced",
    levelColor: "bg-accent text-accent-foreground",
    mentor: "AI Tutor",
    mentorAvatar: "https://i.pravatar.cc/100?img=33",
    isNow: true,
    bgColor: "bg-accent",
  },
  {
    id: 3,
    time: "16:00 — 17:00",
    title: "Model Evaluation Techniques",
    level: "Beginner",
    levelColor: "bg-primary/10 text-primary",
    mentor: "AI Tutor",
    mentorAvatar: "https://i.pravatar.cc/100?img=34",
    isNow: false,
    bgColor: "bg-card",
  },
];

const ScheduleSection = () => {
  return (
    <div className="dashboard-card h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">My schedule</h2>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <span className="px-3 py-1 rounded-lg bg-secondary text-sm font-medium">Today</span>
          <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {scheduleItems.map((item) => (
          <Link
            key={item.id}
            to={`/course/${item.id}`}
            className={`block p-5 rounded-2xl transition-all duration-200 hover:scale-[1.02] ${item.bgColor} ${
              item.isNow ? 'text-accent-foreground' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`text-sm ${item.isNow ? 'text-accent-foreground/80' : 'text-muted-foreground'}`}>
                {item.time}
              </span>
              {item.isNow && (
                <span className="flex items-center gap-1 text-xs">
                  <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                  Now
                </span>
              )}
            </div>

            <h3 className={`font-semibold mb-3 line-clamp-2 ${item.isNow ? '' : 'text-foreground'}`}>
              {item.title}
            </h3>

            <span className={`inline-block px-3 py-1 rounded-lg text-xs font-medium mb-4 ${
              item.isNow ? 'bg-accent-foreground/20' : item.levelColor
            }`}>
              {item.level}
            </span>

            <div className="flex items-center gap-2 mt-auto">
              <Avatar className="w-7 h-7">
                <AvatarImage src={item.mentorAvatar} />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <div>
                <p className={`text-sm font-medium ${item.isNow ? '' : 'text-foreground'}`}>
                  {item.mentor}
                </p>
                <p className={`text-xs ${item.isNow ? 'text-accent-foreground/70' : 'text-muted-foreground'}`}>
                  Instructor
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ScheduleSection;
