import { motion } from "framer-motion";
import { BookOpen, Clock, Users, ChevronRight, Search, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

const navItems = [
  { label: "Dashboard", href: "/", active: false },
  { label: "Courses", href: "/courses", active: true },
  { label: "Login", href: "/login", active: false },
];

const courses = [
  {
    id: "1",
    title: "Introduction to Machine Learning",
    description: "Master the fundamentals of ML including supervised learning, neural networks, and model evaluation.",
    progress: 65,
    lessons: 12,
    duration: "18.5h",
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=250&fit=crop",
    category: "AI & Data Science",
    learners: 234,
  },
  {
    id: "2",
    title: "Python Programming Basics",
    description: "Learn Python from scratch with hands-on projects and real-world examples.",
    progress: 42,
    lessons: 8,
    duration: "12.2h",
    image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=250&fit=crop",
    category: "Programming",
    learners: 456,
  },
  {
    id: "3",
    title: "World History: Ancient Civilizations",
    description: "Explore the rise and fall of ancient empires and their lasting impact on modern society.",
    progress: 28,
    lessons: 6,
    duration: "8.4h",
    image: "https://images.unsplash.com/photo-1461360370896-922624d12a74?w=400&h=250&fit=crop",
    category: "History",
    learners: 189,
  },
  {
    id: "4",
    title: "Statistics for Data Analysis",
    description: "Build a strong foundation in statistics to analyze and interpret data effectively.",
    progress: 15,
    lessons: 4,
    duration: "5.8h",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop",
    category: "Mathematics",
    learners: 312,
  },
  {
    id: "5",
    title: "Web Development Fundamentals",
    description: "Learn HTML, CSS, and JavaScript to build modern responsive websites.",
    progress: 0,
    lessons: 10,
    duration: "15h",
    image: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=400&h=250&fit=crop",
    category: "Programming",
    learners: 567,
  },
  {
    id: "6",
    title: "Digital Marketing Essentials",
    description: "Master SEO, social media marketing, and content strategy for business growth.",
    progress: 0,
    lessons: 7,
    duration: "9h",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop",
    category: "Business",
    learners: 423,
  },
];

const CoursesPage = () => {
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
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground mb-2">My Courses</h1>
          <p className="text-muted-foreground">Continue learning or explore new topics</p>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={`/course/${course.id}`} className="block group">
                <div className="dashboard-card card-lift overflow-hidden">
                  {/* Course Image */}
                  <div className="relative h-40 -mx-6 -mt-6 mb-4 overflow-hidden">
                    <img 
                      src={course.image} 
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 bg-card/90 backdrop-blur-sm rounded-full text-xs font-medium text-foreground">
                        {course.category}
                      </span>
                    </div>
                  </div>

                  {/* Course Info */}
                  <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {course.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      {course.lessons} lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {course.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {course.learners}
                    </span>
                  </div>

                  {/* Progress */}
                  {course.progress > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium text-foreground">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-1.5" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Not started</span>
                      <span className="flex items-center gap-1 text-xs font-medium text-primary">
                        Start learning
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CoursesPage;
