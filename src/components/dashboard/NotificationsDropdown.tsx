import { Bell, BookOpen, CheckCircle, Clock, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
const notifications = [
  {
    id: 1,
    type: "reminder",
    title: "Continue Learning",
    message: "You haven't practiced React Hooks in 2 days",
    time: "2h ago",
    icon: Clock,
    unread: true,
  },
  {
    id: 2,
    type: "achievement",
    title: "New Achievement!",
    message: "You've completed 10 lessons this week",
    time: "5h ago",
    icon: Award,
    unread: true,
  },
  {
    id: 3,
    type: "course",
    title: "New Course Available",
    message: "Advanced TypeScript Patterns is now available",
    time: "1d ago",
    icon: BookOpen,
    unread: false,
  },
  {
    id: 4,
    type: "progress",
    title: "Milestone Reached",
    message: "You're 75% through Machine Learning basics",
    time: "2d ago",
    icon: CheckCircle,
    unread: false,
  },
];

const NotificationsDropdown = () => {
  const navigate = useNavigate();
  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-2.5 rounded-xl hover:bg-secondary transition-colors relative">
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-card border-border">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[300px] overflow-y-auto">
          {notifications.map((notification) => {
            const Icon = notification.icon;
            return (
              <DropdownMenuItem
                key={notification.id}
                className="flex items-start gap-3 p-3 cursor-pointer focus:bg-secondary"
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    notification.type === "achievement"
                      ? "bg-accent/10"
                      : notification.type === "reminder"
                      ? "bg-primary/10"
                      : "bg-secondary"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      notification.type === "achievement"
                        ? "text-accent"
                        : notification.type === "reminder"
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm text-foreground truncate">
                      {notification.title}
                    </p>
                    {notification.unread && (
                      <span className="w-2 h-2 bg-accent rounded-full flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    {notification.time}
                  </p>
                </div>
              </DropdownMenuItem>
            );
          })}
        </div>
        <DropdownMenuSeparator />
        <div className="p-2">
          <Button 
            variant="ghost" 
            className="w-full text-sm" 
            size="sm"
            onClick={() => navigate("/notifications")}
          >
            View all notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsDropdown;
