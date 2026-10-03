import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  FileUp, 
  Sparkles,
  Layers,
  HelpCircle
} from 'lucide-react';
import { Question, QuestionType, AnswerDetectionMethod } from '../types/quiz';
import { QuestionEditor } from './QuestionEditor';

interface QuestionBankProps {
  questions: Question[];
  onAddQuestion: (q: Partial<Question>) => Promise<void>;
  onUpdateQuestion: (id: string, q: Partial<Question>) => Promise<void>;
  onDeleteQuestion: (id: string) => Promise<void>;
  onClearAll: () => Promise<void>;
  onNavigateToUpload: () => void;
}

export const QuestionBank: React.FC<QuestionBankProps> = ({
  questions,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onClearAll,
  onNavigateToUpload,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | QuestionType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'needs_review'>('all');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Counts
  const total = questions.length;
  const mcCount = questions.filter((q) => q.type === 'multiple_choice').length;
  const tfCount = questions.filter((q) => q.type === 'true_false').length;
  const needsReviewCount = questions.filter((q) => q.verificationStatus === 'needs_review').length;

  const filtered = questions.filter((q) => {
    const matchSearch =
      q.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.options && Object.values(q.options).some((v) => v.toLowerCase().includes(searchTerm.toLowerCase()))) ||
      (q.statements && Object.values(q.statements).some((v) => v.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchType = typeFilter === 'all' || q.type === typeFilter;
    const matchStatus = statusFilter === 'all' || q.verificationStatus === statusFilter;

    return matchSearch && matchType && matchStatus;
  });

  const getMethodBadge = (method: AnswerDetectionMethod) => {
    switch (method) {
      case 'red_text':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
            Chữ đỏ
          </span>
        );
      case 'underline':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            Gạch chân
          </span>
        );
      case 'explicit_answer':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Ghi rõ
          </span>
        );
      case 'admin_confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Admin duyệt
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-600" />
            <span>Ngân Hàng Câu Hỏi</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              {total} câu
            </span>
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Quản lý, tìm kiếm, chỉnh sửa và chuẩn bị câu hỏi cho đề kiểm tra
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onNavigateToUpload}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all cursor-pointer"
          >
            <FileUp className="w-4 h-4 text-slate-600" />
            <span>Tải Thêm Từ File</span>
          </button>

          <button
            onClick={() => {
              setEditingQuestion(null);
              setIsEditorOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Câu Hỏi</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <div className="text-xs text-slate-600 font-medium">Tổng câu hỏi</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">{total}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <div className="text-xs text-indigo-600 font-medium">Trắc nghiệm nhiều lựa chọn</div>
          <div className="text-2xl font-bold text-indigo-600 mt-1">{mcCount}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <div className="text-xs text-purple-600 font-medium">Câu hỏi Đúng/Sai</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">{tfCount}</div>
        </div>
        <div className={`p-4 rounded-xl border shadow-sm text-center ${
          needsReviewCount > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'
        }`}>
          <div className={`text-xs font-medium ${needsReviewCount > 0 ? 'text-amber-800 font-bold' : 'text-slate-600'}`}>
            Cần kiểm tra
          </div>
          <div className={`text-2xl font-bold mt-1 ${needsReviewCount > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
            {needsReviewCount}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm nội dung câu hỏi, từ khóa, đáp án..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none text-slate-800"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">Tất cả loại câu</option>
              <option value="multiple_choice">Nhiều lựa chọn (A,B,C,D)</option>
              <option value="true_false">Đúng / Sai</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="verified">Đã xác định</option>
              <option value="needs_review">Cần kiểm tra</option>
            </select>

            {questions.length > 0 && (
              <button
                type="button"
                onClick={() => setShowClearAllModal(true)}
                className="px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-all border border-red-200 cursor-pointer"
                title="Xóa toàn bộ ngân hàng câu hỏi"
              >
                Xóa tất cả
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Questions list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
          <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-700">Chưa có câu hỏi phù hợp</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
              ? 'Không tìm thấy câu hỏi với bộ lọc hiện tại. Vui lòng thử xóa từ khóa tìm kiếm.'
              : 'Ngân hàng câu hỏi hiện đang trống. Thầy/Cô có thể tải lên file DOCX hoặc thêm thủ công.'}
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={onNavigateToUpload}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-all cursor-pointer"
            >
              Tải file đề thi (.docx / .xlsx)
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((q, idx) => (
            <div
              key={q.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-indigo-200 transition-all shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    {q.type === 'multiple_choice' ? 'Nhiều lựa chọn' : 'Đúng/Sai'}
                  </span>
                  {getMethodBadge(q.answerDetectionMethod)}
                  {q.verificationStatus === 'needs_review' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      <AlertTriangle className="w-3 h-3" /> Cần kiểm tra
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> Đã xác định
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 self-end sm:self-auto">
                  <button
                    onClick={() => {
                      setEditingQuestion(q);
                      setIsEditorOpen(true);
                    }}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                    title="Chỉnh sửa câu hỏi"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuestionToDelete(q)}
                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Xóa câu hỏi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="text-xs font-semibold text-slate-800 mb-3 whitespace-pre-line leading-relaxed">
                {q.content}
              </div>

              {/* Multiple Choice Preview */}
              {q.type === 'multiple_choice' && q.options && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {(['A', 'B', 'C', 'D'] as const).map((key) => {
                    const text = q.options![key];
                    if (!text && text !== '') return null;
                    const isRight = q.correctAnswer === key;
                    return (
                      <div
                        key={key}
                        className={`p-2 rounded-lg border flex items-center justify-between ${
                          isRight
                            ? 'bg-emerald-50/80 border-emerald-300 font-semibold text-emerald-950'
                            : 'bg-slate-50/60 border-slate-100 text-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-5 h-5 rounded text-[11px] font-bold flex items-center justify-center ${
                              isRight
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {key}
                          </span>
                          <span>{text}</span>
                        </div>
                        {isRight && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                            Đáp án đúng
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* True/False Preview */}
              {q.type === 'true_false' && q.statements && (
                <div className="space-y-1.5 text-xs">
                  {(['a', 'b', 'c', 'd'] as const).map((key) => {
                    const stmt = q.statements![key];
                    if (!stmt) return null;
                    const isTrue = q.statementAnswers?.[key];
                    return (
                      <div
                        key={key}
                        className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <span className="font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded text-[11px]">
                            {key}.
                          </span>
                          <span className="text-slate-700">{stmt}</span>
                        </div>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                            isTrue
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {isTrue ? 'Đúng' : 'Sai'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      <QuestionEditor
        isOpen={isEditorOpen}
        initialQuestion={editingQuestion}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingQuestion(null);
        }}
        onSave={async (payload) => {
          if (editingQuestion) {
            await onUpdateQuestion(editingQuestion.id, payload);
          } else {
            await onAddQuestion(payload);
          }
        }}
        onDelete={async (id) => {
          await onDeleteQuestion(id);
          setIsEditorOpen(false);
          setEditingQuestion(null);
        }}
      />

      {/* Delete Single Question Modal (In-app, no window.confirm) */}
      {questionToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Xóa câu hỏi khỏi ngân hàng?</h3>
              <p className="text-xs text-slate-500 mt-2 line-clamp-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-left">
                {questionToDelete.content}
              </p>
              <p className="text-[11px] text-slate-400 mt-2">
                Hành động này sẽ xóa vĩnh viễn câu hỏi khỏi ngân hàng đề thi.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setQuestionToDelete(null)}
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
                    await onDeleteQuestion(questionToDelete.id);
                    setQuestionToDelete(null);
                  } catch (err: any) {
                    alert(err.message || 'Lỗi khi xóa câu hỏi');
                  } finally {
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

      {/* Clear All Questions Modal */}
      {showClearAllModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Xóa TOÀN BỘ ngân hàng câu hỏi?</h3>
              <p className="text-xs text-red-600 font-medium mt-2 bg-red-50 p-3 rounded-xl border border-red-100">
                Cảnh báo: Bạn đang chuẩn bị xóa tất cả {total} câu hỏi trong hệ thống. Hành động này không thể hoàn tác!
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setShowClearAllModal(false)}
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
                    await onClearAll();
                    setShowClearAllModal(false);
                  } catch (err: any) {
                    alert(err.message || 'Lỗi khi xóa ngân hàng');
                  } finally {
                    setDeleting(false);
                  }
                }}
                className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-500/20 cursor-pointer disabled:opacity-50"
              >
                {deleting ? 'Đang xóa...' : 'Xóa tất cả'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
