import React, { useState } from 'react';
import { User, School, Clock, FileText, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface StudentInformationFormProps {
  quiz: {
    id: string;
    title: string;
    teacherName: string;
    durationMinutes: number;
    numMultipleChoice: number;
    numTrueFalse: number;
    warnTabSwitch: boolean;
  };
  settings: {
    schoolName: string;
    logoUrl: string;
  };
  onStartQuiz: (name: string, studentClass: string) => Promise<void>;
  loading: boolean;
  error?: string | null;
}

export const StudentInformationForm: React.FC<StudentInformationFormProps> = ({
  quiz,
  settings,
  onStartQuiz,
  loading,
  error,
}) => {
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!studentName.trim()) {
      setValidationError('Vui lòng nhập Họ và tên của bạn');
      return;
    }
    if (!studentClass.trim()) {
      setValidationError('Vui lòng nhập Lớp của bạn');
      return;
    }

    onStartQuiz(studentName.trim(), studentClass.trim());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8">
        {/* Logo and Header (Section 12) */}
        <div className="text-center mb-6">
          {settings.logoUrl ? (
            <div className="w-20 h-20 mx-auto mb-3 rounded-2xl bg-white p-2 shadow-md border border-slate-100 flex items-center justify-center">
              <img
                src={settings.logoUrl}
                alt="Logo"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-500/30 text-white">
              <School className="w-8 h-8" />
            </div>
          )}

          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {settings.schoolName || 'Hệ Thống Kiểm Tra Trực Tuyến'}
          </div>

          <h1 className="text-xl font-extrabold text-slate-800 mt-1 leading-snug">
            {quiz.title}
          </h1>

          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
            Giáo viên: {quiz.teacherName || 'HÀ THỊ MINH CHÂU'}
          </div>
        </div>

        {/* Quiz Specs */}
        <div className="grid grid-cols-2 gap-2 mb-6 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <span>Thời gian: <strong>{quiz.durationMinutes} phút</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-600 flex-shrink-0" />
            <span>Số câu: <strong>{quiz.numMultipleChoice + quiz.numTrueFalse} câu</strong></span>
          </div>
        </div>

        {(validationError || error) && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{validationError || error}</span>
          </div>
        )}

        {/* Student Form (Section 12) */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Họ và tên học sinh <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn An"
                autoFocus
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Lớp <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <School className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                placeholder="Ví dụ: 10A1, 11B2..."
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none text-slate-800"
              />
            </div>
          </div>

          {quiz.warnTabSwitch && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] leading-relaxed">
              <strong>Lưu ý:</strong> Bài thi có bật tính năng giám sát. Hệ thống sẽ ghi nhận nếu bạn chuyển tab hoặc rời màn hình làm bài.
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>BẮT ĐẦU LÀM BÀI</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
