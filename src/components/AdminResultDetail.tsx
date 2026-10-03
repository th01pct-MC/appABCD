import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  User, 
  GraduationCap, 
  Clock, 
  Award, 
  CheckCircle2, 
  XCircle, 
  History, 
  ShieldAlert, 
  Trash2,
  Calendar,
  Layers
} from 'lucide-react';
import { QuizAttempt } from '../types/quiz';
import { api } from '../services/api';

interface AdminResultDetailProps {
  attemptId: string;
  onBack: () => void;
  onDeleted: () => void;
}

export const AdminResultDetail: React.FC<AdminResultDetailProps> = ({
  attemptId,
  onBack,
  onDeleted,
}) => {
  const [attempt, setAttempt] = useState<(QuizAttempt & { detailedQuestions: any[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDetail();
  }, [attemptId]);

  const loadDetail = async () => {
    setLoading(true);
    try {
      const data = await api.getAttemptDetail(attemptId);
      setAttempt(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải chi tiết bài làm');
    } finally {
      setLoading(false);
    }
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
        <span className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin inline-block mb-3" />
        <p className="text-xs text-slate-500 font-medium">Đang tải bài thi của học sinh...</p>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-red-200 text-center shadow-sm">
        <p className="text-red-600 text-sm font-semibold">{error || 'Không tìm thấy bài làm'}</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 rounded-xl bg-slate-100 text-xs font-semibold hover:bg-slate-200"
        >
          Quay lại
        </button>
      </div>
    );
  }

  const formattedTimeSpent = attempt.timeSpentSeconds
    ? `${Math.floor(attempt.timeSpentSeconds / 60)} phút ${attempt.timeSpentSeconds % 60} giây`
    : 'Chưa có thông tin';

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách kết quả</span>
        </button>

        <button
          onClick={handleDelete}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs border border-red-200 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Trash2 className="w-4 h-4" />
          <span>Xóa Bài Làm Này</span>
        </button>
      </div>

      {/* Student Overview Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs">
              <span>{attempt.quizTitle}</span>
              <span>&bull;</span>
              <span className="font-mono">Mã bài: {attempt.quizId}</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <span>{attempt.studentName}</span>
              <span className="text-sm font-normal text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                Lớp {attempt.studentClass}
              </span>
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Thời gian làm: <strong>{formattedTimeSpent}</strong>
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Nộp lúc: <strong>{new Date(attempt.submittedAt || '').toLocaleString('vi-VN')}</strong>
              </span>
              {attempt.tabSwitchCount > 0 && (
                <>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1 text-amber-600 font-semibold">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Chuyển tab: {attempt.tabSwitchCount} lần
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Score Badge */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-indigo-50 via-slate-50 to-indigo-100/50 border border-indigo-100">
            <div className="text-center">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Điểm Đạt Được
              </div>
              <div className="text-4xl font-extrabold text-indigo-600 mt-0.5">
                {attempt.score?.toFixed(2)}
                <span className="text-sm text-slate-400 font-normal"> / 10</span>
              </div>
            </div>
            <div className="h-10 w-[1px] bg-slate-200"></div>
            <div className="text-xs space-y-1">
              <div className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Đúng: {attempt.numCorrect} câu
              </div>
              <div className="text-red-600 font-semibold flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" />
                Sai: {attempt.numIncorrect} câu
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Question Review */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          <span>Chi Tiết Từng Câu Hỏi & Lựa Chọn Của Học Sinh</span>
        </h3>

        {attempt.detailedQuestions?.map((q, idx) => {
          const studentRecord = q.studentRecord;
          const isCorrect = studentRecord?.isCorrect;
          const studentAns = studentRecord?.selectedAnswer;
          const correctAns = q.correctAnswer;
          const history = studentRecord?.history || [];

          return (
            <div
              key={q.id}
              className={`bg-white rounded-2xl p-5 border transition-all ${
                isCorrect
                  ? 'border-emerald-200/90 shadow-sm'
                  : 'border-red-200/90 shadow-sm'
              }`}
            >
              {/* Question Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center">
                    Câu {idx + 1}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {q.type === 'multiple_choice' ? 'Trắc nghiệm' : 'Đúng / Sai'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isCorrect ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Chính xác (+{studentRecord?.scoreAwarded?.toFixed(2) || 1} đ)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                      <XCircle className="w-3.5 h-3.5" />
                      Chưa chính xác (0 đ)
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="text-xs font-semibold text-slate-800 mb-3 whitespace-pre-line leading-relaxed">
                {q.content}
              </div>

              {/* Multiple Choice inspection */}
              {q.type === 'multiple_choice' && q.options && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-3">
                  {(['A', 'B', 'C', 'D'] as const).map((key) => {
                    const optText = q.options![key];
                    if (!optText && optText !== '') return null;

                    const isStudentChoice = studentAns === key;
                    const isRightChoice = correctAns === key;

                    let bgStyle = 'bg-slate-50 border-slate-200 text-slate-700';
                    if (isRightChoice && isStudentChoice) {
                      bgStyle = 'bg-emerald-100/70 border-emerald-500 text-emerald-950 font-bold ring-1 ring-emerald-400';
                    } else if (isRightChoice) {
                      bgStyle = 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold';
                    } else if (isStudentChoice) {
                      bgStyle = 'bg-red-50 border-red-400 text-red-950 font-bold';
                    }

                    return (
                      <div
                        key={key}
                        className={`p-2.5 rounded-xl border flex items-center justify-between ${bgStyle}`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-6 h-6 rounded text-xs font-bold flex items-center justify-center ${
                              isRightChoice
                                ? 'bg-emerald-600 text-white'
                                : isStudentChoice
                                ? 'bg-red-600 text-white'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {key}
                          </span>
                          <span>{optText}</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] font-bold">
                          {isRightChoice && (
                            <span className="text-emerald-700 bg-white/80 px-2 py-0.5 rounded border border-emerald-200">
                              Đáp án đúng
                            </span>
                          )}
                          {isStudentChoice && (
                            <span
                              className={`px-2 py-0.5 rounded ${
                                isRightChoice
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-red-600 text-white'
                              }`}
                            >
                              Học sinh chọn
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* True/False Statements inspection */}
              {q.type === 'true_false' && q.statements && (
                <div className="space-y-1.5 text-xs mb-3">
                  {(['a', 'b', 'c', 'd'] as const).map((key) => {
                    const stmtText = q.statements![key];
                    if (!stmtText) return null;
                    const rightVal = q.statementAnswers?.[key];
                    const studentVal = studentRecord?.statementAnswers?.[key];
                    const stmtCorrect = rightVal === studentVal;

                    return (
                      <div
                        key={key}
                        className={`p-2.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                          stmtCorrect
                            ? 'bg-slate-50 border-slate-200'
                            : 'bg-red-50/50 border-red-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                            {key}.
                          </span>
                          <span className="text-slate-800 font-medium">{stmtText}</span>
                        </div>

                        <div className="flex items-center gap-3 text-xs">
                          <div className="flex items-center gap-1">
                            <span className="text-slate-500">Đ.Án đúng:</span>
                            <span
                              className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                                rightVal
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {rightVal ? 'ĐÚNG' : 'SAI'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <span className="text-slate-500">HS chọn:</span>
                            <span
                              className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                                studentVal === undefined
                                  ? 'bg-slate-100 text-slate-400'
                                  : stmtCorrect
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-red-600 text-white'
                              }`}
                            >
                              {studentVal === undefined
                                ? 'Chưa chọn'
                                : studentVal
                                ? 'ĐÚNG'
                                : 'SAI'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Timestamp & history */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                <div>
                  Thời điểm học sinh chọn: <strong>{new Date(studentRecord?.answeredAt || '').toLocaleTimeString('vi-VN')}</strong>
                </div>

                {history.length > 0 && (
                  <div className="flex items-center gap-1 text-slate-600">
                    <History className="w-3.5 h-3.5 text-indigo-500" />
                    <span>
                      Học sinh đã đổi đáp án {history.length} lần trước khi nộp
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {/* Delete Confirmation Modal (In-app, no window.confirm) */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Xóa bài làm của học sinh?</h3>
              <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-3 rounded-xl border border-slate-200 font-semibold">
                {attempt.studentName} &bull; Lớp {attempt.studentClass} &bull; Điểm: {attempt.score?.toFixed(2)}
              </p>
              <p className="text-[11px] text-slate-400 mt-2">
                Bài thi này sẽ bị xóa vĩnh viễn khỏi danh sách kết quả.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setShowDeleteModal(false)}
                className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={async () => {
                  setDeleting(true);
                  try {
                    await api.deleteAttempt(attemptId);
                    setShowDeleteModal(false);
                    onDeleted();
                  } catch (err: any) {
                    alert(err.message || 'Lỗi khi xóa bài làm');
                    setDeleting(false);
                  }
                }}
                className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-500/20 cursor-pointer disabled:opacity-50"
              >
                {deleting ? 'Đang xóa...' : 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
