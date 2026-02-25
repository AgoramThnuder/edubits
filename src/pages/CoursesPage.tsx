import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Clock, Users, ChevronRight, Search, X, Loader2, Trash2, Plus, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useCourses, useUserEnrollments, useEnrollInCourse, useCategories, useDeleteCourse } from "@/hooks/useCourses";
import NotificationsDropdown from "@/components/dashboard/NotificationsDropdown";
import AccountDropdown from "@/components/dashboard/AccountDropdown";
import CreateCourseModal from "@/components/dashboard/CreateCourseModal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const navItems = [
  { label: "Dashboard", href: "/", active: false },
  { label: "Courses", href: "/courses", active: true },
];

const CoursesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: courses = [], isLoading: coursesLoading } = useCourses();
  const { data: enrollments = [] } = useUserEnrollments();
  const { data: categories = [] } = useCategories();
  const enrollInCourse = useEnrollInCourse();
  const deleteCourse = useDeleteCourse();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const enrolledCourseIds = useMemo(() => {
    return new Set(enrollments.map((e) => e.course_id));
  }, [enrollments]);

  const handleDeleteCourse = async (courseId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await deleteCourse.mutateAsync(courseId);
      toast({
        title: "Course deleted",
        description: "The course has been successfully deleted.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: error.message || "Could not delete the course.",
      });
    }
  };

  const categoryNames = useMemo(() => {
    const validCategories = courses
      .map(c => c.categories?.name)
      .filter((name): name is string => Boolean(name));

    const uniqueCategories = Array.from(new Set(validCategories)).sort();

    return ["All", ...uniqueCategories];
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchesCategory = selectedCategory === "All" || course.categories?.name === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [courses, searchQuery, selectedCategory]);

  const handleEnroll = async (courseId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await enrollInCourse.mutateAsync(courseId);
      toast({
        title: "Enrolled successfully!",
        description: "You can now start learning this course.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Enrollment failed",
        description: error.message || "Could not enroll in this course.",
      });
    }
  };

  if (authLoading) {
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
              <NotificationsDropdown />
              <AccountDropdown />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground mb-2">Courses</h1>
          <p className="text-muted-foreground">Continue learning or explore new topics</p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {categoryNames.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground mb-4">
          {filteredCourses.length} {filteredCourses.length === 1 ? "course" : "courses"} found
        </p>

        {/* Loading state */}
        {coursesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="dashboard-card h-80 animate-pulse bg-secondary/50" />
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No courses found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? "Try adjusting your search" : "No courses available yet"}
            </p>
          </div>
        ) : (
          /* Course Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Create Course Card - Always First */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div
                className="dashboard-card h-full min-h-[240px] flex flex-col items-center justify-center text-center cursor-pointer hover:border-accent/50 transition-colors p-4"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-3">
                  <Sparkles className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">
                  Create New Course
                </h3>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed max-w-[180px]">
                  Generate an AI-powered course on any topic
                </p>
                <Button size="sm" className="gap-1.5 text-xs h-8">
                  <Plus className="w-3.5 h-3.5" />
                  Create Course
                </Button>
              </div>
            </motion.div>

            {filteredCourses.map((course, index) => {
              const isEnrolled = enrolledCourseIds.has(course.id);
              const enrollment = enrollments.find((e) => e.course_id === course.id);

              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (index + 1) * 0.05 }}
                >
                  <div
                    className="dashboard-card card-lift overflow-hidden cursor-pointer group p-4"
                    onClick={() => navigate(`/course/${course.id}`)}
                  >
                    {/* Course Image */}
                    <div className="relative h-28 -mx-4 -mt-4 mb-3 overflow-hidden">
                      <img
                        src={course.image_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop"}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-0.5 bg-card/90 backdrop-blur-sm rounded-full text-[10px] font-medium text-foreground">
                          {course.categories?.name || "General"}
                        </span>
                      </div>
                      {/* Delete button - only show for course creator */}
                      {course.created_by === user?.id && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              className="absolute top-2 right-2 p-1.5 bg-destructive/90 backdrop-blur-sm rounded-full text-destructive-foreground hover:bg-destructive transition-colors z-10"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Course</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{course.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCourse(course.id, e);
                                }}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {deleteCourse.isPending ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  "Delete"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>

                    {/* Course Info */}
                    <h3 className="text-sm font-semibold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {course.description || "No description available"}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {course.total_lessons} lessons
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {course.duration_hours}h
                      </span>
                    </div>

                    {/* Progress or Enroll */}
                    {isEnrolled && enrollment ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium text-foreground">{enrollment.progress}%</span>
                        </div>
                        <Progress value={enrollment.progress} className="h-1" />
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        className="w-full h-7 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEnroll(course.id, e);
                        }}
                        disabled={enrollInCourse.isPending}
                      >
                        {enrollInCourse.isPending ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <>
                            Enroll Now
                            <ChevronRight className="w-3 h-3 ml-1" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      <CreateCourseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

export default CoursesPage;
