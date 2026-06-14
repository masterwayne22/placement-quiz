export interface Question {
  id: number;
  subject: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  codeSnippet?: string;
  language?: string;
  explanation: string;
}

export type QuizMode = "practice" | "mock";

export interface Subject {
  id: string;
  name: string;
  icon: string;
  description: string;
  questionCount: number;
  featuredTopic: string;
}

export interface UserStats {
  completedQuizzes: number;
  totalQuestionsAnswered: number;
  overallAccuracy: number;
  subjectScores: Record<string, { correct: number; total: number }>;
  mockHighScore: number;
  perfectScores: number;
}
