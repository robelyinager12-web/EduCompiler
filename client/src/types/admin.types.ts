import type { Difficulty } from "./learning.types";

export interface AdminStats {
  students: number;
  programs: number;
  compilations: number;
  successfulCompilations: number;
  failedCompilations: number;
  lessons: number;
  exercises: number;
  submissions: number;
}

export interface StudentRow {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  _count: { programs: number; runs: number };
}

export interface LessonInput {
  title: string;
  description: string;
  content: string;
  category: string;
  difficulty: Difficulty;
}

export interface ExerciseInput {
  title: string;
  description: string;
  instructions: string;
  starterCode: string;
  expectedConcept: string;
  difficulty: Difficulty;
}

// What GET /admin/exercises returns: everything, including the answer key.
export interface AdminExercise extends ExerciseInput {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConceptInfo {
  key: string;
  label: string;
  description: string;
}
