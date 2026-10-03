import React from 'react';
import { Bookmark } from 'lucide-react';
import { ClientQuizQuestion, StudentAnswerRecord } from '../types/quiz';

interface QuestionNavigationProps {
  questions: ClientQuizQuestion[];
  currentIndex: number;
  answers: { [questionId: string]: StudentAnswerRecord };
  flaggedQuestionIds: Set<string>;
  onSelectIndex: (index: number) => void;
}

export const QuestionNavigation: React.FC<QuestionNavigationProps> = ({
  questions,
  currentIndex,
  answers,
  flaggedQuestionIds,
  onSelectIndex,
}) => {
  const isQuestionAnswered = (q: ClientQuizQuestion) => {
    const ans = answers[q.id];
    if (!ans) return false;
    if (q.type === 'multiple_choice') {
      return Boolean(ans.selectedAnswer);
    } else {
      const stmtKeys = Object.keys(q.statements || {});
      const userStmts = ans.statementAnswers || {};
      return stmtKeys.length > 0 && stmtKeys.every((k) => userStmts[k] !== undefined);
    }
  };

  const answeredCount = questions.filter(isQuestionAnswered).length;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
      {/* Title & Stats */}
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Danh Sách Câu Hỏi
        </h4>
        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
          Đã làm: {answeredCount} / {questions.length}
        </span>
      </div>

      {/* Grid of question buttons */}
      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-5 lg:grid-cols-6 gap-2">
        {questions.map((q, idx) => {
          const isCurrent = currentIndex === idx;
          const isAnswered = isQuestionAnswered(q);
          const isFlagged = flaggedQuestionIds.has(q.id);

          let btnStyle = 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'; // Chưa làm
          if (isAnswered) {
            btnStyle = 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/20'; // Đã trả lời
          }
          if (isCurrent) {
            btnStyle += ' ring-2 ring-indigo-400 ring-offset-2 font-black'; // Đang xem
          }

          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onSelectIndex(idx)}
              className={`relative h-10 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${btnStyle}`}
            >
              <span>{idx + 1}</span>

              {/* Flag marker */}
              {isFlagged && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                  <Bookmark className="w-2 h-2 text-white fill-white" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend (Section 19) */}
      <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-500 font-medium">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-slate-100 border border-slate-200"></span>
          <span>Chưa làm</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-indigo-600 border border-indigo-600"></span>
          <span>Đã trả lời</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded border-2 border-indigo-500"></span>
          <span>Đang xem</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500"></span>
          <span>Đánh dấu xem lại</span>
        </div>
      </div>
    </div>
  );
};
