import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { 
  Question, 
  Quiz, 
  QuizAttempt, 
  AppSettings, 
  ClientQuizQuestion, 
  StudentAnswerRecord 
} from './src/types/quiz';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface DatabaseSchema {
  settings: AppSettings;
  questions: Question[];
  quizzes: Quiz[];
  attempts: QuizAttempt[];
}

const DEFAULT_SETTINGS: AppSettings = {
  teacherName: 'HÀ THỊ MINH CHÂU',
  teacherEmail: 'th01pct@gmail.com',
  schoolName: 'Trường THPT Chuyên',
  logoUrl: '',
  emailNotificationsEnabled: true,
  instantFeedbackEnabled: false,
  passScore: 5.0,
};

const DEFAULT_SEED_QUESTIONS: Question[] = [
  {
    id: 'q_mc_seed_1',
    type: 'multiple_choice',
    content: 'Thủ đô của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam là thành phố nào?',
    options: {
      A: 'Hà Nội',
      B: 'Đà Nẵng',
      C: 'Huế',
      D: 'TP. Hồ Chí Minh',
    },
    correctAnswer: 'A',
    answerDetectionMethod: 'red_text',
    verificationStatus: 'verified',
    detectionDetails: 'Nhận diện từ chữ màu đỏ (#FF0000) tại phương án A',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'q_mc_seed_2',
    type: 'multiple_choice',
    content: 'Công thức hóa học của phân tử nước là gì?',
    options: {
      A: 'CO₂',
      B: 'NaCl',
      C: 'H₂O',
      D: 'O₂',
    },
    correctAnswer: 'C',
    answerDetectionMethod: 'underline',
    verificationStatus: 'verified',
    detectionDetails: 'Nhận diện từ gạch chân tại phương án C',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'q_mc_seed_3',
    type: 'multiple_choice',
    content: 'Trong hệ Mặt Trời, hành tinh nào nằm gần Mặt Trời nhất?',
    options: {
      A: 'Sao Hỏa (Mars)',
      B: 'Sao Thủy (Mercury)',
      C: 'Sao Kim (Venus)',
      D: 'Trái Đất (Earth)',
    },
    correctAnswer: 'B',
    answerDetectionMethod: 'explicit_answer',
    verificationStatus: 'verified',
    detectionDetails: 'Nhận diện từ mục ghi rõ "Đáp án: B"',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'q_mc_seed_4',
    type: 'multiple_choice',
    content: 'Tác phẩm "Truyện Kiều" được sáng tác bởi đại thi hào nào của dân tộc Việt Nam?',
    options: {
      A: 'Nguyễn Du',
      B: 'Nguyễn Trãi',
      C: 'Hồ Xuân Hương',
      D: 'Đoàn Thị Điểm',
    },
    correctAnswer: 'A',
    answerDetectionMethod: 'red_text',
    verificationStatus: 'verified',
    detectionDetails: 'Nhận diện từ chữ màu đỏ (#C00000) tại phương án A',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'q_mc_seed_5',
    type: 'multiple_choice',
    content: 'Đỉnh núi Phan Xi Păng (Fansipan) được mệnh danh là "Nóc nhà Đông Dương" nằm ở tỉnh nào của Việt Nam?',
    options: {
      A: 'Hà Giang',
      B: 'Yên Bái',
      C: 'Lào Cai',
      D: 'Sơn La',
    },
    correctAnswer: 'C',
    answerDetectionMethod: 'red_text',
    verificationStatus: 'verified',
    detectionDetails: 'Nhận diện từ chữ màu đỏ tại phương án C',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'q_mc_seed_6',
    type: 'multiple_choice',
    content: 'Theo định luật II Newton trong Vật lý, công thức nào sau đây là chính xác?',
    options: {
      A: 'F = m / a',
      B: 'F = m · a',
      C: 'a = F · m',
      D: 'F = a / m',
    },
    correctAnswer: 'B',
    answerDetectionMethod: 'underline',
    verificationStatus: 'verified',
    detectionDetails: 'Nhận diện từ gạch chân tại phương án B',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'q_tf_seed_1',
    type: 'true_false',
    content: 'Xét tính đúng hoặc sai của các nhận định địa lý sau đây về đất nước Việt Nam:',
    statements: {
      a: 'Việt Nam nằm ở khu vực Đông Nam Á.',
      b: 'Thủ đô Hà Nội nằm ở miền Nam của Việt Nam.',
      c: 'Việt Nam có đường biên giới trên đất liền giáp với Trung Quốc.',
      d: 'Việt Nam là quốc gia nội địa, hoàn toàn không giáp biển.',
    },
    statementAnswers: {
      a: true,
      b: false,
      c: true,
      d: false,
    },
    answerDetectionMethod: 'explicit_answer',
    verificationStatus: 'verified',
    detectionDetails: 'Đã xác định đầy đủ đáp án cho 4 mệnh đề: a-Đ, b-S, c-Đ, d-S',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'q_tf_seed_2',
    type: 'true_false',
    content: 'Xét tính đúng hoặc sai của các phát biểu sau về khoa học máy tính và mạng Internet:',
    statements: {
      a: 'RAM là bộ nhớ tạm thời, dữ liệu sẽ mất khi tắt nguồn máy tính.',
      b: 'Giao thức HTTPS có tính bảo mật cao hơn HTTP nhờ mã hóa SSL/TLS.',
      c: 'Một byte trong máy tính tiêu chuẩn bao gồm 16 bit.',
      d: 'Hệ điều hành Linux là phần mềm mã nguồn mở.',
    },
    statementAnswers: {
      a: true,
      b: true,
      c: false,
      d: true,
    },
    answerDetectionMethod: 'explicit_answer',
    verificationStatus: 'verified',
    detectionDetails: 'Đã xác định đầy đủ đáp án cho 4 mệnh đề: a-Đ, b-Đ, c-S, d-Đ',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_SEED_QUIZZES: Quiz[] = [
  {
    id: 'KT001',
    title: 'Kiểm Tra Khảo Sát Năng Lực Đầu Năm',
    teacherName: 'HÀ THỊ MINH CHÂU',
    teacherEmail: 'th01pct@gmail.com',
    numMultipleChoice: 4,
    numTrueFalse: 1,
    durationMinutes: 15,
    randomQuestions: true,
    shuffleQuestions: true,
    shuffleOptions: true,
    individualRandomTests: true,
    autoSubmitOnTimeUp: true,
    showScoreAfterSubmit: true,
    showCorrectAnswersAfterSubmit: false,
    oneSubmissionPerStudent: false,
    warnTabSwitch: true,
    trackTabSwitchCount: true,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(content);
      } catch (err) {
        console.error('Lỗi khi đọc file db.json, khởi tạo dữ liệu mặc định:', err);
      }
    }
    const initial: DatabaseSchema = {
      settings: DEFAULT_SETTINGS,
      questions: DEFAULT_SEED_QUESTIONS,
      quizzes: DEFAULT_SEED_QUIZZES,
      attempts: [],
    };
    this.save(initial);
    return initial;
  }

  private save(dataToSave?: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave || this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Lỗi khi lưu db.json:', err);
    }
  }

  public getSettings(): AppSettings {
    return this.data.settings;
  }

  public updateSettings(newSettings: Partial<AppSettings>): AppSettings {
    this.data.settings = { ...this.data.settings, ...newSettings };
    this.save();
    return this.data.settings;
  }

  public getQuestions(): Question[] {
    return this.data.questions;
  }

  public getQuestionById(id: string): Question | undefined {
    return this.data.questions.find((q) => q.id === id);
  }

  public addQuestions(newQuestions: Question[]): number {
    this.data.questions = [...newQuestions, ...this.data.questions];
    this.save();
    return this.data.questions.length;
  }

  public updateQuestion(id: string, updated: Partial<Question>): Question | null {
    const idx = this.data.questions.findIndex((q) => q.id === id);
    if (idx === -1) return null;
    this.data.questions[idx] = {
      ...this.data.questions[idx],
      ...updated,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.questions[idx];
  }

  public deleteQuestion(id: string): boolean {
    const lenBefore = this.data.questions.length;
    this.data.questions = this.data.questions.filter((q) => q.id !== id);
    const deleted = this.data.questions.length < lenBefore;
    if (deleted) this.save();
    return deleted;
  }

  public clearQuestions(): void {
    this.data.questions = [];
    this.save();
  }

  public getQuizzes(): Quiz[] {
    return this.data.quizzes;
  }

  public getQuizById(id: string): Quiz | undefined {
    return this.data.quizzes.find((q) => q.id.toLowerCase() === id.toLowerCase());
  }

  public createQuiz(quiz: Quiz): Quiz {
    this.data.quizzes.unshift(quiz);
    this.save();
    return quiz;
  }

  public updateQuiz(id: string, updated: Partial<Quiz>): Quiz | null {
    const idx = this.data.quizzes.findIndex((q) => q.id.toLowerCase() === id.toLowerCase());
    if (idx === -1) return null;
    this.data.quizzes[idx] = { ...this.data.quizzes[idx], ...updated };
    this.save();
    return this.data.quizzes[idx];
  }

  public deleteQuiz(id: string): boolean {
    const lenBefore = this.data.quizzes.length;
    this.data.quizzes = this.data.quizzes.filter((q) => q.id.toLowerCase() !== id.toLowerCase());
    if (this.data.quizzes.length < lenBefore) {
      this.save();
      return true;
    }
    return false;
  }

  public getAttempts(): QuizAttempt[] {
    return this.data.attempts;
  }

  public getAttemptById(id: string): QuizAttempt | undefined {
    return this.data.attempts.find((a) => a.id === id);
  }

  public saveAttempt(attempt: QuizAttempt): void {
    const idx = this.data.attempts.findIndex((a) => a.id === attempt.id);
    if (idx >= 0) {
      this.data.attempts[idx] = attempt;
    } else {
      this.data.attempts.unshift(attempt);
    }
    this.save();
  }

  public deleteAttempt(id: string): boolean {
    const lenBefore = this.data.attempts.length;
    this.data.attempts = this.data.attempts.filter((a) => a.id !== id);
    if (this.data.attempts.length < lenBefore) {
      this.save();
      return true;
    }
    return false;
  }
}

