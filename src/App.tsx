import React, { useState, useEffect } from 'react';
import { 
  School, 
  ShieldCheck, 
  UserCheck, 
  ArrowRight, 
  HelpCircle, 
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { 
  Question, 
  Quiz, 
  QuizAttempt, 
  AppSettings as IAppSettings, 
  ClientQuizQuestion 
} from './types/quiz';
import { api } from './services/api';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { StudentInformationForm } from './components/StudentInformationForm';
import { QuizPage } from './components/QuizPage';

export default function App() {
  // Navigation mode: 'admin' | 'student'
  const [currentMode, setCurrentMode] = useState<'admin' | 'student'>('admin');
  
  // Admin auth state (Authorized email: th01pct@gmail.com)
  const [adminEmail, setAdminEmail] = useState<string | null>('th01pct@gmail.com');
  
  // Data stores
  const [settings, setSettings] = useState<IAppSettings>({
    teacherName: 'HÀ THỊ MINH CHÂU',
    teacherEmail: 'th01pct@gmail.com',
    schoolName: 'Trường THPT Chuyên',
    logoUrl: '',
    emailNotificationsEnabled: true,
    instantFeedbackEnabled: false,
    passScore: 5.0,
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  // Student quiz state
  const [studentQuizCode, setStudentQuizCode] = useState<string>('KT001');
  const [studentQuizStage, setStudentQuizStage] = useState<'enter_code' | 'info' | 'taking'>('info');
  const [publicQuizData, setPublicQuizData] = useState<any | null>(null);
  const [studentAttemptId, setStudentAttemptId] = useState<string | null>(null);
  const [studentQuestionList, setStudentQuestionList] = useState<ClientQuizQuestion[]>([]);
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [startedAt, setStartedAt] = useState('');
  const [studentError, setStudentError] = useState<string | null>(null);
  const [studentLoading, setStudentLoading] = useState(false);

  // Initial data loading
  useEffect(() => {
    loadAllData();
  }, []);

  // Parse URL query params e.g. ?quiz=KT001
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const quizParam = urlParams.get('quiz');
    const viewParam = urlParams.get('view');

    if (quizParam) {
      setCurrentMode('student');
      setStudentQuizCode(quizParam);
      loadPublicQuiz(quizParam);
    } else if (viewParam === 'student') {
      setCurrentMode('student');
      loadPublicQuiz('KT001');
    }
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [loadedSettings, loadedQuestions, loadedQuizzes, loadedAttempts] = await Promise.all([
        api.getSettings(),
        api.getQuestions(),
        api.getQuizzes(),
        api.getAttempts(),
      ]);

      setSettings(loadedSettings);
      setQuestions(loadedQuestions);
      setQuizzes(loadedQuizzes);
      setAttempts(loadedAttempts);

      // Preload first quiz for student mode
      if (loadedQuizzes.length > 0) {
        setStudentQuizCode(loadedQuizzes[0].id);
        loadPublicQuiz(loadedQuizzes[0].id);
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu ban đầu:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPublicQuiz = async (code: string) => {
    setStudentLoading(true);
    setStudentError(null);
    try {
      const data = await api.getPublicQuiz(code);
      setPublicQuizData(data);
      setStudentQuizStage('info');
    } catch (err: any) {
      setStudentError(err.message || 'Không tìm thấy bài kiểm tra');
      setStudentQuizStage('enter_code');
    } finally {
      setStudentLoading(false);
    }
  };

  // Student starts taking quiz
  const handleStudentStartQuiz = async (name: string, studentClassInput: string) => {
    setStudentLoading(true);
    setStudentError(null);
    try {
      const resp = await api.startQuiz(studentQuizCode, name, studentClassInput);
      setStudentName(name);
      setStudentClass(studentClassInput);
      setStudentAttemptId(resp.attemptId);
      setStudentQuestionList(resp.questionList);
      setStartedAt(resp.startedAt);
      setStudentQuizStage('taking');
    } catch (err: any) {
      setStudentError(err.message || 'Không thể bắt đầu làm bài');
    } finally {
      setStudentLoading(false);
    }
  };

  // Switch to student view for teacher testing
  const handlePreviewQuiz = (code: string) => {
    setStudentQuizCode(code);
    loadPublicQuiz(code);
    setCurrentMode('student');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
        <span className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-base font-bold">Hệ Thống Kiểm Tra Trắc Nghiệm Thông Minh</h2>
        <p className="text-xs text-slate-400 mt-1">Đang khởi tạo cơ sở dữ liệu và ngân hàng câu hỏi...</p>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: STUDENT MODE
  // -------------------------------------------------------------
  if (currentMode === 'student') {
    return (
      <div className="relative min-h-screen bg-slate-50">
        {/* Floating Teacher Switch Banner */}
        <div className="bg-slate-900 text-slate-300 px-4 py-2 text-xs flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-semibold text-white">Chế độ Học Sinh làm bài</span>
            <span className="hidden sm:inline text-slate-400">&bull; Mã đề: {studentQuizCode}</span>
          </div>
          <button
            onClick={() => {
              setCurrentMode('admin');
              setStudentQuizStage('info');
              loadAllData();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Quay Lại Trang Quản Trị Giáo Viên</span>
          </button>
        </div>

        {/* Enter Quiz Code if not found or entered manually */}
        {studentQuizStage === 'enter_code' && (
          <div className="min-h-[85vh] flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 max-w-md w-full text-center space-y-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
                <School className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">Nhập Mã Bài Kiểm Tra</h2>
              <p className="text-xs text-slate-500">
                Nhập mã đề thi giáo viên đã cấp cho bạn (Ví dụ: <code className="font-bold text-indigo-600">KT001</code>)
              </p>

              {studentError && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold">
                  {studentError}
                </div>
              )}

              <div className="space-y-3">
                <input
                  type="text"
                  value={studentQuizCode}
                  onChange={(e) => setStudentQuizCode(e.target.value.toUpperCase())}
                  placeholder="Mã đề (KT001)..."
                  className="w-full text-center px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-sm tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <button
                  onClick={() => loadPublicQuiz(studentQuizCode)}
                  disabled={!studentQuizCode.trim()}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                >
                  Tìm Bài Kiểm Tra
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Student Enter Information */}
        {studentQuizStage === 'info' && publicQuizData && (
          <StudentInformationForm
            quiz={publicQuizData.quiz}
            settings={publicQuizData.settings}
            onStartQuiz={handleStudentStartQuiz}
            loading={studentLoading}
            error={studentError}
          />
        )}

        {/* Student Taking Quiz */}
        {studentQuizStage === 'taking' && studentAttemptId && publicQuizData && (
          <QuizPage
            quiz={publicQuizData.quiz}
            attemptId={studentAttemptId}
            questionList={studentQuestionList}
            studentName={studentName}
            studentClass={studentClass}
            startedAt={startedAt}
            logoUrl={publicQuizData.settings.logoUrl}
            schoolName={publicQuizData.settings.schoolName}
            onReturnHome={() => {
              setCurrentMode('admin');
              setStudentQuizStage('info');
              loadAllData();
            }}
          />
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: ADMIN MODE (LOGIN OR DASHBOARD)
  // -------------------------------------------------------------
  if (!adminEmail) {
    return (
      <AdminLogin
        teacherEmail={settings.teacherEmail}
        teacherName={settings.teacherName}
        onLoginSuccess={(email) => setAdminEmail(email)}
      />
    );
  }

  return (
    <AdminDashboard
      adminEmail={adminEmail}
      settings={settings}
      questions={questions}
      quizzes={quizzes}
      attempts={attempts}
      onUpdateSettings={async (s) => {
        const updated = await api.updateSettings(s);
        setSettings(updated);
      }}
      onAddQuestion={async (q) => {
        await api.createQuestion(q);
        const qs = await api.getQuestions();
        setQuestions(qs);
      }}
      onUpdateQuestion={async (id, q) => {
        await api.updateQuestion(id, q);
        const qs = await api.getQuestions();
        setQuestions(qs);
      }}
      onDeleteQuestion={async (id) => {
        await api.deleteQuestion(id);
        const qs = await api.getQuestions();
        setQuestions(qs);
      }}
      onClearQuestions={async () => {
        await api.clearAllQuestions();
        setQuestions([]);
      }}
      onImportQuestions={async (qs) => {
        await api.importQuestions(qs);
        const updated = await api.getQuestions();
        setQuestions(updated);
      }}
      onCreateQuiz={async (quizData) => {
        const created = await api.createQuiz(quizData);
        const all = await api.getQuizzes();
        setQuizzes(all);
        return created;
      }}
      onToggleQuizStatus={async (id, status) => {
        await api.updateQuiz(id, { status });
        const all = await api.getQuizzes();
        setQuizzes(all);
      }}
      onDeleteQuiz={async (id) => {
        await api.deleteQuiz(id);
        const all = await api.getQuizzes();
        setQuizzes(all);
      }}
      onDeleteAttempt={async (id) => {
        await api.deleteAttempt(id);
        const all = await api.getAttempts();
        setAttempts(all);
      }}
      onRefreshAttempts={async () => {
        const all = await api.getAttempts();
        setAttempts(all);
      }}
      onPreviewQuizAsStudent={handlePreviewQuiz}
      onSwitchToStudentView={() => {
        setCurrentMode('student');
        if (quizzes.length > 0) {
          loadPublicQuiz(quizzes[0].id);
        }
      }}
      onLogout={() => setAdminEmail(null)}
    />
  );
}
