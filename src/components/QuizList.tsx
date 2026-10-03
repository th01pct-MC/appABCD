import React, { useState } from 'react';
import { 
  Copy, 
  ExternalLink, 
  Eye, 
  Power, 
  Trash2, 
  Check, 
  Clock, 
  Calendar, 
  HelpCircle,
  Plus,
  Share2
} from 'lucide-react';
import { Quiz } from '../types/quiz';

interface QuizListProps {
  quizzes: Quiz[];
  onToggleStatus: (id: string, newStatus: 'active' | 'closed') => Promise<void>;
  onDeleteQuiz: (id: string) => Promise<void>;
  onPreviewQuiz: (code: string) => void;
  onNavigateToCreate: () => void;
}

export const QuizList: React.FC<QuizListProps> = ({
  quizzes,
  onToggleStatus,
  onDeleteQuiz,
  onPreviewQuiz,
  onNavigateToCreate,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<'link' | 'code' | null>(null);
  const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null);
  const [deletingQuiz, setDeletingQuiz] = useState(false);

  const getFullQuizUrl = (code: string) => {
    return `${window.location.origin}?quiz=${code}`;
  };

  const copyToClipboard = (text: string, id: string, type: 'link' | 'code') => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setCopiedType(type);
    setTimeout(() => {
      setCopiedId(null);
      setCopiedType(null);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Share2 className="w-6 h-6 text-indigo-600" />
            <span>Danh Sách Bài Kiểm Tra</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              {quizzes.length} đề thi
            </span>
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Sao chép liên kết hoặc mã đề để gửi học sinh qua Zalo, Messenger hoặc Google Classroom
          </p>
        </div>

        <button
          onClick={onNavigateToCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Đề Mới</span>
        </button>
      </div>

      {quizzes.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
          <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-700">Chưa có bài kiểm tra nào</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Thầy/Cô hãy bấm vào nút bên dưới để tạo bài kiểm tra đầu tiên từ ngân hàng câu hỏi.
          </p>
          <button
            onClick={onNavigateToCreate}
            className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-all cursor-pointer"
          >
            Tạo bài kiểm tra ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizzes.map((quiz) => {
            const quizUrl = getFullQuizUrl(quiz.id);
            const isLinkCopied = copiedId === quiz.id && copiedType === 'link';
            const isCodeCopied = copiedId === quiz.id && copiedType === 'code';

            return (
              <div
                key={quiz.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-indigo-200 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Status & Code */}
                  <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-mono font-bold text-xs shadow-sm">
                        {quiz.id}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        {quiz.teacherName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {quiz.status === 'active' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                          Đang mở
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          Đã đóng
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-slate-800 mb-2 leading-snug">
                    {quiz.title}
                  </h3>

                  {/* Stats */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mb-4">
                    <div className="flex items-center gap-1 text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{quiz.durationMinutes} phút</span>
                    </div>
                    <span>&bull;</span>
                    <div>
                      {quiz.numMultipleChoice} câu trắc nghiệm
                    </div>
                    <span>&bull;</span>
                    <div>
                      {quiz.numTrueFalse} câu Đúng/Sai
                    </div>
                  </div>

                  {/* Link Box */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600 truncate mb-4 flex items-center justify-between">
                    <span className="truncate mr-2">{quizUrl}</span>
                    <button
                      onClick={() => copyToClipboard(quizUrl, quiz.id, 'link')}
                      className="p-1 text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer flex-shrink-0"
                      title="Sao chép liên kết"
                    >
                      {isLinkCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Action Buttons as requested in Section 11 */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* SAO CHÉP LINK */}
                    <button
                      onClick={() => copyToClipboard(quizUrl, quiz.id, 'link')}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isLinkCopied
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                      }`}
                    >
                      {isLinkCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isLinkCopied ? 'Đã sao chép' : 'SAO CHÉP LINK'}</span>
                    </button>

                    {/* SAO CHÉP MÃ */}
                    <button
                      onClick={() => copyToClipboard(quiz.id, quiz.id, 'code')}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isCodeCopied
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {isCodeCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCodeCopied ? 'Đã chép mã' : 'SAO CHÉP MÃ'}</span>
                    </button>

                    {/* XEM TRƯỚC */}
                    <button
                      onClick={() => onPreviewQuiz(quiz.id)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-600" />
                      <span>XEM TRƯỚC</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* ĐÓNG / MỞ BÀI */}
                    <button
                      onClick={() =>
                        onToggleStatus(quiz.id, quiz.status === 'active' ? 'closed' : 'active')
                      }
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        quiz.status === 'active'
                          ? 'text-amber-600 hover:bg-amber-50'
                          : 'text-emerald-600 hover:bg-emerald-50'
                      }`}
                      title={quiz.status === 'active' ? 'Đóng bài kiểm tra' : 'Mở lại bài kiểm tra'}
                    >
                      <Power className="w-4 h-4" />
                    </button>

                    {/* XÓA BÀI */}
                    <button
                      type="button"
                      onClick={() => setQuizToDelete(quiz)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Xóa bài kiểm tra"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Quiz Modal (In-app, no window.confirm) */}
      {quizToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Xóa bài kiểm tra?</h3>
              <p className="text-xs text-slate-700 font-semibold mt-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                {quizToDelete.title} ({quizToDelete.id})
              </p>
              <p className="text-[11px] text-slate-400 mt-2">
                Học sinh sẽ không thể truy cập link bài kiểm tra này sau khi bị xóa.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={deletingQuiz}
                onClick={() => setQuizToDelete(null)}
                className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={deletingQuiz}
                onClick={async () => {
                  setDeletingQuiz(true);
                  try {
                    await onDeleteQuiz(quizToDelete.id);
                    setQuizToDelete(null);
                  } catch (err: any) {
                    alert(err.message || 'Lỗi khi xóa bài kiểm tra');
                  } finally {
                    setDeletingQuiz(false);
                  }
                }}
                className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-500/20 cursor-pointer disabled:opacity-50"
              >
                {deletingQuiz ? 'Đang xóa...' : 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