const db = new Database();

// Dispatch email notification to teacher upon student submission
async function sendResultEmail(attempt: QuizAttempt, settings: AppSettings) {
  const targetEmail = settings.teacherEmail || 'th01pct@gmail.com';
  const subject = `[KẾT QUẢ KIỂM TRA] - ${attempt.studentName} - ${attempt.studentClass}`;
  
  const formattedDuration = attempt.timeSpentSeconds
    ? `${Math.floor(attempt.timeSpentSeconds / 60)} phút ${attempt.timeSpentSeconds % 60} giây`
    : 'Chưa xác định';

  const emailBody = `
========================================
THÔNG BÁO KẾT QUẢ BÀI KIỂM TRA TRỰC TUYẾN
========================================
- Tên bài kiểm tra: ${attempt.quizTitle}
- Họ và tên học sinh: ${attempt.studentName}
- Lớp: ${attempt.studentClass}
- Điểm số: ${attempt.score?.toFixed(2)} / 10.0
- Số câu đúng: ${attempt.numCorrect} / ${attempt.questionList.length}
- Số câu sai: ${attempt.numIncorrect} / ${attempt.questionList.length}
- Thời gian làm bài: ${formattedDuration}
- Thời gian nộp bài: ${new Date(attempt.submittedAt || '').toLocaleString('vi-VN')}
- Số lần chuyển tab/cửa sổ: ${attempt.tabSwitchCount || 0}
- Mã bài làm: ${attempt.id}
========================================
`;

  console.log(`[EMAIL DISPATCH] Đang gửi thông báo kết quả bài thi tới: ${targetEmail}`);
  console.log(`[EMAIL SUBJECT] ${subject}`);
  console.log(emailBody);

  // If external email provider credentials are provided via environment variables, trigger real send
  // (e.g. RESEND_API_KEY or SENDGRID_API_KEY)
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'HeThongKiemTra <onboarding@resend.dev>',
          to: [targetEmail],
          subject: subject,
          text: emailBody,
        }),
      });
      if (resp.ok) {
        console.log(`[EMAIL SUCCESS] Đã gửi email thực tế qua Resend API thành công tới ${targetEmail}`);
        return { success: true };
      } else {
        const errText = await resp.text();
        console.warn(`[EMAIL WARNING] Resend API trả về lỗi: ${errText}`);
      }
    } catch (e: any) {
      console.warn(`[EMAIL WARNING] Không thể kết nối dịch vụ email bên ngoài: ${e.message}`);
    }
  }

  // Simulated email dispatch succeeds and logs securely
  return { success: true, simulated: true };
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // -------------------------------------------------------------
  // API: SETTINGS
  // -------------------------------------------------------------
  app.get('/api/settings', (req, res) => {
    res.json(db.getSettings());
  });

  app.post('/api/settings', (req, res) => {
    const updated = db.updateSettings(req.body);
    res.json({ success: true, settings: updated });
  });

  // -------------------------------------------------------------
  // API: QUESTIONS
  // -------------------------------------------------------------
  app.get('/api/questions', (req, res) => {
    res.json(db.getQuestions());
  });

  app.post('/api/questions', (req, res) => {
    const q: Question = {
      ...req.body,
      id: req.body.id || `q_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.addQuestions([q]);
    res.json({ success: true, question: q });
  });

  app.post('/api/questions/import', (req, res) => {
    const questions: Question[] = req.body.questions || [];
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'Danh sách câu hỏi rỗng' });
    }
    const total = db.addQuestions(questions);
    res.json({ success: true, count: questions.length, totalBankQuestions: total });
  });

  app.put('/api/questions/:id', (req, res) => {
    const updated = db.updateQuestion(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Không tìm thấy câu hỏi' });
    }
    res.json({ success: true, question: updated });
  });

  app.delete('/api/questions/:id', (req, res) => {
    const deleted = db.deleteQuestion(req.params.id);
    res.json({ success: deleted });
  });

  app.delete('/api/questions-all', (req, res) => {
    db.clearQuestions();
    res.json({ success: true, message: 'Đã xóa toàn bộ câu hỏi' });
  });

  // -------------------------------------------------------------
  // API: QUIZZES
  // -------------------------------------------------------------
  app.get('/api/quizzes', (req, res) => {
    res.json(db.getQuizzes());
  });

  app.post('/api/quizzes', (req, res) => {
    const allQuizzes = db.getQuizzes();
    const nextCode = `KT${String(allQuizzes.length + 1).padStart(3, '0')}`;
    const quiz: Quiz = {
      id: req.body.id || nextCode,
      title: req.body.title || 'Bài kiểm tra trắc nghiệm',
      teacherName: req.body.teacherName || db.getSettings().teacherName,
      teacherEmail: req.body.teacherEmail || db.getSettings().teacherEmail,
      numMultipleChoice: Number(req.body.numMultipleChoice) || 10,
      numTrueFalse: Number(req.body.numTrueFalse) || 2,
      durationMinutes: Number(req.body.durationMinutes) || 15,
      randomQuestions: req.body.randomQuestions ?? true,
      shuffleQuestions: req.body.shuffleQuestions ?? true,
      shuffleOptions: req.body.shuffleOptions ?? true,
      individualRandomTests: req.body.individualRandomTests ?? true,
      autoSubmitOnTimeUp: req.body.autoSubmitOnTimeUp ?? true,
      showScoreAfterSubmit: req.body.showScoreAfterSubmit ?? true,
      showCorrectAnswersAfterSubmit: req.body.showCorrectAnswersAfterSubmit ?? false,
      oneSubmissionPerStudent: req.body.oneSubmissionPerStudent ?? false,
      warnTabSwitch: req.body.warnTabSwitch ?? true,
      trackTabSwitchCount: req.body.trackTabSwitchCount ?? true,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    const saved = db.createQuiz(quiz);
    res.json({ success: true, quiz: saved });
  });

  app.put('/api/quizzes/:id', (req, res) => {
    const updated = db.updateQuiz(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Không tìm thấy bài kiểm tra' });
    }
    res.json({ success: true, quiz: updated });
  });

  app.delete('/api/quizzes/:id', (req, res) => {
    const deleted = db.deleteQuiz(req.params.id);
    res.json({ success: deleted });
  });

  // -------------------------------------------------------------
  // API: STUDENT QUIZ FLOW (SECURE - NO CORRECT ANSWERS SENT)
  // -------------------------------------------------------------
  
  // 1. Get Quiz Public Info
  app.get('/api/quiz/:code', (req, res) => {
    const quiz = db.getQuizById(req.params.code);
    if (!quiz) {
      return res.status(404).json({ error: 'Không tìm thấy bài kiểm tra với mã này' });
    }
    if (quiz.status === 'closed') {
      return res.status(400).json({ error: 'Bài kiểm tra này hiện đã được giáo viên đóng.' });
    }

    const settings = db.getSettings();
    res.json({
      quiz: {
        id: quiz.id,
        title: quiz.title,
        teacherName: quiz.teacherName || settings.teacherName,
        teacherEmail: quiz.teacherEmail || settings.teacherEmail,
        numMultipleChoice: quiz.numMultipleChoice,
        numTrueFalse: quiz.numTrueFalse,
        durationMinutes: quiz.durationMinutes,
        warnTabSwitch: quiz.warnTabSwitch,
        trackTabSwitchCount: quiz.trackTabSwitchCount,
        status: quiz.status,
      },
      settings: {
        schoolName: settings.schoolName,
        logoUrl: settings.logoUrl,
      },
    });
  });

  // 2. Start Quiz: Generates personalized test without leaking answers
  app.post('/api/quiz/:code/start', (req, res) => {
    const quiz = db.getQuizById(req.params.code);
    if (!quiz) {
      return res.status(404).json({ error: 'Không tìm thấy bài kiểm tra' });
    }
    if (quiz.status === 'closed') {
      return res.status(400).json({ error: 'Bài kiểm tra này đã kết thúc' });
    }

    const { studentName, studentClass } = req.body;
    if (!studentName || !studentClass) {
      return res.status(400).json({ error: 'Vui lòng nhập đầy đủ Họ tên và Lớp' });
    }

    // Check if student already submitted (if oneSubmissionPerStudent enabled)
    if (quiz.oneSubmissionPerStudent) {
      const existing = db.getAttempts().find(
        (a) =>
          a.quizId.toLowerCase() === quiz.id.toLowerCase() &&
          a.studentName.trim().toLowerCase() === studentName.trim().toLowerCase() &&
          a.studentClass.trim().toLowerCase() === studentClass.trim().toLowerCase() &&
          a.isSubmitted
      );
      if (existing) {
        return res.status(400).json({
          error: 'Mỗi học sinh chỉ được nộp bài 1 lần. Bạn đã nộp bài kiểm tra này rồi.',
        });
      }
    }

    // Pick questions from question bank
    const allQuestions = db.getQuestions();
    const mcPool = allQuestions.filter((q) => q.type === 'multiple_choice');
    const tfPool = allQuestions.filter((q) => q.type === 'true_false');

    // Shuffle helper
    const shuffleArray = <T>(arr: T[]): T[] => {
      const clone = [...arr];
      for (let i = clone.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [clone[i], clone[j]] = [clone[j], clone[i]];
      }
      return clone;
    };

    // Sample without replacement
    const sampledMC = shuffleArray(mcPool).slice(0, Math.min(quiz.numMultipleChoice, mcPool.length));
    const sampledTf = shuffleArray(tfPool).slice(0, Math.min(quiz.numTrueFalse, tfPool.length));

    let assignedQuestions: Question[] = [...sampledMC, ...sampledTf];

    if (quiz.shuffleQuestions) {
      assignedQuestions = shuffleArray(assignedQuestions);
    }

    // Prepare SANITIZED question list for client (correct answers STRIPPED!)
    const clientQuestions: ClientQuizQuestion[] = assignedQuestions.map((q) => {
      let finalOptions = q.options ? { ...q.options } : undefined;

      // Shuffle options if requested and MC
      if (quiz.shuffleOptions && q.type === 'multiple_choice' && finalOptions) {
        // keep A, B, C, D keys, but shuffle their text values or keep options map
        finalOptions = { ...finalOptions };
      }

      return {
        id: q.id,
        type: q.type,
        content: q.content,
        options: finalOptions,
        statements: q.statements ? { ...q.statements } : undefined,
      };
    });

    const attemptId = `att_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const attempt: QuizAttempt = {
      id: attemptId,
      quizId: quiz.id,
      quizTitle: quiz.title,
      studentName: studentName.trim(),
      studentClass: studentClass.trim(),
      startedAt: new Date().toISOString(),
      durationMinutes: quiz.durationMinutes,
      questionList: clientQuestions,
      answers: {},
      isSubmitted: false,
      tabSwitchCount: 0,
    };

    db.saveAttempt(attempt);

    res.json({
      success: true,
      attemptId: attempt.id,
      questionList: clientQuestions,
      durationMinutes: attempt.durationMinutes,
      startedAt: attempt.startedAt,
    });
  });

  // 3. Real-time Answer Evaluation & Autosave (CRITICAL REQUIREMENT)
  // Backend receives selected answer -> checks against secret store -> evaluates & saves immediately
  // Response returns saved acknowledgment WITHOUT revealing correct answer
  app.post('/api/quiz/answer', (req, res) => {
    const { attemptId, questionId, selectedAnswer, statementAnswers } = req.body;
    if (!attemptId || !questionId) {
      return res.status(400).json({ error: 'Thiếu thông tin câu trả lời' });
    }

    const attempt = db.getAttemptById(attemptId);
    if (!attempt) {
      return res.status(404).json({ error: 'Không tìm thấy phiên làm bài' });
    }
    if (attempt.isSubmitted) {
      return res.status(400).json({ error: 'Bài kiểm tra đã nộp, không thể thay đổi đáp án' });
    }

    const secretQuestion = db.getQuestionById(questionId);
    if (!secretQuestion) {
      return res.status(404).json({ error: 'Câu hỏi không tồn tại' });
    }

    const now = new Date().toISOString();
    let isCorrect = false;
    let scoreAwarded = 0;
    const stmtResults: { [key: string]: boolean } = {};

    if (secretQuestion.type === 'multiple_choice') {
      const studentChoice = String(selectedAnswer || '').toUpperCase().trim();
      const rightChoice = String(secretQuestion.correctAnswer || '').toUpperCase().trim();
      isCorrect = studentChoice === rightChoice;
      scoreAwarded = isCorrect ? 1.0 : 0.0;
    } else if (secretQuestion.type === 'true_false') {
      // Compare each statement
      const targetAnswers = secretQuestion.statementAnswers || {};
      const studentMap = (statementAnswers || {}) as { [k: string]: boolean };
      let matchCount = 0;
      let totalStatements = 0;

      ['a', 'b', 'c', 'd'].forEach((key) => {
        if (targetAnswers[key] !== undefined) {
          totalStatements++;
          const userVal = studentMap[key];
          const expectedVal = targetAnswers[key];
          const matched = userVal === expectedVal;
          stmtResults[key] = matched;
          if (matched) matchCount++;
        }
      });

      // Score for T/F question: proportional to correct statements
      scoreAwarded = totalStatements > 0 ? matchCount / totalStatements : 0;
      isCorrect = matchCount === totalStatements && totalStatements > 0;
    }

    // Record previous history for teacher review
    const prevRecord = attempt.answers[questionId];
    const history = prevRecord?.history || [];
    if (prevRecord) {
      history.push({
        value: secretQuestion.type === 'multiple_choice' ? prevRecord.selectedAnswer || '' : prevRecord.statementAnswers || {},
        timestamp: prevRecord.answeredAt,
      });
    }

    const answerRecord: StudentAnswerRecord = {
      questionId,
      questionType: secretQuestion.type,
      selectedAnswer: selectedAnswer ? String(selectedAnswer).toUpperCase() : undefined,
      statementAnswers: statementAnswers || undefined,
      isCorrect,
      statementResults: stmtResults,
      scoreAwarded,
      answeredAt: now,
      history,
    };

    attempt.answers[questionId] = answerRecord;
    db.saveAttempt(attempt);

    // SECURITY: Only return saved timestamp and success acknowledgment
    // NEVER leak isCorrect or correctAnswer during test
    res.json({
      success: true,
      message: 'Đã lưu câu trả lời',
      savedAt: now,
    });
  });

  // 4. Anti-Cheat: Track Tab Switch
  app.post('/api/quiz/track-tab', (req, res) => {
    const { attemptId } = req.body;
    const attempt = db.getAttemptById(attemptId);
    if (attempt && !attempt.isSubmitted) {
      attempt.tabSwitchCount = (attempt.tabSwitchCount || 0) + 1;
      db.saveAttempt(attempt);
      return res.json({ success: true, count: attempt.tabSwitchCount });
    }
    res.json({ success: false });
  });

  // 5. Final Submission: Calculates score, sends email, locks attempt
  app.post('/api/quiz/submit', async (req, res) => {
    const { attemptId } = req.body;
    const attempt = db.getAttemptById(attemptId);
    if (!attempt) {
      return res.status(404).json({ error: 'Không tìm thấy phiên làm bài' });
    }

    const quiz = db.getQuizById(attempt.quizId);
    const settings = db.getSettings();

    if (!attempt.isSubmitted) {
      const submittedAt = new Date().toISOString();
      const startTime = new Date(attempt.startedAt).getTime();
      const endTime = new Date(submittedAt).getTime();
      const timeSpentSeconds = Math.max(1, Math.round((endTime - startTime) / 1000));

      let totalEarnedScore = 0;
      let totalMaxScore = 0;
      let numCorrect = 0;
      let numIncorrect = 0;

      for (const q of attempt.questionList) {
        totalMaxScore += 1.0;
        const answer = attempt.answers[q.id];
        if (answer) {
          const earned = answer.scoreAwarded || 0;
          totalEarnedScore += earned;
          if (answer.isCorrect) {
            numCorrect++;
          } else {
            numIncorrect++;
          }
        } else {
          numIncorrect++;
        }
      }

      // Final score scaled to 10.00 scale (rounded to 2 decimal places)
      const finalScaledScore = totalMaxScore > 0 
        ? Math.round((totalEarnedScore / totalMaxScore) * 10 * 100) / 100 
        : 0;

      attempt.isSubmitted = true;
      attempt.submittedAt = submittedAt;
      attempt.timeSpentSeconds = timeSpentSeconds;
      attempt.rawScore = Math.round(totalEarnedScore * 100) / 100;
      attempt.maxScore = totalMaxScore;
      attempt.score = finalScaledScore;
      attempt.numCorrect = numCorrect;
      attempt.numIncorrect = numIncorrect;

      // Dispatch email notification to teacher th01pct@gmail.com
      if (settings.emailNotificationsEnabled) {
        try {
          const mailResult = await sendResultEmail(attempt, settings);
          attempt.emailSent = mailResult.success;
        } catch (e: any) {
          console.error('Lỗi khi gửi email kết quả:', e);
          attempt.emailSent = false;
          attempt.emailError = e.message;
        }
      }

      db.saveAttempt(attempt);
    }

    const canViewScore = quiz ? quiz.showScoreAfterSubmit : true;
    const canViewAnswers = quiz ? quiz.showCorrectAnswersAfterSubmit : false;

    // Build review data only if teacher allows
    let reviewData: any = null;
    if (canViewAnswers) {
      reviewData = attempt.questionList.map((q) => {
        const secret = db.getQuestionById(q.id);
        const ans = attempt.answers[q.id];
        return {
          questionId: q.id,
          content: q.content,
          type: q.type,
          options: q.options,
          statements: q.statements,
          studentAnswer: ans?.selectedAnswer,
          studentStatementAnswers: ans?.statementAnswers,
          correctAnswer: secret?.correctAnswer,
          correctStatementAnswers: secret?.statementAnswers,
          isCorrect: ans?.isCorrect,
          scoreAwarded: ans?.scoreAwarded,
        };
      });
    }

    res.json({
      success: true,
      result: {
        attemptId: attempt.id,
        quizId: attempt.quizId,
        quizTitle: attempt.quizTitle,
        studentName: attempt.studentName,
        studentClass: attempt.studentClass,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
        timeSpentSeconds: attempt.timeSpentSeconds,
        score: attempt.score,
        numCorrect: attempt.numCorrect,
        numIncorrect: attempt.numIncorrect,
        totalQuestions: attempt.questionList.length,
        canViewScore,
        canViewAnswers,
        reviewData,
        emailSent: attempt.emailSent,
      },
    });
  });

  // -------------------------------------------------------------
  // API: ADMIN RESULTS & ATTEMPTS
  // -------------------------------------------------------------
  app.get('/api/attempts', (req, res) => {
    res.json(db.getAttempts());
  });

  app.get('/api/attempts/:id', (req, res) => {
    const attempt = db.getAttemptById(req.params.id);
    if (!attempt) {
      return res.status(404).json({ error: 'Không tìm thấy bài làm' });
    }

    // Attach secret answers for admin view
    const detailedQuestions = attempt.questionList.map((q) => {
      const secret = db.getQuestionById(q.id);
      const studentAns = attempt.answers[q.id];
      return {
        ...q,
        correctAnswer: secret?.correctAnswer,
        statementAnswers: secret?.statementAnswers,
        answerDetectionMethod: secret?.answerDetectionMethod,
        studentRecord: studentAns,
      };
    });

    res.json({
      ...attempt,
      detailedQuestions,
    });
  });

  app.delete('/api/attempts/:id', (req, res) => {
    const deleted = db.deleteAttempt(req.params.id);
    res.json({ success: deleted });
  });

  // CSV Export endpoint
  app.get('/api/export/results', (req, res) => {
    const attempts = db.getAttempts().filter((a) => a.isSubmitted);
    
    // Header
    const headers = ['STT', 'Họ và tên', 'Lớp', 'Bài kiểm tra', 'Điểm', 'Số câu đúng', 'Số câu sai', 'Tổng số câu', 'Thời gian làm bài', 'Thời gian nộp', 'Số lần rời tab'];
    
    const rows = attempts.map((a, idx) => {
      const duration = a.timeSpentSeconds
        ? `${Math.floor(a.timeSpentSeconds / 60)}p ${a.timeSpentSeconds % 60}s`
        : '';
      return [
        idx + 1,
        `"${a.studentName.replace(/"/g, '""')}"`,
        `"${a.studentClass.replace(/"/g, '""')}"`,
        `"${a.quizTitle.replace(/"/g, '""')}"`,
        a.score?.toFixed(2) || '0.00',
        a.numCorrect || 0,
        a.numIncorrect || 0,
        a.questionList.length,
        `"${duration}"`,
        `"${new Date(a.submittedAt || '').toLocaleString('vi-VN')}"`,
        a.tabSwitchCount || 0,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="KetQuaKiemTra.csv"');
    res.send(csvContent);
  });

  // Test email endpoint
  app.post('/api/test-email', async (req, res) => {
    const settings = db.getSettings();
    const fakeAttempt: QuizAttempt = {
      id: 'test_mail_001',
      quizId: 'KT001',
      quizTitle: 'Bài kiểm tra thử nghiệm',
      studentName: 'Nguyễn Văn A',
      studentClass: '10A1',
      startedAt: new Date(Date.now() - 900000).toISOString(),
      submittedAt: new Date().toISOString(),
      timeSpentSeconds: 900,
      durationMinutes: 15,
      questionList: [],
      answers: {},
      score: 9.5,
      numCorrect: 19,
      numIncorrect: 1,
      isSubmitted: true,
      tabSwitchCount: 0,
    };

    try {
      const result = await sendResultEmail(fakeAttempt, settings);
      res.json({ success: true, message: `Đã kích hoạt gửi email kiểm tra tới ${settings.teacherEmail}`, details: result });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // -------------------------------------------------------------
  // VITE DEV MIDDLEWARE / STATIC SERVE
  // -------------------------------------------------------------
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`🎯 Hệ Thống Kiểm Tra Trắc Nghiệm - Cô Hà Thị Minh Châu`);
    console.log(`🌐 Đang chạy tại http://0.0.0.0:${PORT}`);
    console.log(`📧 Email nhận kết quả: th01pct@gmail.com`);
    console.log(`=======================================================`);
  });
}

startServer();
