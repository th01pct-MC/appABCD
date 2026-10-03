import React from 'react';
import { AlertTriangle, CheckCircle2, ArrowLeft, Send } from 'lucide-react';

interface SubmitConfirmationProps {
  isOpen: boolean;
  unansweredCount: number;
  totalQuestions: number;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const SubmitConfirmation: React.FC<SubmitConfirmationProps> = ({
  isOpen,
  unansweredCount,
  totalQuestions,
  isSubmitting,
  onCancel,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="text-center mb-5">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg ${
              unansweredCount > 0
                ? 'bg-amber-50 text-amber-600 shadow-amber-500/20'
                : 'bg-emerald-50 text-emerald-600 shadow-emerald-500/20'
            }`}
          >
            {unansweredCount > 0 ? (
              <AlertTriangle className="w-7 h-7" />
            ) : (
              <CheckCircle2 className="w-7 h-7" />
            )}
          </div>

          <h3 className="text-lg font-bold text-slate-800">
            Bạn có chắc chắn muốn nộp bài?
          </h3>

          {unansweredCount > 0 ? (
            <div className="mt-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
              Bạn còn <strong className="text-amber-900 text-sm">{unansweredCount}</strong> câu chưa trả lời xong trên tổng số {totalQuestions} câu.
            </div>
          ) : (
            <p className="text-xs text-slate-500 mt-1">
              Bạn đã hoàn thành toàn bộ {totalQuestions} câu hỏi. Sau khi nộp, bạn sẽ không thể thay đổi đáp án.
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>QUAY LẠI</span>
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>XÁC NHẬN NỘP</span>
          </button>
        </div>
      </div>
    </div>
  );
};
