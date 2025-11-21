"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { QuestionCard } from "./question-card";
import { Question } from "@/lib/types/prd";

interface QuestionsFormProps {
  questions: Question[];
  initialAnswers?: Record<string, string>;
  onSubmit: (answers: Record<string, string>) => void;
  isSubmitting?: boolean;
  error?: string;
}

export function QuestionsForm({
  questions,
  initialAnswers = {},
  onSubmit,
  isSubmitting = false,
  error = "",
}: QuestionsFormProps) {
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    // Initialize with defaults or provided answers
    const initial: Record<string, string> = {};
    questions.forEach((q) => {
      initial[q.id.toString()] = initialAnswers[q.id.toString()] || q.default;
    });
    return initial;
  });

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId.toString()]: value,
    }));
  };

  const handleUseDefaults = () => {
    const defaults: Record<string, string> = {};
    questions.forEach((q) => {
      defaults[q.id.toString()] = q.default;
    });
    setAnswers(defaults);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(answers);
  };

  const answeredCount = Object.values(answers).filter(
    (v) => v && v.trim() !== ""
  ).length;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Progress counter */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-mono text-muted-foreground">
          {answeredCount} of {questions.length} answered
        </p>
        <button
          type="button"
          onClick={handleUseDefaults}
          className="text-sm text-primary hover:text-primary/80 transition-colors"
        >
          Use all recommended
        </button>
      </div>

      {/* Questions */}
      <div className="space-y-8">
        {questions.map((question, index) => (
          <div
            key={question.id}
            className="animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <QuestionCard
              question={question}
              value={answers[question.id.toString()] || ""}
              onChange={(value) => handleAnswerChange(question.id, value)}
            />
          </div>
        ))}
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Submit button */}
      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          size="lg"
          className="bg-primary hover:bg-primary/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="mr-2">Processing...</span>
              <span className="animate-spin">⏳</span>
            </>
          ) : (
            "Continue to Tech Stack"
          )}
        </Button>
      </div>
    </form>
  );
}
