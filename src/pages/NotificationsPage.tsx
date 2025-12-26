import { Bell, BookOpen, CheckCircle, Clock, Award, ArrowLeft, Check, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const initialNotifications = [
  {
    id: 1,
    type: "reminder",
    title: "Continue Learning",
    message: "You haven't practiced React Hooks in 2 days. Pick up where you left off and keep your streak going!",
    time: "2h ago",
    icon: Clock,
    unread: true,
  },
  {
    id: 2,
    type: "achievement",
    title: "New Achievement!",
    message: "You've completed 10 lessons this week. Great progress! Keep up the momentum.",
    time: "5h ago",
    icon: Award,
    unread: true,
  },
  {
    id: 3,
    type: "course",
    title: "New Course Available",
    message: "Advanced TypeScript Patterns is now available. Dive into generics, conditional types, and more.",
    time: "1d ago",
    icon: BookOpen,
    unread: false,
  },
  {
    id: 4,
    type: "progress",
    title: "Milestone Reached",
    message: "You're 75% through Machine Learning basics. Only a few more lessons to complete the course!",
    time: "2d ago",
    icon: CheckCircle,
    unread: false,
  },
  {
    id: 5,
    type: "reminder",
    title: "Weekly Goal Reminder",
    message: "You're 2 lessons away from reaching your weekly learning goal. Finish strong!",
    time: "3d ago",
    icon: Clock,
    unread: false,
  },
  {
    id: 6,
    type: "achievement",
    title: "5-Day Streak!",
    message: "You've been learning for 5 days in a row. Consistency is key to mastery!",
    time: "4d ago",
    icon: Award,
    unread: false,
  },
  {
    id: 7,
    type: "course",
    title: "Course Update",
    message: "Python Basics course has been updated with new practice exercises.",
    time: "5d ago",
    icon: BookOpen,
    unread: false,
  },
];

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState(initialNotifications);
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
  };

  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up!"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead} className="gap-2">
              <Check className="w-4 h-4" />
              Mark all as read
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {notifications.map((notification) => {
            const Icon = notification.icon;
            return (
              <div
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                  notification.unread
                    ? "bg-secondary/50 border-border"
                    : "bg-card border-border/50 hover:bg-secondary/30"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    notification.type === "achievement"
                      ? "bg-accent/10"
                      : notification.type === "reminder"
                      ? "bg-primary/10"
                      : notification.type === "course"
                      ? "bg-success/10"
                      : "bg-secondary"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      notification.type === "achievement"
                        ? "text-accent"
                        : notification.type === "reminder"
                        ? "text-primary"
                        : notification.type === "course"
                        ? "text-success"
                        : "text-muted-foreground"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-foreground">
                      {notification.title}
                    </p>
                    {notification.unread && (
                      <span className="w-2 h-2 bg-accent rounded-full flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-2">
                    {notification.time}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
