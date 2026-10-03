import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Award, 
  Clock, 
  Calendar, 
  User, 
  School, 
  XCircle, 
  Layers, 
  Eye, 
  Mail,
  Home
} from 'lucide-react';

interface StudentResultProps {
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
  logoUrl?: string;
  teacherName?: string;
  schoolName?: string;
  onReturnHome?: () => void;
}

export const StudentResult: React.FC<StudentResultProps> = ({
  result,
  logoUrl,
  teacherName = 'HÀ THỊ MINH CHÂU',
  schoolName = 'Trường THPT Chuyên',
  onReturnHome,
}) => {
  useEffect(() => {
    // Launch celebratory confetti if score is >= 5.0
    if (result.score >= 5.0) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [result.score]);

  const minutes = Math.floor(result.timeSpentSeconds / 60);
  const seconds = result.timeSpentSeconds % 60;
  const formattedDuration = `${minutes} phút ${seconds} giây`;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Main Completion Card */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-6 relative overflow-hidden">
          {/* Top subtle decoration */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />

          {/* Logo or School Icon */}
          <div className="flex justify-center">
            {logoUrl ? (
              <div className="w-20 h-20 rounded-2xl bg-white p-2 shadow-md border border-slate-100 flex items-center justify-center">
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <School className="w-8 h-8" />
              </div>
            )}
          </div>

          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              {schoolName} &bull; Giáo viên: {teacherName}
            </span>
            <h1 className="text-2xl font-black text-slate-800 mt-1 uppercase tracking-tight">
              HOÀN THÀNH BÀI KIỂM TRA
            </h1>
            <p className="text-sm font-semibold text-indigo-600 mt-1">
              {result.quizTitle}
            </p>
          </div>

          {/* Student Info Box (Section 23) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex flex-wrap items-center justify-around gap-4 text-slate-700 font-semibold">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              <span>Họ tên: <strong className="text-slate-900 text-sm">{result.studentName}</strong></span>
            </div>
            <span>&bull;</span>
            <div className="flex items-center gap-2">
              <School className="w-4 h-4 text-slate-400" />
              <span>Lớp: <strong className="text-slate-900 text-sm">{result.studentClass}</strong></span>
            </div>
            <span>&bull;</span>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Thời gian: <strong className="text-slate-900 text-sm">{formattedDuration}</strong></span>
            </div>
          </div>

          {/* Score & Correct Metrics */}
          {result.canViewScore ? (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 via-slate-50 to-indigo-100/50 border border-indigo-100 space-y-3">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Điểm Số Của Bạn
              </div>
              <div className="text-5xl font-black text-indigo-600 tracking-tight">
                {result.score?.toFixed(2)}
                <span className="text-xl font-normal text-slate-400"> / 10.0</span>
              </div>
              <div className="flex items-center justify-center gap-4 text-xs font-bold pt-2">
                <span className="inline-flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                  Số câu đúng: {result.numCorrect} / {result.totalQuestions}
                </span>
                <span className="text-slate-300">|</span>
                <span className="inline-flex items-center gap-1 text-red-500">
                  <XCircle className="w-4 h-4" />
                  Số câu sai: {result.numIncorrect} / {result.totalQuestions}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
              Giáo viên đã cài đặt ẩn điểm số cho bài thi này. Kết quả sẽ được công bố sau.
            </div>
          )}

          {/* Acknowledgement Statement (Section 23) */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-emerald-700 font-bold text-sm bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
              <span>Bài làm của bạn đã được ghi nhận thành công!</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Bài thi đã được khóa và tự động lưu an toàn vào hệ thống.
            </p>
          </div>

          {/* Return Home Button */}
          {onReturnHome && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onReturnHome}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Trang Chủ</span>
              </button>
            </div>
          )}
        </div>

        {/* Detailed Question Review (if enabled by teacher) */}
        {result.canViewAnswers && result.reviewData && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Eye className="w-5 h-5 text-indigo-600" />
              <span>Đáp Án Chi Tiết</span>
            </h3>

            <div className="space-y-4">
              {result.reviewData.map((item, idx) => {
                const isRight = item.isCorrect;
                return (
                  <div
                    key={item.questionId}
                    className={`p-4 rounded-2xl border text-xs ${
                      isRight ? 'border-emerald-200 bg-emerald-50/20' : 'border-red-200 bg-red-50/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-800">Câu {idx + 1}</span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                          isRight ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {isRight ? 'Đúng' : 'Sai'}
                      </span>
                    </div>

                    <p className="text-slate-800 font-medium mb-2">{item.content}</p>

                    {item.type === 'multiple_choice' ? (
                      <div className="flex flex-wrap items-center gap-4 text-[11px]">
                        <span>
                          Bạn chọn: <strong className={isRight ? 'text-emerald-700' : 'text-red-600'}>{item.studentAnswer || 'Chưa chọn'}</strong>
                        </span>
                        <span>
                          Đáp án đúng: <strong className="text-emerald-700">{item.correctAnswer}</strong>
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-1 text-[11px]">
                        {['a', 'b', 'c', 'd'].map((k) => (
                          <div key={k} className="flex justify-between text-slate-600">
                            <span>Mệnh đề {k}: {item.statements?.[k]}</span>
                            <span>
                              Đáp án: <strong>{item.correctStatementAnswers?.[k] ? 'ĐÚNG' : 'SAI'}</strong>
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
