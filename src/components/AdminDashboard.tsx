import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  UploadCloud, 
  PlusCircle, 
  FileCheck2, 
  GraduationCap, 
  Sliders, 
  LogOut, 
  ExternalLink, 
  School, 
  User, 
  Mail, 
  TrendingUp, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';
import { 
  Question, 
  Quiz, 
  QuizAttempt, 
  AppSettings as IAppSettings, 
  ParsedQuestionResult 
} from '../types/quiz';
import { QuestionBank } from './QuestionBank';
import { QuestionUploader } from './QuestionUploader';
import { QuestionImportPreview } from './QuestionImportPreview';
import { CreateQuiz } from './CreateQuiz';
import { QuizList } from './QuizList';
import { QuizResults } from './QuizResults';
import { AppSettings } from './AppSettings';

interface AdminDashboardProps {
  adminEmail: string;
  settings: IAppSettings;
  questions: Question[];
  quizzes: Quiz[];
  attempts: QuizAttempt[];
  onUpdateSettings: (s: Partial<IAppSettings>) => Promise<void>;
  onAddQuestion: (q: Partial<Question>) => Promise<void>;
  onUpdateQuestion: (id: string, q: Partial<Question>) => Promise<void>;
  onDeleteQuestion: (id: string) => Promise<void>;
  onClearQuestions: () => Promise<void>;
  onImportQuestions: (qs: Question[]) => Promise<void>;
  onCreateQuiz: (quiz: Partial<Quiz>) => Promise<Quiz>;
  onToggleQuizStatus: (id: string, status: 'active' | 'closed') => Promise<void>;
  onDeleteQuiz: (id: string) => Promise<void>;
  onDeleteAttempt: (id: string) => Promise<void>;
  onRefreshAttempts: () => void;
  onPreviewQuizAsStudent: (code: string) => void;
  onSwitchToStudentView: () => void;
  onLogout: () => void;
}

