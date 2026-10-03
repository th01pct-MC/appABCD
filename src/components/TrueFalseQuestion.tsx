import React from 'react';
import { Bookmark, Check, Circle } from 'lucide-react';
import { ClientQuizQuestion } from '../types/quiz';

interface TrueFalseQuestionProps {
  question: ClientQuizQuestion;
  questionIndex: number;
  totalQuestions: number;
  statementAnswers?: { [key: string]: boolean };
  isFlagged: boolean;
  onSelectStatementAnswer: (stmtKey: string, value: boolean) => void;
  onToggleFlag: () => void;
  saveStatus?: 'saved' | 'saving' | 'error';
}

export const TrueFalseQuestion: React.FC<TrueFalseQuestionProps> = ({
  question,
  questionIndex,
  totalQuestions,
  statementAnswers = {},
  isFlagged,
  onSelectStatementAnswer,
  onToggleFlag,
  saveStatus = 'saved',
}) => {
  const statements = question.statements || {};
  const statementKeys = (['a', 'b', 'c', 'd'] as const).filter((k) => statements[k] !== undefined && statements[k] !== '');

  const answeredCount = statementKeys.filter((k) => statementAnswers[k] !== undefined).length;
  const isFullyAnswered = answeredCount === statementKeys.length;

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 rounded-lg bg-purple-50 text-purple-700">
            Câu {questionIndex + 1} / {totalQuestions}
          </span>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Câu hỏi Đúng / Sai ({answeredCount}/{statementKeys.length} mệnh đề)
          </span>
        </div>

        <button
          type="button"
          onClick={onToggleFlag}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            isFlagged
              ? 'bg-amber-100 text-amber-800 border border-amber-300'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isFlagged ? 'fill-amber-600 text-amber-600' : ''}`} />
          <span>{isFlagged ? 'Đã đánh dấu' : 'Đánh dấu xem lại'}</span>
        </button>
      </div>

      {/* Content */}
      <div className="text-sm sm:text-base font-semibold text-slate-800 leading-relaxed whitespace-pre-line">
        {question.content}
      </div>

      {/* Statements Table / Mobile Cards (Section 16) */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 divide-y divide-slate-200">
        {/* Table header on larger screens */}
        <div className="hidden sm:grid grid-cols-12 bg-slate-50 p-3 text-xs font-bold text-slate-600">
          <div className="col-span-8">Nội dung mệnh đề</div>
          <div className="col-span-2 text-center">Đúng</div>
          <div className="col-span-2 text-center">Sai</div>
        </div>

        {/* Statement Rows */}
        {statementKeys.map((key) => {
          const text = statements[key];
          const val = statementAnswers[key];

          return (
            <div
              key={key}
              className={`p-4 transition-all flex flex-col sm:grid sm:grid-cols-12 gap-3 sm:items-center ${
                val !== undefined ? 'bg-indigo-50/20' : 'bg-white'
              }`}
            >
              {/* Statement text */}
              <div className="sm:col-span-8 flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  {key}
                </span>
                <span className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                  {text}
                </span>
              </div>

              {/* True button */}
              <div className="sm:col-span-2 flex justify-end sm:justify-center">
                <button
                  type="button"
                  onClick={() => onSelectStatementAnswer(key, true)}
                  className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    val === true
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      val === true ? 'border-white bg-white text-emerald-600' : 'border-slate-300'
                    }`}
                  >
                    {val === true && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                  <span>Đúng</span>
                </button>
              </div>

              {/* False button */}
              <div className="sm:col-span-2 flex justify-end sm:justify-center">
                <button
                  type="button"
                  onClick={() => onSelectStatementAnswer(key, false)}
                  className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    val === false
                      ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-500/20'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      val === false ? 'border-white bg-white text-red-600' : 'border-slate-300'
                    }`}
                  >
                    {val === false && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                  <span>Sai</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Auto-save confirmation indicator */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
        <div>
          {isFullyAnswered ? (
            <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
              <Check className="w-3.5 h-3.5" />
              Đã lưu đầy đủ {statementKeys.length} mệnh đề
            </span>
          ) : answeredCount > 0 ? (
            <span className="text-indigo-600 font-medium">
              Đã lưu {answeredCount}/{statementKeys.length} mệnh đề
            </span>
          ) : (
            <span className="text-slate-400 italic">Chưa chọn mệnh đề nào</span>
          )}
        </div>
        <div className="text-slate-400">
          Có thể thay đổi trước khi nhấn Nộp bài
        </div>
      </div>
    </div>
  );
};
