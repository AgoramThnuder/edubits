import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  Bell,
  BookOpen,
  Clock,
  CheckCircle2,
  Calendar,
  Plus,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Users
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CreateCourseModal from "@/components/dashboard/CreateCourseModal";
import ActivityChart from "@/components/dashboard/ActivityChart";
import ProgressStats from "@/components/dashboard/ProgressStats";
import FeaturedCourse from "@/components/dashboard/FeaturedCourse";
import TopicsList from "@/components/dashboard/TopicsList";
import ScheduleSection from "@/components/dashboard/ScheduleSection";

const navItems = [
  { label: "Dashboard", href: "/", active: true },
  { label: "Courses", href: "/courses", active: false },
  { label: "Login", href: "/login", active: false },
];

const Dashboard = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-foreground flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-background" />
              </div>
              <span className="text-xl font-semibold text-foreground">
                EduBits
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1 bg-secondary rounded-full p-1">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`nav-pill ${item.active ? 'nav-pill-active' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <button className="p-2.5 rounded-xl hover:bg-secondary transition-colors">
                <Search className="w-5 h-5 text-muted-foreground" />
              </button>
              <button className="p-2.5 rounded-xl hover:bg-secondary transition-colors relative">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full" />
              </button>
              <Avatar className="w-10 h-10 border-2 border-secondary">
                <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Activity Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="col-span-12 lg:col-span-4"
          >
            <ActivityChart />
          </motion.div>

          {/* Progress Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="col-span-12 md:col-span-6 lg:col-span-4"
          >
            <ProgressStats />
          </motion.div>

          {/* Featured Course */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="col-span-12 md:col-span-6 lg:col-span-4"
          >
            <FeaturedCourse onCreateNew={() => setIsCreateModalOpen(true)} />
          </motion.div>

          {/* Topics List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="col-span-12 md:col-span-6 lg:col-span-4"
          >
            <TopicsList />
          </motion.div>

          {/* Schedule Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="col-span-12 md:col-span-6 lg:col-span-8"
          >
            <ScheduleSection />
          </motion.div>
        </div>
      </main>

      <CreateCourseModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
};

export default Dashboard;
