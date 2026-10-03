import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Save, 
  X, 
  FileText, 
  Filter, 
  Check, 
  Edit3, 
  ArrowLeft,
  Sparkles,
  Trash2
} from 'lucide-react';
import { Question, ParsedQuestionResult, QuestionType, AnswerDetectionMethod } from '../types/quiz';

interface QuestionImportPreviewProps {
  result: ParsedQuestionResult;
  fileName: string;
  onConfirmSave: (questions: Question[]) => Promise<void>;
  onCancel: () => void;
}

export const QuestionImportPreview: React.FC<QuestionImportPreviewProps> = ({
  result,
  fileName,
  onConfirmSave,
  onCancel,
}) => {
  const [questions, setQuestions] = useState<Question[]>(result.questions);
  const [filterType, setFilterType] = useState<'all' | 'verified' | 'needs_review'>('all');
  const [saving, setSaving] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);

  // Recalculate dynamic counts
  const total = questions.length;
  const multipleChoiceCount = questions.filter((q) => q.type === 'multiple_choice').length;
  const trueFalseCount = questions.filter((q) => q.type === 'true_false').length;
  const verifiedCount = questions.filter((q) => q.verificationStatus === 'verified').length;
  const needsReviewCount = questions.filter((q) => q.verificationStatus === 'needs_review').length;

  // Filtered list
  const filteredQuestions = questions.filter((q) => {
    if (filterType === 'verified') return q.verificationStatus === 'verified';
    if (filterType === 'needs_review') return q.verificationStatus === 'needs_review';
    return true;
  });

  // Admin changes answer for Multiple Choice question
  const handleUpdateMcAnswer = (qIndex: number, newOptionKey: string) => {
    const updated = [...questions];
    updated[qIndex] = {
      ...updated[qIndex],
      correctAnswer: newOptionKey,
      verificationStatus: 'verified',
      answerDetectionMethod: 'admin_confirmed',
      detectionDetails: `Giáo viên đã xác nhận đáp án: ${newOptionKey}`,
      reviewReason: undefined,
      updatedAt: new Date().toISOString(),
    };
    setQuestions(updated);
  };

  // Admin toggles statement answer for True/False question
  const handleToggleStatementAnswer = (qIndex: number, stmtKey: string, value: boolean) => {
    const updated = [...questions];
    const prev = updated[qIndex].statementAnswers || {};
    const newStmtAnswers = {
      ...prev,
      [stmtKey]: value,
    };
    updated[qIndex] = {
      ...updated[qIndex],
      statementAnswers: newStmtAnswers,
      verificationStatus: 'verified',
      answerDetectionMethod: 'admin_confirmed',
      detectionDetails: 'Giáo viên đã xác nhận đầy đủ đáp án Đúng/Sai',
      reviewReason: undefined,
      updatedAt: new Date().toISOString(),
    };
    setQuestions(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onConfirmSave(questions);
    } finally {
      setSaving(false);
    }
  };

  const getMethodBadge = (method: AnswerDetectionMethod) => {
    switch (method) {
      case 'red_text':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            Chữ màu đỏ
          </span>
        );
      case 'underline':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            Gạch chân
          </span>
        );
      case 'explicit_answer':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            Đáp án ghi rõ
          </span>
        );
      case 'admin_confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            Admin xác nhận
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold mb-2 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại trang tải file</span>
          </button>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <span>KẾT QUẢ PHÂN TÍCH FILE</span>
            <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
              {fileName}
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            disabled={saving}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-all cursor-pointer"
          >
            Hủy Bỏ
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>LƯU VÀO NGÂN HÀNG CÂU HỎI ({questions.length})</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics Box (as requested in Section 5) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <div className="text-xs text-slate-500 font-medium">Tổng số câu</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">{total}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <div className="text-xs text-slate-500 font-medium">Trắc nghiệm</div>
          <div className="text-2xl font-bold text-indigo-600 mt-1">{multipleChoiceCount}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <div className="text-xs text-slate-500 font-medium">Đúng / Sai</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">{trueFalseCount}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 shadow-sm text-center">
          <div className="text-xs text-emerald-700 font-medium">Đã xác định</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{verifiedCount}</div>
        </div>
        <div className={`p-4 rounded-xl border shadow-sm text-center ${
          needsReviewCount > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'
        }`}>
          <div className={`text-xs font-medium ${needsReviewCount > 0 ? 'text-amber-800 font-bold' : 'text-slate-500'}`}>
            Cần kiểm tra
          </div>
          <div className={`text-2xl font-bold mt-1 ${needsReviewCount > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
            {needsReviewCount}
          </div>
        </div>
      </div>

      {needsReviewCount > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
          <div>
            <p className="font-bold text-sm">Hệ thống phát hiện {needsReviewCount} câu cần thầy/cô xác nhận đáp án</p>
            <p className="mt-0.5">
              Những câu này có thể có mâu thuẫn giữa đáp án ghi rõ và màu chữ tô đỏ, hoặc chưa xác định chắc chắn.
              Thầy/Cô chỉ cần bấm trực tiếp vào đáp án mong muốn bên dưới để xác nhận trước khi lưu.
            </p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <span className="text-xs font-semibold text-slate-500 mr-2 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Lọc xem:
        </span>
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            filterType === 'all'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Tất cả ({total})
        </button>
        <button
          onClick={() => setFilterType('needs_review')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            filterType === 'needs_review'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-amber-700 bg-amber-50 hover:bg-amber-100'
          }`}
        >
          Cần kiểm tra ({needsReviewCount})
        </button>
        <button
          onClick={() => setFilterType('verified')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            filterType === 'verified'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
          }`}
        >
          Đã xác định ({verifiedCount})
        </button>
      </div>

      {/* Questions Inspection List */}
      <div className="space-y-4">
        {filteredQuestions.map((q, idx) => {
          const originalIndex = questions.findIndex((orig) => orig.id === q.id);

          return (
            <div
              key={q.id}
              className={`bg-white rounded-2xl p-5 border transition-all ${
                q.verificationStatus === 'needs_review'
                  ? 'border-amber-300 ring-2 ring-amber-100 shadow-sm'
                  : 'border-slate-200 shadow-sm'
              }`}
            >
              {/* Question Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 uppercase">
                    {q.type === 'multiple_choice' ? 'Trắc nghiệm nhiều lựa chọn' : 'Câu hỏi Đúng / Sai'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {getMethodBadge(q.answerDetectionMethod)}

                  {q.verificationStatus === 'verified' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Đã xác định
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Cần kiểm tra
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => setQuestionToDelete(q)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer ml-1"
                    title="Xóa câu hỏi này khỏi danh sách"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Question Content */}
              <div className="text-sm font-semibold text-slate-800 mb-4 whitespace-pre-line leading-relaxed">
                {q.content}
              </div>

              {/* Review Reason Alert */}
              {q.reviewReason && (
                <div className="mb-4 p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Lý do cần kiểm tra: </span>
                    {q.reviewReason}
                  </div>
                </div>
              )}

              {/* Options for Multiple Choice */}
              {q.type === 'multiple_choice' && q.options && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                  {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                    const optText = q.options![optKey];
                    if (!optText && optText !== '') return null;
                    const isSelected = q.correctAnswer === optKey;

                    return (
                      <button
                        key={optKey}
                        type="button"
                        onClick={() => handleUpdateMcAnswer(originalIndex, optKey)}
                        className={`text-left p-3 rounded-xl border text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold ring-1 ring-emerald-400'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center ${
                              isSelected
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {optKey}
                          </span>
                          <span>{optText}</span>
                        </div>
                        {isSelected && (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Check className="w-3 h-3" /> Đáp án đúng
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Statements for True/False */}
              {q.type === 'true_false' && q.statements && (
                <div className="space-y-2 mb-4">
                  {(['a', 'b', 'c', 'd'] as const).map((stmtKey) => {
                    const stmtText = q.statements![stmtKey];
                    if (!stmtText) return null;
                    const currentVal = q.statementAnswers?.[stmtKey];

                    return (
                      <div
                        key={stmtKey}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                      >
                        <div className="flex items-start gap-2.5 flex-1">
                          <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                            {stmtKey}.
                          </span>
                          <span className="text-slate-800 font-medium">{stmtText}</span>
                        </div>

                        <div className="flex items-center gap-1.5 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => handleToggleStatementAnswer(originalIndex, stmtKey, true)}
                            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                              currentVal === true
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            Đúng
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleStatementAnswer(originalIndex, stmtKey, false)}
                            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                              currentVal === false
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

              {/* Detection note */}
              {q.detectionDetails && (
                <div className="text-[11px] text-slate-500 italic flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Chi tiết nhận diện: {q.detectionDetails}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Save Bar */}
      <div className="sticky bottom-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-200 flex items-center justify-between gap-4">
        <div className="text-xs text-slate-600">
          Đang hiển thị <strong>{filteredQuestions.length}</strong> / <strong>{total}</strong> câu hỏi.
          {needsReviewCount > 0 && (
            <span className="text-amber-700 font-semibold ml-2">
              (Còn {needsReviewCount} câu cần kiểm tra)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            disabled={saving}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs cursor-pointer"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>LƯU VÀO NGÂN HÀNG CÂU HỎI</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal (In-app, no window.confirm) */}
      {questionToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Xóa câu hỏi này khỏi danh sách?</h3>
              <p className="text-xs text-slate-500 mt-2 line-clamp-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-left">
                {questionToDelete.content}
              </p>
              <p className="text-[11px] text-slate-400 mt-2">
                Câu hỏi này sẽ được loại bỏ khỏi danh sách nhập và không được lưu vào ngân hàng.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setQuestionToDelete(null)}
                className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuestions((prev) => prev.filter((item) => item.id !== questionToDelete.id));
                  setQuestionToDelete(null);
                }}
                className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-500/20 cursor-pointer"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
