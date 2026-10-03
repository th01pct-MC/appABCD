import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Check, Trash2 } from 'lucide-react';
import { Question, QuestionType } from '../types/quiz';

interface QuestionEditorProps {
  initialQuestion?: Question | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (q: Partial<Question>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export const QuestionEditor: React.FC<QuestionEditorProps> = ({
  initialQuestion,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const [type, setType] = useState<QuestionType>('multiple_choice');
  const [content, setContent] = useState('');
  const [options, setOptions] = useState<{ [key: string]: string }>({
    A: '',
    B: '',
    C: '',
    D: '',
  });
  const [correctAnswer, setCorrectAnswer] = useState<string>('A');
  const [statements, setStatements] = useState<{ [key: string]: string }>({
    a: '',
    b: '',
    c: '',
    d: '',
  });
  const [statementAnswers, setStatementAnswers] = useState<{ [key: string]: boolean }>({
    a: true,
    b: false,
    c: true,
    d: false,
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setConfirmDelete(false);
    if (initialQuestion) {
      setType(initialQuestion.type);
      setContent(initialQuestion.content);
      if (initialQuestion.options) {
        setOptions({
          A: initialQuestion.options.A || '',
          B: initialQuestion.options.B || '',
          C: initialQuestion.options.C || '',
          D: initialQuestion.options.D || '',
        });
      }
      setCorrectAnswer(initialQuestion.correctAnswer || 'A');
      if (initialQuestion.statements) {
        setStatements({
          a: initialQuestion.statements.a || '',
          b: initialQuestion.statements.b || '',
          c: initialQuestion.statements.c || '',
          d: initialQuestion.statements.d || '',
        });
      }
      if (initialQuestion.statementAnswers) {
        setStatementAnswers({
          a: initialQuestion.statementAnswers.a ?? true,
          b: initialQuestion.statementAnswers.b ?? false,
          c: initialQuestion.statementAnswers.c ?? true,
          d: initialQuestion.statementAnswers.d ?? false,
        });
      }
    } else {
      // Defaults for new question
      setType('multiple_choice');
      setContent('');
      setOptions({ A: '', B: '', C: '', D: '' });
      setCorrectAnswer('A');
      setStatements({ a: '', b: '', c: '', d: '' });
      setStatementAnswers({ a: true, b: false, c: true, d: false });
    }
    setError(null);
  }, [initialQuestion, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!content.trim()) {
      setError('Vui lòng nhập nội dung câu hỏi');
      return;
    }

    if (type === 'multiple_choice') {
      if (!options.A.trim() || !options.B.trim()) {
        setError('Vui lòng nhập ít nhất 2 đáp án A và B');
        return;
      }
    } else {
      if (!statements.a.trim() || !statements.b.trim()) {
        setError('Vui lòng nhập nội dung cho các mệnh đề Đúng/Sai');
        return;
      }
    }

    setSaving(true);
    try {
      const payload: Partial<Question> = {
        type,
        content: content.trim(),
        answerDetectionMethod: 'admin_confirmed',
        verificationStatus: 'verified',
        detectionDetails: 'Giáo viên chỉnh sửa / tạo thủ công',
        reviewReason: undefined,
      };

      if (type === 'multiple_choice') {
        payload.options = options;
        payload.correctAnswer = correctAnswer;
      } else {
        payload.statements = statements;
        payload.statementAnswers = statementAnswers;
      }

      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi lưu câu hỏi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">
            {initialQuestion ? 'Chỉnh Sửa Câu Hỏi' : 'Thêm Câu Hỏi Mới'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Question Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Loại câu hỏi</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('multiple_choice')}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  type === 'multiple_choice'
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-700 ring-2 ring-indigo-200'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                }`}
              >
                Trắc Nghiệm Nhiều Lựa Chọn (A, B, C, D)
              </button>
              <button
                type="button"
                onClick={() => setType('true_false')}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  type === 'true_false'
                    ? 'bg-purple-50 border-purple-600 text-purple-700 ring-2 ring-purple-200'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                }`}
              >
                Câu Hỏi Đúng / Sai (Mệnh đề a, b, c, d)
              </button>
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Nội dung câu hỏi <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập nội dung câu hỏi..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none text-slate-800 transition-all"
            />
          </div>

          {/* Multiple Choice Options */}
          {type === 'multiple_choice' ? (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">
                Các phương án và chọn đáp án đúng <span className="text-red-500">*</span>
              </label>
              {(['A', 'B', 'C', 'D'] as const).map((key) => {
                const isSelected = correctAnswer === key;
                return (
                  <div
                    key={key}
                    onClick={() => setCorrectAnswer(key)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/70 border-emerald-500 ring-1 ring-emerald-400'
                        : 'bg-slate-50 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <button
                      type="button"
                      className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {key}
                    </button>
                    <input
                      type="text"
                      value={options[key]}
                      onChange={(e) => {
                        e.stopPropagation();
                        setOptions({ ...options, [key]: e.target.value });
                      }}
                      placeholder={`Nội dung phương án ${key}...`}
                      className="flex-1 bg-transparent border-0 text-xs focus:ring-0 focus:outline-none text-slate-800"
                    />
                    {isSelected && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                        <Check className="w-3 h-3" /> Đúng
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* True/False Statements */
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">
                Các mệnh đề và kết quả Đúng/Sai <span className="text-red-500">*</span>
              </label>
              {(['a', 'b', 'c', 'd'] as const).map((key) => {
                const isTrue = statementAnswers[key] === true;
                return (
                  <div
                    key={key}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <span className="w-6 h-6 rounded bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
                        {key}.
                      </span>
                      <input
                        type="text"
                        value={statements[key]}
                        onChange={(e) =>
                          setStatements({ ...statements, [key]: e.target.value })
                        }
                        placeholder={`Nội dung mệnh đề ${key}...`}
                        className="flex-1 bg-transparent border-0 text-xs focus:ring-0 focus:outline-none text-slate-800"
                      />
                    </div>
                    <div className="flex items-center gap-1 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() =>
                          setStatementAnswers({ ...statementAnswers, [key]: true })
                        }
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isTrue
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Đúng
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setStatementAnswers({ ...statementAnswers, [key]: false })
                        }
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          !isTrue
                            ? 'bg-red-600 text-white shadow-sm'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Sai
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
            <div>
              {initialQuestion && onDelete && (
                confirmDelete ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={deleting}
                      onClick={async () => {
                        setDeleting(true);
                        try {
                          await onDelete(initialQuestion.id);
                          onClose();
                        } catch (err: any) {
                          setError(err.message || 'Lỗi khi xóa câu hỏi');
                          setDeleting(false);
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      {deleting ? 'Đang xóa...' : 'Xác nhận xóa câu hỏi này?'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="px-2.5 py-1.5 rounded-xl text-slate-500 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                    >
                      Hủy
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer border border-red-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa câu hỏi</span>
                  </button>
                )
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving || deleting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Lưu Câu Hỏi</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
