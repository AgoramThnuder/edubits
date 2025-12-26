import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Bell, Moon, Lock, Trash2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

const SettingsPage = () => {
  const { profile } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setIsDarkMode(isDark);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        </div>

        <div className="space-y-4">
          {/* Appearance */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Appearance</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <Moon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark themes
                  </p>
                </div>
              </div>
              <Switch checked={isDarkMode} onCheckedChange={toggleTheme} />
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Notifications</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive reminders and updates
                  </p>
                </div>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>
          </div>

          {/* Security */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Security</h2>
            <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors text-left">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <Lock className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">Change Password</p>
                <p className="text-sm text-muted-foreground">
                  Update your password
                </p>
              </div>
            </button>
          </div>

          {/* Danger Zone */}
          <div className="bg-card border border-destructive/30 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-destructive mb-4">Danger Zone</h2>
            <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-destructive/10 transition-colors text-left">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="font-medium text-destructive">Delete Account</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and data
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
