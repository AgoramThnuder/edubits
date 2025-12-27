import { motion } from "framer-motion";
import { ClipboardList, CheckCircle2, XCircle } from "lucide-react";
import { forwardRef, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Assignment {
  id: string;
  title: string;
  score: number | null;
}

type Question = {
  id: string;
  prompt: string;
  options: { id: string; label: string }[];
  correctOptionId: string;
};

interface AssignmentContentProps {
  assignment: Assignment;
  onBackToLessons: () => void;
}

const AssignmentContent = forwardRef<HTMLDivElement, AssignmentContentProps>(
  ({ assignment, onBackToLessons }, ref) => {
  const questions = useMemo<Question[]>(
    () => [
      {
        id: "q1",
        prompt: "Supervised learning uses which type of data?",
        options: [
          { id: "a", label: "Unlabeled data" },
          { id: "b", label: "Labeled data" },
          { id: "c", label: "Random data only" },
        ],
        correctOptionId: "b",
      },
      {
        id: "q2",
        prompt: "Churn prediction (leave/stay) is an example of:",
        options: [
          { id: "a", label: "Classification" },
          { id: "b", label: "Regression" },
          { id: "c", label: "Clustering" },
        ],
        correctOptionId: "a",
      },
    ],
    []
  );

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = useMemo(() => {
    if (!submitted) return null;
    let correct = 0;
    for (const q of questions) {
      if (answers[q.id] === q.correctOptionId) correct += 1;
    }
    return Math.round((correct / questions.length) * 100);
  }, [answers, questions, submitted]);

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ClipboardList className="w-4 h-4" />
            <span className="text-foreground font-medium">{assignment.title}</span>
          </div>
          <Button variant="outline" onClick={onBackToLessons}>
            Back to lessons
          </Button>
        </div>
      </div>

      <div className="notebook-paper min-h-[calc(100vh-60px)]">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-3xl mx-auto"
        >
          <div className="notebook-block py-12">
            <h1 className="text-3xl font-display font-semibold text-foreground mb-3">{assignment.title}</h1>
            <p className="text-muted-foreground mb-8">
              Answer all questions, then click Submit to see your score.
            </p>

            <div className="space-y-4">
              {questions.map((q, idx) => {
                const selected = answers[q.id];
                return (
                  <Card key={q.id} className="p-5">
                    <p className="font-medium text-foreground mb-3">
                      {idx + 1}. {q.prompt}
                    </p>
                    <div className="space-y-2">
                      {q.options.map((o) => {
                        const isSelected = selected === o.id;
                        const isCorrect = submitted && o.id === q.correctOptionId;
                        const isWrongSelected = submitted && isSelected && o.id !== q.correctOptionId;

                        return (
                          <button
                            key={o.id}
                            type="button"
                            disabled={submitted}
                            onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: o.id }))}
                            className={
                              "w-full text-left rounded-lg border-2 px-4 py-3 transition-all " +
                              (isCorrect
                                ? "border-green-500 bg-green-500/10"
                                : isWrongSelected
                                  ? "border-red-500 bg-red-500/10"
                                  : isSelected
                                    ? "border-blue-500 bg-blue-500/5"
                                    : "border-border hover:border-blue-300")
                            }
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-foreground">{o.label}</span>
                              {isCorrect && (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                              )}
                              {isWrongSelected && (
                                <XCircle className="w-5 h-5 text-red-500" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <Button variant="outline" onClick={() => {
                setAnswers({});
                setSubmitted(false);
              }}>
                Reset
              </Button>
              <Button
                disabled={submitted || questions.some((q) => !answers[q.id])}
                onClick={() => setSubmitted(true)}
              >
                Submit
              </Button>
            </div>

            {submitted && score !== null && (
              <div className="mt-6 rounded-lg border border-border bg-card p-5">
                <p className="text-foreground font-medium">Your score: {score}%</p>
                <p className="text-muted-foreground text-sm mt-1">
                  (This is demo scoring for now; we can save it to your backend next.)
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
});

AssignmentContent.displayName = "AssignmentContent";

export default AssignmentContent;
