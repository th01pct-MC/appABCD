export type QuestionType = 'multiple_choice' | 'true_false';

export type AnswerDetectionMethod = 
  | 'red_text'
  | 'underline'
  | 'explicit_answer'
  | 'admin_confirmed';

export type VerificationStatus = 'verified' | 'needs_review';

export interface Question {
  id: string;
  type: QuestionType;
  content: string;
  options?: {
    [key: string]: string; // A, B, C, D
  };
  correctAnswer?: string; // e.g. "A", "B", "C", "D"
  statements?: {
    [key: string]: string; // a, b, c, d
  };
  statementAnswers?: {
    [key: string]: boolean; // a: true, b: false
  };
  answerDetectionMethod: AnswerDetectionMethod;
  verificationStatus: VerificationStatus;
  detectionDetails?: string; // e.g. "Chữ màu đỏ (#FF0000) tại đáp án A"
  reviewReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientQuizQuestion {
  id: string;
  type: QuestionType;
  content: string;
  options?: {
    [key: string]: string;
  };
  statements?: {
    [key: string]: string;
  };
  // Note: correctAnswer & statementAnswers are intentionally omitted for student security
}

export interface Quiz {
  id: string; // e.g. "KT001"
  title: string;
  teacherName: string;
  teacherEmail: string;
  numMultipleChoice: number;
  numTrueFalse: number;
  durationMinutes: number;
  randomQuestions: boolean;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  individualRandomTests: boolean;
  autoSubmitOnTimeUp: boolean;
  showScoreAfterSubmit: boolean;
  showCorrectAnswersAfterSubmit: boolean;
  oneSubmissionPerStudent: boolean;
  warnTabSwitch: boolean;
  trackTabSwitchCount: boolean;
  status: 'active' | 'closed';
  createdAt: string;
  questionIds?: string[];
}

export interface StudentAnswerRecord {
  questionId: string;
  questionType: QuestionType;
  selectedAnswer?: string; // "A" | "B" | "C" | "D"
  statementAnswers?: {
    [key: string]: boolean;
  };
  isCorrect?: boolean;
  statementResults?: {
    [key: string]: boolean;
  };
  scoreAwarded?: number;
  answeredAt: string;
  history?: Array<{
    value: string | { [key: string]: boolean };
    timestamp: string;
  }>;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  studentName: string;
  studentClass: string;
  startedAt: string;
  submittedAt?: string;
  timeSpentSeconds?: number;
  durationMinutes: number;
  questionList: ClientQuizQuestion[];
  answers: {
    [questionId: string]: StudentAnswerRecord;
  };
  score?: number; // 0 to 10 scale, e.g. 8.80
  rawScore?: number;
  maxScore?: number;
  numCorrect?: number;
  numIncorrect?: number;
  isSubmitted: boolean;
  tabSwitchCount: number;
  emailSent?: boolean;
  emailError?: string;
}

export interface AppSettings {
  teacherName: string;
  teacherEmail: string;
  schoolName: string;
  logoUrl: string;
  emailNotificationsEnabled: boolean;
  instantFeedbackEnabled: boolean; // default false
  passScore: number; // default 5.0
}

export interface ParsedQuestionResult {
  total: number;
  multipleChoiceCount: number;
  trueFalseCount: number;
  verifiedCount: number;
  needsReviewCount: number;
  questions: Question[];
}
