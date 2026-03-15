import { forwardRef, useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Menu, Clock, Loader2, MessageCircleQuestion, Terminal, Copy, Check, CheckCircle2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMarkLessonComplete } from "@/hooks/useCourseDetails";
import { useLessonQuizCompletion } from "@/hooks/useLessonQuizCompletion";

interface Lesson {
  id: string;
  title: string;
  content: string;
  duration_minutes: number;
  completed: boolean;
}

interface LessonContentProps {
  courseId: string;
  lesson: Lesson | undefined;
  moduleTitle?: string;
  allLessons: Lesson[];
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
  onNavigate: (lessonId: string) => void;
  onTakeQuiz?: () => void;
  hasQuiz?: boolean;
  onOpenChat?: () => void;
}

const LessonContent = forwardRef<HTMLDivElement, LessonContentProps>(({
  courseId,
  lesson,
  moduleTitle,
  allLessons,
  onToggleSidebar,
  sidebarCollapsed,
  onNavigate,
  onTakeQuiz,
  hasQuiz,
  onOpenChat
}, ref) => {
  const { markComplete } = useMarkLessonComplete(courseId);
  const { mcqCompleted: mcqPrevDoneFromDB, modQuizCompleted: modQuizPrevDoneFromDB, markComplete: saveQuizComplete } = useLessonQuizCompletion(courseId, lesson?.id);
  const [isCompleting, setIsCompleting] = useState(false);
  // Lesson MCQ state
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  // Module Quiz state
  const [quizSelections, setQuizSelections] = useState<(number | null)[]>([]);
  const [quizShown, setQuizShown] = useState<boolean[]>([]);
  const [isCopied, setIsCopied] = useState(false);
  // "Retaking" flags: hides completed banner so user can retake
  const [mcqRetaking, setMcqRetaking] = useState(false);
  const [modQuizRetaking, setModQuizRetaking] = useState(false);

  // Refs to hold parsed content so we can use it in handlers
  const mcqRef = useRef<any>(null);
  const moduleQuizQuestionsRef = useRef<any[]>([]);

  // Reset all state when lesson changes
  useEffect(() => {
    setSelectedOption(null);
    setShowResult(false);
    setQuizSelections([]);
    setQuizShown([]);
    setMcqRetaking(false);
    setModQuizRetaking(false);
  }, [lesson?.id]);

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <p className="text-muted-foreground">Select a lesson to begin</p>
      </div>
    );
  }

  const currentIndex = allLessons.findIndex(l => l.id === lesson.id);
  const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  // Parse content
  let theoryText = lesson.content;
  let codeSnippet: string | null = null;
  let mcq: any = null;
  let isModuleQuiz = false;
  let moduleQuizQuestions: any[] = [];

  try {
    const parsed = JSON.parse(lesson.content);
    if (parsed && typeof parsed === 'object') {
      if (parsed.is_module_quiz) {
        isModuleQuiz = true;
        const rawQuiz = parsed.quiz;
        moduleQuizQuestions = Array.isArray(rawQuiz) ? rawQuiz : [rawQuiz];
        theoryText = '';
      } else {
        theoryText = parsed.theory || '';
        codeSnippet = parsed.code || null;
        mcq = parsed.mcq || null;
      }
    }
  } catch (e) {
    // Legacy string content
  }

  // Update refs so handlers can access parsed content
  mcqRef.current = mcq;
  moduleQuizQuestionsRef.current = moduleQuizQuestions;

  const contentParagraphs = theoryText
    .split(/\n\n+/)
    .map((p: string) => p.trim())
    .filter((p: string) => p.length > 0);

  // localStorage keys (still used as a fast cache, authoritative read comes from hook)
  const mcqStorageKey = `edubits_mcq_${lesson.id}`;
  const modQuizStorageKey = `edubits_modquiz_${lesson.id}`;

  // Completed if Supabase OR localStorage says so, and not actively retaking
  const isMcqPrevDone = !mcqRetaking && mcqPrevDoneFromDB;
  const isModQuizPrevDone = !modQuizRetaking && modQuizPrevDoneFromDB;

  // Check if all module quiz questions are answered correctly
  const allModuleQuizPassed = isModuleQuiz &&
    moduleQuizQuestions.length > 0 &&
    moduleQuizQuestions.every(
      (q: any, i: number) => quizShown[i] === true && quizSelections[i] === q.correct_option_index
    );

  const handleNext = async () => {
    setIsCompleting(true);
    await markComplete(lesson.id);
    setIsCompleting(false);
    if (nextLesson) {
      onNavigate(nextLesson.id);
    } else if (hasQuiz && onTakeQuiz) {
      onTakeQuiz();
    }
  };

  // Next button should NOT be locked if quiz was previously completed
  const isNextLocked =
    isCompleting ||
    (!nextLesson && !hasQuiz) ||
    (mcq && !isMcqPrevDone && (!showResult || selectedOption !== mcq.correct_option_index)) ||
    (isModuleQuiz && !isModQuizPrevDone && !allModuleQuizPassed);

  return (
    <div ref={ref} className="min-h-screen">
      {/* Toolbar */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{moduleTitle || "Module"}</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium">{lesson.title}</span>
          </div>
          <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{lesson.duration_minutes} min</span>
          </div>
        </div>
      </div>

      {/* Notebook content */}
      <div className="notebook-paper min-h-[calc(100vh-60px)]">
        <motion.div
          key={lesson.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mx-auto max-w-4xl px-4"
        >
          <div className="notebook-block py-12">
            <div className="flex flex-col">
              <div className="flex flex-col">
                {/* Lesson title */}
                {!isModuleQuiz && (
                  <h1 className="text-3xl font-display font-semibold text-foreground mb-8">
                    {lesson.title}
                  </h1>
                )}

                {/* Lesson content */}
                {!isModuleQuiz && (
                  <div className="space-y-6">
                    {contentParagraphs.map((paragraph: string, index: number) => (
                      <p key={index} className="text-foreground/90 leading-loose">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Code Example */}
              {codeSnippet && !isModuleQuiz && (
                <div className="mt-8 w-full rounded-xl overflow-hidden border border-border/50 bg-[#0d1117] shadow-lg">
                  <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-white/10 text-slate-300">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4" />
                      <span className="text-xs font-semibold tracking-wider text-slate-300">Example Code</span>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(codeSnippet!);
                        setIsCopied(true);
                        setTimeout(() => setIsCopied(false), 2000);
                      }}
                      className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {isCopied ? (
                        <><Check className="w-3.5 h-3.5 text-emerald-400" /><span className="text-emerald-400 font-medium">Copied!</span></>
                      ) : (
                        <><Copy className="w-3.5 h-3.5" /><span>Copy code</span></>
                      )}
                    </button>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <code className="text-sm font-mono whitespace-pre text-slate-50 leading-relaxed block">
                      {codeSnippet}
                    </code>
                  </div>
                </div>
              )}

              {/* Lesson MCQ */}
              {mcq && !isModuleQuiz && (
                <div className="mt-8 border border-border bg-card rounded-xl p-6 shadow-sm w-full">
                  <h3 className="text-xl font-medium text-foreground mb-4">Check Your Understanding</h3>

                  {/* Previously completed banner */}
                  {isMcqPrevDone ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-lg bg-success/10 border border-success/20">
                        <div className="flex items-center gap-2 text-success">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="font-medium">Quiz already completed!</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => { setMcqRetaking(true); setSelectedOption(null); setShowResult(false); }}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Retake
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-foreground/90 mb-4">{mcq.question}</p>
                      <div className="space-y-3">
                        {mcq.options.map((option: string, i: number) => {
                          const isSelected = selectedOption === i;
                          const isCorrect = i === mcq.correct_option_index;
                          const showAsCorrect = showResult && isCorrect;
                          const showAsWrong = showResult && isSelected && !isCorrect;
                          return (
                            <button
                              key={i}
                              onClick={() => { if (!showResult) setSelectedOption(i); }}
                              disabled={showResult}
                              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${showAsCorrect ? "border-success bg-success/10 text-success" : showAsWrong ? "border-destructive bg-destructive/10 text-destructive" : isSelected ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/50 bg-background"}`}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                      {!showResult && selectedOption !== null && (
                        <Button className="mt-6" onClick={() => {
                          setShowResult(true);
                          if (selectedOption === mcq.correct_option_index) {
                            saveQuizComplete("mcq");
                          }
                        }}>Check Answer</Button>
                      )}
                      {showResult && (
                        <div className="mt-4 p-4 rounded-lg bg-muted text-foreground/80 flex items-center justify-between">
                          <span>{selectedOption === mcq.correct_option_index ? "Great job! That's correct." : "Not quite! Try again."}</span>
                          {selectedOption !== mcq.correct_option_index && (
                            <Button variant="outline" size="sm" onClick={() => { setShowResult(false); setSelectedOption(null); }}>Try Again</Button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Module Assessment — array of questions */}
              {isModuleQuiz && moduleQuizQuestions.length > 0 && (
                <div className="space-y-8 mt-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold text-foreground">Module Assessment</h2>
                      {!isModQuizPrevDone && (
                        <p className="text-muted-foreground text-sm mt-1">Answer all {moduleQuizQuestions.length} questions correctly to continue.</p>
                      )}
                    </div>
                    {/* Retake button when previously completed */}
                    {isModQuizPrevDone && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 shrink-0"
                        onClick={() => { setModQuizRetaking(true); setQuizSelections([]); setQuizShown([]); }}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Retake
                      </Button>
                    )}
                  </div>

                  {/* Previously completed banner */}
                  {isModQuizPrevDone && (
                    <div className="flex items-center gap-2 p-4 rounded-lg bg-success/10 border border-success/20 text-success">
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                      <span className="font-medium">Module assessment already completed! Click Retake to try again.</span>
                    </div>
                  )}

                  {/* Questions — only shown when not in prev-done state */}
                  {!isModQuizPrevDone && moduleQuizQuestions.map((q: any, qIdx: number) => {
                    const sel = quizSelections[qIdx] ?? null;
                    const shown = quizShown[qIdx] ?? false;

                    return (
                      <div key={qIdx} className="border border-border bg-card rounded-xl p-6 shadow-sm">
                        <p className="text-xs text-muted-foreground mb-2 font-medium tracking-wide uppercase">
                          Question {qIdx + 1} of {moduleQuizQuestions.length}
                        </p>
                        <p className="text-foreground/90 text-base mb-4 font-medium">{q.question}</p>
                        <div className="space-y-3 mb-4">
                          {q.options.map((option: string, i: number) => {
                            const isSelected = sel === i;
                            const isCorrect = i === q.correct_option_index;
                            const showAsCorrect = shown && isCorrect;
                            const showAsWrong = shown && isSelected && !isCorrect;
                            return (
                              <button
                                key={i}
                                onClick={() => {
                                  if (!shown) {
                                    const newSel = [...quizSelections];
                                    newSel[qIdx] = i;
                                    setQuizSelections(newSel);
                                  }
                                }}
                                disabled={shown}
                                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${showAsCorrect ? "border-success bg-success/10 text-success" : showAsWrong ? "border-destructive bg-destructive/10 text-destructive" : isSelected ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/50 bg-background"}`}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>

                        {!shown && sel !== null && (
                          <Button onClick={() => {
                            const newShown = [...quizShown];
                            newShown[qIdx] = true;
                            setQuizShown(newShown);
                            // Check if all questions are now correctly answered → save completion
                            const qs = moduleQuizQuestionsRef.current;
                            const newSels = [...quizSelections];
                            newSels[qIdx] = sel; // ensure current sel is included
                            const allDone = qs.every((q2: any, i: number) =>
                              i === qIdx ? sel === q2.correct_option_index : (newShown[i] && newSels[i] === q2.correct_option_index)
                            );
                            if (allDone) {
                              saveQuizComplete("module_quiz");
                            }
                          }}>
                            Check Answer
                          </Button>
                        )}

                        {shown && (
                          <div className={`mt-4 p-4 rounded-lg ${sel === q.correct_option_index ? 'bg-success/10 border border-success/20' : 'bg-destructive/10 border border-destructive/20'}`}>
                            <p className={`font-semibold mb-1 ${sel === q.correct_option_index ? 'text-success' : 'text-destructive'}`}>
                              {sel === q.correct_option_index ? "Correct!" : "Incorrect — review the explanation."}
                            </p>
                            <p className="text-foreground/80 text-sm leading-relaxed">{q.explanation}</p>
                            {sel !== q.correct_option_index && (
                              <Button variant="outline" size="sm" className="mt-3" onClick={() => {
                                const newSel = [...quizSelections];
                                newSel[qIdx] = null;
                                setQuizSelections(newSel);
                                const newShown = [...quizShown];
                                newShown[qIdx] = false;
                                setQuizShown(newShown);
                              }}>
                                Retry
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-8 mt-10 border-t border-border gap-4 flex-wrap">
              <Button
                variant="outline"
                className="gap-2 shrink-0"
                disabled={!previousLesson}
                onClick={() => previousLesson && onNavigate(previousLesson.id)}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              {onOpenChat && (
                <Button
                  variant="secondary"
                  onClick={onOpenChat}
                  className="gap-2 flex-1 md:flex-none border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary"
                >
                  <MessageCircleQuestion className="w-4 h-4" />
                  Ask AI Tutor
                </Button>
              )}

              <Button
                className="gap-2"
                onClick={handleNext}
                disabled={isNextLocked}
              >
                {isCompleting && <Loader2 className="w-4 h-4 animate-spin" />}
                {nextLesson ? "Next Lesson" : hasQuiz ? "Take Course Quiz" : "Finished"}
                {(!isCompleting && (nextLesson || hasQuiz)) && <ChevronRight className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
});

LessonContent.displayName = "LessonContent";

export default LessonContent;
