export type QuestionTopic = 
  | 'spot_error'
  | 'sentence_improvement'
  | 'fill_blanks'
  | 'one_word'
  | 'idioms_phrases'
  | 'synonyms'
  | 'antonyms'
  | 'misspelled'
  | 'cloze_test';

export interface Question {
  id: string;
  topic: QuestionTopic;
  questionText: string;
  options: string[];
  correctAnswer: number; // 0-indexed
  explanation: string;
  grammarRule?: string;
  examTag?: string; // e.g. "SSC CGL 2024", "SSC CHSL 2025"
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface QuizAttempt {
  id: string;
  title: string;
  topic?: QuestionTopic;
  totalQuestions: number;
  score: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  timeSpentSeconds: number;
  date: string;
  userAnswers: Record<string, number>; // questionId -> chosen index
}

export interface VocabItem {
  id: string;
  word: string;
  meaning: string;
  type: 'synonym' | 'antonym' | 'ows' | 'idiom' | 'spelling';
  synonyms?: string[];
  antonyms?: string[];
  exampleSentence?: string;
  hindiMeaning?: string;
  examTag?: string;
}

export interface GrammarRuleItem {
  id: number;
  title: string;
  category: string;
  ruleDescription: string;
  formula?: string;
  hindiExplanation?: string;
  incorrectExample?: string;
  correctExample?: string;
  explanation?: string;
  moreExamples?: { incorrect?: string; correct: string; note?: string }[];
  tags?: string[];
  pyqs?: {
    id: string;
    topic: string;
    questionText: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    examTag?: string;
    difficulty?: string;
  }[];
}

export type AppView = 
  | 'dashboard' 
  | 'topic_sets'
  | 'quiz' 
  | 'result' 
  | 'vocab' 
  | 'mistakes' 
  | 'bookmarks' 
  | 'grammar'
  | 'grammar_checker'
  | 'profile'
  | 'admin';

export interface QuizState {
  topic?: QuestionTopic;
  questions: Question[];
  currentIndex: number;
  userAnswers: Record<string, number>; // questionId -> chosen option index
  markedForReview: Record<string, boolean>;
  isSubmitted: boolean;
  timeRemainingSeconds: number;
  totalTimeSeconds: number;
  quizTitle: string;
}
