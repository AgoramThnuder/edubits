import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart3, Home, CheckCircle2, Circle, Trophy, BookOpen,
  Clock, Target, TrendingUp, XCircle, Loader2, ChevronRight
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCourseDetails } from "@/hooks/useCourseDetails";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

const CoursePerformancePage = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const { data: course, isLoading: courseLoading } = useCourseDetails(courseId);

  // Fetch quiz completion record
  const { data: quizCompletion, isLoading: quizLoading } = useQuery({
    queryKey: ["quiz-completion", courseId, user?.id],
    queryFn: async () => {
      if (!user || !courseId) return null;
      // Get quiz id for this course first
      const { data: quiz } = await supabase
        .from("quizzes")
        .select("id")
        .eq("course_id", courseId)
        .single();
      if (!quiz) return null;

      const { data } = await supabase
        .from("quiz_completions")
        .select("*")
        .eq("user_id", user.id)
        .eq("quiz_id", quiz.id)
        .single();
      return data;
    },
    enabled: !!user && !!courseId,
  });

  // Fetch enrollment for overall progress
  const { data: enrollment } = useQuery({
    queryKey: ["enrollment-progress", courseId, user?.id],
    queryFn: async () => {
      if (!user || !courseId) return null;
      const { data } = await supabase
        .from("user_enrollments")
        .select("*")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .single();
      return data;
    },
    enabled: !!user && !!courseId,
  });

  if (courseLoading || quizLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Course not found.</p>
        <Link to="/courses" className="text-primary hover:underline">Back to Courses</Link>
      </div>
    );
  }

  const allLessons = course.modules.flatMap(m => m.lessons);
  const completedLessons = allLessons.filter(l => l.completed);
  const totalLessons = allLessons.length;
  const lessonProgress = totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0;

  const quizScore = quizCompletion?.score ?? null;
  const quizTotal = quizCompletion?.total_questions ?? course.quiz?.questions.length ?? 0;
  const quizPercent = quizScore !== null && quizTotal > 0 ? Math.round((quizScore / quizTotal) * 100) : null;
  const quizPassed = quizPercent !== null && quizPercent >= 60;

  const completedModules = course.modules.filter(m => m.completed).length;

  // Determine learning status
  let status = "Not Started";
  let statusColor = "text-muted-foreground";
  if (lessonProgress === 100 && quizPercent !== null && quizPassed) {
    status = "Completed ✓";
    statusColor = "text-success";
  } else if (lessonProgress === 100 && quizPercent !== null && !quizPassed) {
    status = "Lessons Done — Retake Quiz";
    statusColor = "text-amber-500";
  } else if (lessonProgress === 100) {
    status = "Lessons Done — Quiz Pending";
    statusColor = "text-amber-500";
  } else if (lessonProgress > 0) {
    status = "In Progress";
    statusColor = "text-primary";
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            to={`/course/${courseId}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Back to Course
          </Link>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Performance Report</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* Course title + status */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
            <h1 className="text-2xl font-bold text-foreground line-clamp-2">{course.title}</h1>
            <span className={`text-sm font-semibold ${statusColor}`}>{status}</span>
          </div>
          <p className="text-muted-foreground text-sm">{course.description}</p>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            {
              icon: <BookOpen className="w-5 h-5 text-primary" />,
              label: "Lessons Done",
              value: `${completedLessons.length} / ${totalLessons}`,
              bg: "bg-primary/10"
            },
            {
              icon: <Target className="w-5 h-5 text-violet-500" />,
              label: "Modules Done",
              value: `${completedModules} / ${course.modules.length}`,
              bg: "bg-violet-500/10"
            },
            {
              icon: <TrendingUp className="w-5 h-5 text-amber-500" />,
              label: "Overall Progress",
              value: `${enrollment?.progress ?? lessonProgress}%`,
              bg: "bg-amber-500/10"
            },
            {
              icon: <Trophy className="w-5 h-5 text-emerald-500" />,
              label: "Quiz Score",
              value: quizScore !== null ? `${quizScore} / ${quizTotal}` : "Not taken",
              bg: "bg-emerald-500/10"
            },
          ].map((card, i) => (
            <div key={i} className="dashboard-card p-4 space-y-3">
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                {card.icon}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{card.label}</p>
                <p className="text-lg font-bold text-foreground">{card.value}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Lesson Progress */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="dashboard-card p-6 space-y-5"
        >
          <div className="flex items-center gap-3 mb-1">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Lesson Progress</h2>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>{completedLessons.length} of {totalLessons} lessons completed</span>
              <span className="font-semibold text-foreground">{lessonProgress}%</span>
            </div>
            <Progress value={lessonProgress} className="h-2" />
          </div>

          {/* Module breakdown */}
          <div className="space-y-3">
            {course.modules.map((mod) => {
              const modCompleted = mod.lessons.filter(l => l.completed).length;
              const modTotal = mod.lessons.length;
              const modPct = modTotal > 0 ? Math.round((modCompleted / modTotal) * 100) : 0;

              return (
                <div key={mod.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {mod.completed
                        ? <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                        : <Circle className="w-4 h-4 text-muted-foreground shrink-0" />}
                      <span className="text-foreground line-clamp-1">{mod.title}</span>
                    </div>
                    <span className="text-muted-foreground shrink-0 ml-2">{modCompleted}/{modTotal}</span>
                  </div>
                  <Progress value={modPct} className="h-1.5 ml-6" />
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Quiz Report */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="dashboard-card p-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-foreground">Final Quiz Report</h2>
          </div>

          {quizScore === null ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Trophy className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">Quiz not taken yet</p>
              <p className="text-sm text-muted-foreground mt-1">Complete all lessons and take the final quiz to see your score here.</p>
              <Button asChild className="mt-5" size="sm">
                <Link to={`/course/${courseId}`}>Go to Course</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Score circle */}
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <div className={`w-32 h-32 rounded-full flex flex-col items-center justify-center border-4 ${quizPassed ? 'border-success bg-success/10' : 'border-destructive bg-destructive/10'}`}>
                  <span className={`text-3xl font-bold ${quizPassed ? 'text-success' : 'text-destructive'}`}>
                    {quizPercent}%
                  </span>
                  <span className="text-xs text-muted-foreground mt-0.5">
                    {quizScore}/{quizTotal}
                  </span>
                </div>
                <div className="space-y-3 flex-1">
                  <div className={`flex items-center gap-2 ${quizPassed ? 'text-success' : 'text-destructive'}`}>
                    {quizPassed
                      ? <CheckCircle2 className="w-5 h-5" />
                      : <XCircle className="w-5 h-5" />}
                    <span className="font-semibold text-lg">
                      {quizPassed ? "Quiz Passed!" : "Quiz Not Passed"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {quizPassed
                      ? `Great work! You scored ${quizPercent}% which meets the passing threshold of 60%.`
                      : `You scored ${quizPercent}%. A score of 60% or higher is needed to pass. Keep studying and try again!`}
                  </p>
                  {/* Score bar */}
                  <div>
                    <Progress value={quizPercent ?? 0} className={`h-3 ${!quizPassed ? '[&>div]:bg-destructive' : ''}`} />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0%</span>
                      <span className="text-amber-500">Pass: 60%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {quizCompletion?.completed_at && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>Taken on {new Date(quizCompletion.completed_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                    </div>
                  )}
                </div>
              </div>

              {!quizPassed && (
                <Button asChild className="w-full sm:w-auto">
                  <Link to={`/course/${courseId}`}>Retake Quiz</Link>
                </Button>
              )}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default CoursePerformancePage;
