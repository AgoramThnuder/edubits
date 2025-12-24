import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  BookOpen, 
  Clock, 
  BarChart3,
  Search,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import CreateCourseModal from "@/components/dashboard/CreateCourseModal";
import CourseCard from "@/components/dashboard/CourseCard";

// Mock data for demo
const mockCourses = [
  {
    id: "1",
    title: "Introduction to Machine Learning",
    difficulty: "Intermediate",
    progress: 65,
    modulesCount: 4,
    lessonsCount: 12,
    lastAccessed: "2 days ago",
  },
  {
    id: "2",
    title: "The French Revolution",
    difficulty: "Beginner",
    progress: 30,
    modulesCount: 3,
    lessonsCount: 9,
    lastAccessed: "1 week ago",
  },
  {
    id: "3",
    title: "Quantum Mechanics Basics",
    difficulty: "Advanced",
    progress: 10,
    modulesCount: 5,
    lessonsCount: 15,
    lastAccessed: "3 days ago",
  },
];

const Dashboard = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCourses = mockCourses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-display font-semibold text-foreground">
                EduBits
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/profile">Profile</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container px-4 py-8">
        {/* Welcome section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display font-semibold text-foreground mb-2">
            Welcome back
          </h1>
          <p className="text-muted-foreground">
            Continue learning or start something new. Every step counts.
          </p>
        </motion.div>

        {/* Actions bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8"
        >
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search your courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Button 
            variant="calm" 
            onClick={() => setIsCreateModalOpen(true)}
            className="shrink-0"
          >
            <Plus className="w-4 h-4" />
            Create New Course
          </Button>
        </motion.div>

        {/* Courses grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <CourseCard course={course} />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            {searchQuery ? (
              <>
                <p className="text-muted-foreground mb-4">
                  No courses found matching "{searchQuery}"
                </p>
                <Button variant="outline" onClick={() => setSearchQuery("")}>
                  Clear search
                </Button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-display font-medium text-foreground mb-2">
                  Start your learning journey
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Create your first course on any topic you're curious about. 
                  EduBits will guide you through it step by step.
                </p>
                <Button variant="calm" onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="w-4 h-4" />
                  Create Your First Course
                </Button>
              </>
            )}
          </motion.div>
        )}

        {/* Quick stats */}
        {filteredCourses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 grid sm:grid-cols-3 gap-4"
          >
            <div className="p-6 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">Active Courses</span>
              </div>
              <p className="text-2xl font-display font-semibold text-foreground">
                {mockCourses.length}
              </p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">Lessons Completed</span>
              </div>
              <p className="text-2xl font-display font-semibold text-foreground">
                24
              </p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">Average Score</span>
              </div>
              <p className="text-2xl font-display font-semibold text-foreground">
                82%
              </p>
            </div>
          </motion.div>
        )}
      </main>

      <CreateCourseModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
};

export default Dashboard;
