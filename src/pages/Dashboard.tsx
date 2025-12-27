import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, BookOpen, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import CreateCourseModal from "@/components/dashboard/CreateCourseModal";
import ActivityChart from "@/components/dashboard/ActivityChart";
import ProgressStats from "@/components/dashboard/ProgressStats";
import FeaturedCourse from "@/components/dashboard/FeaturedCourse";
import TopicsList from "@/components/dashboard/TopicsList";
import ScheduleSection from "@/components/dashboard/ScheduleSection";
import SearchModal from "@/components/dashboard/SearchModal";
import NotificationsDropdown from "@/components/dashboard/NotificationsDropdown";
import AccountDropdown from "@/components/dashboard/AccountDropdown";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "Dashboard", href: "/", active: true },
  { label: "Courses", href: "/courses", active: false },
];

const Dashboard = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

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
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-2.5 rounded-xl hover:bg-secondary transition-colors"
              >
                <Search className="w-5 h-5 text-muted-foreground" />
              </button>
              <NotificationsDropdown />
              <AccountDropdown />
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
      
      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </div>
  );
};

export default Dashboard;
