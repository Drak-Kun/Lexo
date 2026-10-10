export interface Language {
  id: string;
  name: string;
  code: string;
  createdAt: string;
}

export type LearningStatus = "new" | "learning" | "familiar" | "mastered";

export interface Word {
  id: string;
  languageId: string;
  word: string;
  meaning: string;
  reading?: string;
  example?: string;
  notes?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  status: LearningStatus;
  reviewCount: number;
  correctCount: number;
  incorrectCount: number;
  lastReviewedAt?: string;
  streak: number;
}

export interface Grammar {
  id: string;
  languageId: string;
  grammarPoint: string;
  meaning: string;
  formation?: string;
  exampleSentence?: string;
  translation?: string;
  notes?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  status: LearningStatus;
  reviewCount: number;
  correctCount: number;
  incorrectCount: number;
  lastReviewedAt?: string;
  streak: number;
}

export type ContentType = "words" | "grammar" | "mixed";

export interface QuizQuestion {
  id: string;
  type: ContentType;
  contentId: string;
  questionType: QuestionType;
  question: string;
  correctAnswer: string;
  options?: string[];
  userAnswer?: string;
  isCorrect?: boolean;
  content: Word | Grammar;
}

export type QuestionType =
  | "language-to-meaning"
  | "meaning-to-language"
  | "multiple-choice"
  | "typing"
  | "fill-blank"
  | "context-choice";

export interface QuizSetup {
  contentType: ContentType;
  tags: string[];
  questionCount: number;
}

export interface QuizResult {
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  accuracy: number;
  mistakes: QuizQuestion[];
  completedAt: string;
}
