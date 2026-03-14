import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, CheckCircle2, XCircle, RotateCcw, Trophy, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Quiz } from "@/hooks/useCourseDetails";

interface CourseQuizProps {
    quiz: Quiz;
    onToggleSidebar: () => void;
    onFinish?: (score: number, total: number) => void;
    onGenerateNextCourse?: () => void;
}

const CourseQuiz = ({ quiz, onToggleSidebar, onFinish, onGenerateNextCourse }: CourseQuizProps) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    // If no questions, we shouldn't really be here, but handle gracefully
    if (!quiz.questions || quiz.questions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-screen space-y-4">
                <p className="text-muted-foreground">No questions available for this course.</p>
            </div>
        );
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const isFirstQuestion = currentQuestionIndex === 0;
    const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

    const handleSelectOption = (index: number) => {
        if (isAnswerRevealed) return;
        setSelectedOption(index);
    };

    const handleCheckAnswer = () => {
        if (selectedOption === null || isAnswerRevealed) return;

        setIsAnswerRevealed(true);

        if (selectedOption === currentQuestion.correct_option_index) {
            setScore((prev) => prev + 1);
        }
    };

    const handleNextQuestion = () => {
        if (!isLastQuestion) {
            setCurrentQuestionIndex((prev) => prev + 1);
            setSelectedOption(null);
            setIsAnswerRevealed(false);
        } else {
            setIsFinished(true);
            if (onFinish) {
                onFinish(score + (selectedOption === currentQuestion.correct_option_index ? 1 : 0), quiz.questions.length);
            }
        }
    };

    const handleRetry = () => {
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setIsAnswerRevealed(false);
        setScore(0);
        setIsFinished(false);
    };

    if (isFinished) {
        const percentage = Math.round((score / quiz.questions.length) * 100);
        const passed = percentage >= 60;

        return (
            <div className="min-h-screen">
                <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onToggleSidebar}
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                        >
                            <Menu className="w-5 h-5 text-muted-foreground" />
                        </button>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Final Quiz</span>
                            <ChevronRight className="w-4 h-4" />
                            <span className="text-foreground font-medium">Result</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center min-h-[calc(100vh-60px)] px-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="max-w-md w-full text-center space-y-8"
                    >
                        <div className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center ${passed ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                            <Trophy className="w-12 h-12" />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold font-display">
                                {passed ? "Congratulations!" : "Keep Trying!"}
                            </h2>
                            <p className="text-muted-foreground">
                                You scored <span className="font-semibold text-foreground">{score}</span> out of <span className="font-semibold text-foreground">{quiz.questions.length}</span>
                            </p>
                        </div>

                        <div className="w-full bg-muted rounded-full h-4 mb-4 overflow-hidden">
                            <div
                                className={`h-full transition-all duration-1000 ${passed ? 'bg-primary' : 'bg-destructive'}`}
                                style={{ width: `${percentage}%` }}
                            />
                        </div>

                        <p className="text-sm font-medium">
                            {percentage}%
                        </p>

                        <Button onClick={handleRetry} className="w-full gap-2 mt-8" variant="outline">
                            <RotateCcw className="w-4 h-4" />
                            Retake Quiz
                        </Button>
                        
                        {passed && onGenerateNextCourse && (
                            <Button onClick={onGenerateNextCourse} className="w-full gap-2 mt-4" variant="default" size="lg">
                                <Trophy className="w-4 h-4" />
                                Continue Learning: Generate Next Level Course
                            </Button>
                        )}
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Toolbar */}
            <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onToggleSidebar}
                        className="p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                        <Menu className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Course Quiz</span>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-foreground font-medium">
                            Question {currentQuestionIndex + 1} of {quiz.questions.length}
                        </span>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 h-[2px] bg-primary transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex) / quiz.questions.length) * 100}%` }}
                />
            </div>

            {/* Quiz content */}
            <div className="max-w-2xl mx-auto py-12 px-4 md:px-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestion.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-8"
                    >
                        <h2 className="text-2xl md:text-3xl font-display font-semibold text-foreground leading-tight">
                            {currentQuestion.question}
                        </h2>

                        <div className="space-y-3">
                            {currentQuestion.options.map((option, index) => {
                                const isSelected = selectedOption === index;
                                const isCorrect = index === currentQuestion.correct_option_index;

                                let buttonClass = "w-full text-left p-4 md:p-6 rounded-xl border border-border/50 bg-background hover:border-primary/50 hover:bg-muted/50 transition-all text-base md:text-lg flex items-center justify-between group";

                                if (isSelected && !isAnswerRevealed) {
                                    buttonClass = "w-full text-left p-4 md:p-6 rounded-xl border-2 border-primary bg-primary/5 transition-all text-base md:text-lg flex items-center justify-between";
                                } else if (isAnswerRevealed) {
                                    if (isCorrect) {
                                        buttonClass = "w-full text-left p-4 md:p-6 rounded-xl border-2 border-green-500 bg-green-500/10 text-green-700 dark:text-green-400 transition-all text-base md:text-lg flex items-center justify-between";
                                    } else if (isSelected && !isCorrect) {
                                        buttonClass = "w-full text-left p-4 md:p-6 rounded-xl border-2 border-red-500 bg-red-500/10 text-red-700 dark:text-red-400 transition-all text-base md:text-lg flex items-center justify-between";
                                    } else {
                                        buttonClass = "w-full text-left p-4 md:p-6 rounded-xl border border-border/50 bg-muted/30 opacity-60 transition-all text-base md:text-lg flex items-center justify-between";
                                    }
                                }

                                return (
                                    <button
                                        key={index}
                                        onClick={() => handleSelectOption(index)}
                                        disabled={isAnswerRevealed}
                                        className={buttonClass}
                                    >
                                        <span>{option}</span>
                                        <div className="flex-shrink-0 ml-4">
                                            {isAnswerRevealed && isCorrect && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                                            {isAnswerRevealed && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-red-500" />}
                                            {!isAnswerRevealed && (
                                                <div className={`w-5 h-5 rounded-full border-2 ${isSelected ? 'border-primary bg-primary' : 'border-muted-foreground group-hover:border-primary/50'} transition-colors`} />
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="pt-8 border-t border-border flex justify-end">
                            {!isAnswerRevealed ? (
                                <Button
                                    onClick={handleCheckAnswer}
                                    disabled={selectedOption === null}
                                    size="lg"
                                    className="w-full sm:w-auto"
                                >
                                    Check Answer
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleNextQuestion}
                                    size="lg"
                                    className="w-full sm:w-auto gap-2"
                                >
                                    {isLastQuestion ? "Finish Quiz" : "Next Question"}
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default CourseQuiz;
