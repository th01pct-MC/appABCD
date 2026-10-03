import { 
  Question, 
  Quiz, 
  QuizAttempt, 
  AppSettings, 
  ClientQuizQuestion, 
  ParsedQuestionResult 
} from '../types/quiz';

export const api = {
  // Settings
  async getSettings(): Promise<AppSettings> {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error('Không thể tải cài đặt');
    return res.json();
  },

  async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Không thể lưu cài đặt');
    const data = await res.json();
    return data.settings;
  },

  // Questions
  async getQuestions(): Promise<Question[]> {
    const res = await fetch('/api/questions');
    if (!res.ok) throw new Error('Không thể tải ngân hàng câu hỏi');
    return res.json();
  },

  async createQuestion(question: Partial<Question>): Promise<Question> {
    const res = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(question),
    });
    if (!res.ok) throw new Error('Không thể tạo câu hỏi');
    const data = await res.json();
    return data.question;
  },

  async updateQuestion(id: string, question: Partial<Question>): Promise<Question> {
    const res = await fetch(`/api/questions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(question),
    });
    if (!res.ok) throw new Error('Không thể cập nhật câu hỏi');
    const data = await res.json();
    return data.question;
  },

  async deleteQuestion(id: string): Promise<boolean> {
    const res = await fetch(`/api/questions/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Không thể xóa câu hỏi');
    const data = await res.json();
    return data.success;
  },

  async clearAllQuestions(): Promise<boolean> {
    const res = await fetch('/api/questions-all', { method: 'DELETE' });
    if (!res.ok) throw new Error('Không thể xóa toàn bộ câu hỏi');
    const data = await res.json();
    return data.success;
  },

  async importQuestions(questions: Question[]): Promise<{ count: number; totalBankQuestions: number }> {
    const res = await fetch('/api/questions/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questions }),
    });
    if (!res.ok) throw new Error('Không thể lưu câu hỏi vào ngân hàng');
    return res.json();
  },

  // Quizzes
  async getQuizzes(): Promise<Quiz[]> {
    const res = await fetch('/api/quizzes');
    if (!res.ok) throw new Error('Không thể tải danh sách bài kiểm tra');
    return res.json();
  },

  async createQuiz(quiz: Partial<Quiz>): Promise<Quiz> {
    const res = await fetch('/api/quizzes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quiz),
    });
    if (!res.ok) throw new Error('Không thể tạo bài kiểm tra');
    const data = await res.json();
    return data.quiz;
  },

  async updateQuiz(id: string, quiz: Partial<Quiz>): Promise<Quiz> {
    const res = await fetch(`/api/quizzes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quiz),
    });
    if (!res.ok) throw new Error('Không thể cập nhật bài kiểm tra');
    const data = await res.json();
    return data.quiz;
  },

  async deleteQuiz(id: string): Promise<boolean> {
    const res = await fetch(`/api/quizzes/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Không thể xóa bài kiểm tra');
    const data = await res.json();
    return data.success;
  },

  // Student Flow
  async getPublicQuiz(code: string): Promise<{
    quiz: {
      id: string;
      title: string;
      teacherName: string;
      teacherEmail: string;
      numMultipleChoice: number;
      numTrueFalse: number;
      durationMinutes: number;
      warnTabSwitch: boolean;
      trackTabSwitchCount: boolean;
      status: 'active' | 'closed';
    };
    settings: {
      schoolName: string;
      logoUrl: string;
    };
  }> {
    const res = await fetch(`/api/quiz/${code}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Không tìm thấy bài kiểm tra');
    }
    return res.json();
  },

  async startQuiz(
    code: string,
    studentName: string,
    studentClass: string
  ): Promise<{
    attemptId: string;
    questionList: ClientQuizQuestion[];
    durationMinutes: number;
    startedAt: string;
  }> {
    const res = await fetch(`/api/quiz/${code}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentName, studentClass }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Không thể bắt đầu làm bài');
    }
    return res.json();
  },

  // CRITICAL: Real-time answer evaluation on server (autosave)
  async submitAnswer(params: {
    attemptId: string;
    questionId: string;
    selectedAnswer?: string;
    statementAnswers?: { [key: string]: boolean };
  }): Promise<{ success: boolean; message: string; savedAt: string }> {
    const res = await fetch('/api/quiz/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Lỗi khi lưu đáp án');
    }
    return res.json();
  },

  async trackTabSwitch(attemptId: string): Promise<{ success: boolean; count: number }> {
    const res = await fetch('/api/quiz/track-tab', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attemptId }),
    });
    return res.json();
  },

  async submitQuiz(attemptId: string): Promise<{
    success: boolean;
    result: {
      attemptId: string;
      quizId: string;
      quizTitle: string;
      studentName: string;
      studentClass: string;
      startedAt: string;
      submittedAt: string;
      timeSpentSeconds: number;
      score: number;
      numCorrect: number;
      numIncorrect: number;
      totalQuestions: number;
      canViewScore: boolean;
      canViewAnswers: boolean;
      reviewData?: any[];
      emailSent?: boolean;
    };
  }> {
    const res = await fetch('/api/quiz/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attemptId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Không thể nộp bài');
    }
    return res.json();
  },

  // Admin Attempts & Export
  async getAttempts(): Promise<QuizAttempt[]> {
    const res = await fetch('/api/attempts');
    if (!res.ok) throw new Error('Không thể tải danh sách kết quả');
    return res.json();
  },

  async getAttemptDetail(id: string): Promise<QuizAttempt & { detailedQuestions: any[] }> {
    const res = await fetch(`/api/attempts/${id}`);
    if (!res.ok) throw new Error('Không thể tải chi tiết bài làm');
    return res.json();
  },

  async deleteAttempt(id: string): Promise<boolean> {
    const res = await fetch(`/api/attempts/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Không thể xóa bài làm');
    const data = await res.json();
    return data.success;
  },

  async testEmailNotification(): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/test-email', { method: 'POST' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Lỗi khi gửi email kiểm tra');
    }
    return res.json();
  },
};
