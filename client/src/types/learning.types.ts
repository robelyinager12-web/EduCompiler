export type Difficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export interface LessonSummary {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  createdAt: string;
}

export interface Lesson extends LessonSummary {
  content: string;
}

export interface ExerciseSummary {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  createdAt: string;
}

export interface Exercise extends ExerciseSummary {
  instructions: string;
  starterCode: string;
}

export interface Progress {
  programs: number;
  compilations: number;
  completedLessonIds: string[];
  totalLessons: number;
  completedExerciseIds: string[];
  totalExercises: number;
}

export interface SubmissionResult {
  status: "SUCCESS" | "FAILED";
  failedPhase: string | null;
  errorCount: number;
  warningCount: number;
  errors: { phase: string; message: string; line: number; column: number }[];
  conceptChecked: boolean;
  passed: boolean | null;
  feedback: string;
}

export interface Submission {
  id: string;
  exerciseId: string;
  submittedAt: string;
  result: SubmissionResult;
}