type TabType = 
  | 'overview' 
  | 'bank' 
  | 'upload' 
  | 'create_quiz' 
  | 'quizzes' 
  | 'results' 
  | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminEmail,
  settings,
  questions,
  quizzes,
  attempts,
  onUpdateSettings,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onClearQuestions,
  onImportQuestions,
  onCreateQuiz,
  onToggleQuizStatus,
  onDeleteQuiz,
  onDeleteAttempt,
  onRefreshAttempts,
  onPreviewQuizAsStudent,
  onSwitchToStudentView,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Staged import result
  const [stagedImportResult, setStagedImportResult] = useState<{
    result: ParsedQuestionResult;
    fileName: string;
  } | null>(null);

  // Overview metrics
  const totalQuestions = questions.length;
  const totalQuizzes = quizzes.length;
  const submittedAttempts = attempts.filter((a) => a.isSubmitted);
  const totalSubmissions = submittedAttempts.length;
  const avgScore = totalSubmissions > 0
    ? (submittedAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / totalSubmissions).toFixed(2)
    : '0.00';

  const menuItems: Array<{ id: TabType; label: string; icon: React.ReactNode; badge?: string | number }> = [
    { id: 'overview', label: 'Tổng quan', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'bank', label: 'Ngân hàng câu hỏi', icon: <Layers className="w-4 h-4" />, badge: totalQuestions },
    { id: 'upload', label: 'Upload câu hỏi', icon: <UploadCloud className="w-4 h-4" /> },
    { id: 'create_quiz', label: 'Tạo bài kiểm tra', icon: <PlusCircle className="w-4 h-4" /> },
    { id: 'quizzes', label: 'Bài kiểm tra', icon: <FileCheck2 className="w-4 h-4" />, badge: totalQuizzes },
    { id: 'results', label: 'Kết quả học sinh', icon: <GraduationCap className="w-4 h-4" />, badge: totalSubmissions },
    { id: 'settings', label: 'Logo & Cài đặt', icon: <Sliders className="w-4 h-4" /> },
  ];

  const handleParsedResult = (result: ParsedQuestionResult, fileName: string) => {
    setStagedImportResult({ result, fileName });
  };

  const handleConfirmSaveImport = async (parsedQuestions: Question[]) => {
    await onImportQuestions(parsedQuestions);
    setStagedImportResult(null);
    setActiveTab('bank');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt="Logo" className="w-7 h-7 object-contain rounded" />
          ) : (
            <School className="w-6 h-6 text-indigo-400" />
          )}
          <span className="font-bold text-xs truncate max-w-[200px]">{settings.teacherName}</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1 rounded-lg text-slate-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation (Section 7) */}
      <aside
        className={`w-full md:w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col justify-between fixed md:sticky top-0 h-screen z-30 transition-all ${
          mobileMenuOpen ? 'block' : 'hidden md:flex'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              {settings.logoUrl ? (
                <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center flex-shrink-0">
                  <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20">
                  <School className="w-5 h-5" />
                </div>
              )}
              <div className="overflow-hidden">
                <div className="font-bold text-white text-xs truncate">
                  {settings.teacherName}
                </div>
                <div className="text-[10px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3 text-indigo-400" />
                  <span className="truncate">{adminEmail}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id && !stagedImportResult;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setStagedImportResult(null);
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-white text-indigo-700'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            onClick={onSwitchToStudentView}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 font-semibold text-xs transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Mở Trang Học Sinh</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-950/20 text-xs transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
        {/* If user just parsed a file, render the review screen (Section 5) */}
        {stagedImportResult ? (
          <QuestionImportPreview
            result={stagedImportResult.result}
            fileName={stagedImportResult.fileName}
            onConfirmSave={handleConfirmSaveImport}
            onCancel={() => setStagedImportResult(null)}
          />
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Greeting Banner */}
                <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
                  <div className="max-w-xl relative z-10">
                    <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-white/10 inline-block mb-3">
                      Hệ Thống Khảo Thí Thông Minh
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                      Xin chào, Cô {settings.teacherName}!
                    </h1>
                    <p className="text-xs sm:text-sm text-indigo-100 mt-2 leading-relaxed">
                      Hệ thống tự động phân tích file DOCX/Excel, nhận diện đáp án từ chữ màu đỏ hoặc gạch chân, chấm điểm bảo mật server-side và tự động gửi email kết quả.
                    </p>

                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => setActiveTab('upload')}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs shadow-md transition-all cursor-pointer"
                      >
                        <UploadCloud className="w-4 h-4 text-indigo-600" />
                        <span>Tải Lên File Đề Thi</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('create_quiz')}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>Tạo Bài Kiểm Tra Mới</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div
                    onClick={() => setActiveTab('bank')}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-slate-500 mb-2">
                      <span className="text-xs font-semibold">Ngân hàng câu hỏi</span>
                      <Layers className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-3xl font-extrabold text-slate-800">{totalQuestions}</div>
                    <div className="text-[11px] text-slate-400 mt-1">Câu hỏi sẵn sàng ra đề</div>
                  </div>

                  <div
                    onClick={() => setActiveTab('quizzes')}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-slate-500 mb-2">
                      <span className="text-xs font-semibold">Bài kiểm tra</span>
                      <FileCheck2 className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-3xl font-extrabold text-indigo-600">{totalQuizzes}</div>
                    <div className="text-[11px] text-slate-400 mt-1">Đề thi đã thiết lập</div>
                  </div>

                  <div
                    onClick={() => setActiveTab('results')}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-slate-500 mb-2">
                      <span className="text-xs font-semibold">Lượt học sinh nộp</span>
                      <GraduationCap className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-3xl font-extrabold text-emerald-600">{totalSubmissions}</div>
                    <div className="text-[11px] text-slate-400 mt-1">Bài thi đã hoàn thành</div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between text-slate-500 mb-2">
                      <span className="text-xs font-semibold">Điểm trung bình</span>
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="text-3xl font-extrabold text-purple-600">{avgScore}</div>
                    <div className="text-[11px] text-slate-400 mt-1">Thang điểm 10.0</div>
                  </div>
                </div>

                {/* Recent Quizzes & Recent Results Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left: Active Quizzes */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <FileCheck2 className="w-4 h-4 text-indigo-600" />
                        <span>Bài Kiểm Tra Gần Đây</span>
                      </h3>
                      <button
                        onClick={() => setActiveTab('quizzes')}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        Xem tất cả &rarr;
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {quizzes.slice(0, 4).map((q) => (
                        <div
                          key={q.id}
                          className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                                {q.id}
                              </span>
                              <strong className="text-slate-800">{q.title}</strong>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1">
                              {q.durationMinutes} phút &bull; {q.numMultipleChoice + q.numTrueFalse} câu
                            </div>
                          </div>

                          <button
                            onClick={() => onPreviewQuizAsStudent(q.id)}
                            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-[11px] cursor-pointer"
                          >
                            Xem trước
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Recent Submissions */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-emerald-600" />
                        <span>Bài Nộp Mới Nhất</span>
                      </h3>
                      <button
                        onClick={() => setActiveTab('results')}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        Xem tất cả &rarr;
                      </button>
                    </div>

                    {submittedAttempts.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-xs">
                        Chưa có học sinh nào nộp bài. Hãy gửi link đề thi cho học sinh!
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {submittedAttempts.slice(0, 4).map((att) => (
                          <div
                            key={att.id}
                            className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                          >
                            <div>
                              <strong className="text-slate-800">{att.studentName}</strong>
                              <span className="text-slate-500 ml-2">Lớp {att.studentClass}</span>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                {att.quizTitle}
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="font-extrabold text-sm text-indigo-600">
                                {att.score?.toFixed(2)}
                              </span>
                              <span className="text-slate-400 text-[10px]"> / 10</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* QUESTION BANK TAB */}
            {activeTab === 'bank' && (
              <QuestionBank
                questions={questions}
                onAddQuestion={onAddQuestion}
                onUpdateQuestion={onUpdateQuestion}
                onDeleteQuestion={onDeleteQuestion}
                onClearAll={onClearQuestions}
                onNavigateToUpload={() => setActiveTab('upload')}
              />
            )}

            {/* UPLOAD TAB */}
            {activeTab === 'upload' && (
              <QuestionUploader onParsedResult={handleParsedResult} />
            )}

            {/* CREATE QUIZ TAB */}
            {activeTab === 'create_quiz' && (
              <CreateQuiz
                questions={questions}
                onCreateQuiz={onCreateQuiz}
                onCreatedSuccess={() => setActiveTab('quizzes')}
              />
            )}

            {/* QUIZZES TAB */}
            {activeTab === 'quizzes' && (
              <QuizList
                quizzes={quizzes}
                onToggleStatus={onToggleQuizStatus}
                onDeleteQuiz={onDeleteQuiz}
                onPreviewQuiz={onPreviewQuizAsStudent}
                onNavigateToCreate={() => setActiveTab('create_quiz')}
              />
            )}

            {/* RESULTS TAB */}
            {activeTab === 'results' && (
              <QuizResults
                attempts={attempts}
                quizzes={quizzes}
                onDeleteAttempt={onDeleteAttempt}
                onRefresh={onRefreshAttempts}
              />
            )}

            {/* SETTINGS & LOGO TAB */}
            {activeTab === 'settings' && (
              <AppSettings
                settings={settings}
                onUpdateSettings={onUpdateSettings}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};
