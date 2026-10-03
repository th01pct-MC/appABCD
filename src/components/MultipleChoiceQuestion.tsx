import React from 'react';
import { Bookmark, Check, Circle } from 'lucide-react';
import { ClientQuizQuestion } from '../types/quiz';

interface MultipleChoiceQuestionProps {
  question: ClientQuizQuestion;
  questionIndex: number;
  totalQuestions: number;
  selectedAnswer?: string;
  isFlagged: boolean;
  onSelectAnswer: (optionKey: string) => void;
  onToggleFlag: () => void;
  saveStatus?: 'saved' | 'saving' | 'error';
}

export const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({
  question,
  questionIndex,
  totalQuestions,
  selectedAnswer,
  isFlagged,
  onSelectAnswer,
  onToggleFlag,
  saveStatus = 'saved',
}) => {
  const options = question.options || {};
  const optionKeys = (['A', 'B', 'C', 'D'] as const).filter((k) => options[k] !== undefined && options[k] !== '');

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
      {/* Question Header */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700">
            Câu {questionIndex + 1} / {totalQuestions}
          </span>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Trắc nghiệm nhiều lựa chọn
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Flag question */}
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
      </div>

      {/* Content */}
      <div className="text-sm sm:text-base font-semibold text-slate-800 leading-relaxed whitespace-pre-line">
        {question.content}
      </div>

      {/* Options A, B, C, D */}
      <div className="space-y-3 pt-2">
        {optionKeys.map((key) => {
          const text = options[key];
          const isSelected = selectedAnswer === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectAnswer(key)}
              className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between cursor-pointer group ${
                isSelected
                  ? 'bg-indigo-50/80 border-indigo-600 text-indigo-950 font-semibold ring-2 ring-indigo-200 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <span
                  className={`w-8 h-8 rounded-xl text-xs font-bold flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                      : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                  }`}
                >
                  {key}
                </span>
                <span className="leading-relaxed">{text}</span>
              </div>

              <div className="flex-shrink-0 ml-3">
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : 'border-slate-300'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Auto-save confirmation indicator */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
        <div>
          {selectedAnswer ? (
            <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
              <Check className="w-3.5 h-3.5" />
              Đã lưu đáp án: {selectedAnswer}
            </span>
          ) : (
            <span className="text-slate-400 italic">Chưa chọn đáp án</span>
          )}
        </div>
        <div className="text-slate-400">
          Có thể thay đổi đáp án trước khi nhấn Nộp bài
        </div>
      </div>
    </div>
  );
};
