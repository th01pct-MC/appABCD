import React, { useState } from 'react';
import { 
  Search, 
  Download, 
  Eye, 
  Trash2, 
  GraduationCap, 
  Calendar, 
  Clock, 
  FileSpreadsheet, 
  HelpCircle,
  ShieldAlert
} from 'lucide-react';
import { QuizAttempt, Quiz } from '../types/quiz';
import { AdminResultDetail } from './AdminResultDetail';

interface QuizResultsProps {
  attempts: QuizAttempt[];
  quizzes: Quiz[];
  onDeleteAttempt: (id: string) => Promise<void>;
  onRefresh: () => void;
}

export const QuizResults: React.FC<QuizResultsProps> = ({
  attempts,
  quizzes,
  onDeleteAttempt,
  onRefresh,
}) => {
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [quizFilter, setQuizFilter] = useState('all');
  const [attemptToDelete, setAttemptToDelete] = useState<QuizAttempt | null>(null);
  const [deletingAttempt, setDeletingAttempt] = useState(false);

  // If viewing detail
  if (selectedAttemptId) {
    return (
      <AdminResultDetail
        attemptId={selectedAttemptId}
        onBack={() => setSelectedAttemptId(null)}
        onDeleted={() => {
          setSelectedAttemptId(null);
          onRefresh();
        }}
      />
    );
  }

  // Get distinct classes
  const distinctClasses = Array.from(
    new Set(attempts.map((a) => a.studentClass.trim()).filter(Boolean))
  ).sort();

  // Filtered list
  const filtered = attempts
    .filter((a) => a.isSubmitted)
    .filter((a) => {
      const matchSearch =
        a.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.studentClass.toLowerCase().includes(searchTerm.toLowerCase());
      const matchClass = classFilter === 'all' || a.studentClass.trim() === classFilter;
      const matchQuiz = quizFilter === 'all' || a.quizId === quizFilter;
      return matchSearch && matchClass && matchQuiz;
    });

  // Summary calculations
  const totalSubmissions = filtered.length;
  const avgScore = totalSubmissions > 0
    ? (filtered.reduce((sum, a) => sum + (a.score || 0), 0) / totalSubmissions).toFixed(2)
    : '0.00';

  const downloadCsv = () => {
    window.open('/api/export/results', '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-indigo-600" />
            <span>Kết Quả Kiểm Tra Của Học Sinh</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              {totalSubmissions} bài nộp
            </span>
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Theo dõi điểm số, thời gian làm bài và chi tiết bài thi theo thời gian thực
          </p>
        </div>

        <button
          onClick={downloadCsv}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Xuất Báo Cáo CSV / Excel</span>
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <div className="text-xs text-slate-600 font-medium">Tổng số bài nộp</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">{totalSubmissions}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <div className="text-xs text-indigo-600 font-medium">Điểm trung bình</div>
          <div className="text-2xl font-bold text-indigo-600 mt-1">{avgScore} / 10</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <div className="text-xs text-emerald-600 font-medium">Điểm cao nhất</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {totalSubmissions > 0
              ? Math.max(...filtered.map((a) => a.score || 0)).toFixed(2)
              : '0.00'}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <div className="text-xs text-slate-600 font-medium">Số lớp đã thi</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">{distinctClasses.length}</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên học sinh hoặc lớp..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none text-slate-800"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">Tất cả các lớp</option>
              {distinctClasses.map((cls) => (
                <option key={cls} value={cls}>
                  Lớp {cls}
                </option>
              ))}
            </select>

            <select
              value={quizFilter}
              onChange={(e) => setQuizFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">Tất cả bài kiểm tra</option>
              {quizzes.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.title} ({q.id})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table as requested in Section 26 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-700">Chưa có bài thi nào được nộp</h4>
            <p className="text-xs text-slate-500 mt-1">
              Khi học sinh hoàn thành bài làm và nộp bài, kết quả sẽ tự động hiển thị tại đây.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="py-3 px-4">STT</th>
                  <th className="py-3 px-4">Họ và tên</th>
                  <th className="py-3 px-4">Lớp</th>
                  <th className="py-3 px-4">Bài kiểm tra</th>
                  <th className="py-3 px-4 text-center">Điểm</th>
                  <th className="py-3 px-4 text-center">Đúng</th>
                  <th className="py-3 px-4 text-center">Sai</th>
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4">Nộp lúc</th>
                  <th className="py-3 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((att, idx) => {
                  const duration = att.timeSpentSeconds
                    ? `${Math.floor(att.timeSpentSeconds / 60)}p ${att.timeSpentSeconds % 60}s`
                    : '--';

                  const scoreClass =
                    (att.score || 0) >= 8.0
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      : (att.score || 0) >= 5.0
                      ? 'text-indigo-700 bg-indigo-50 border-indigo-200'
                      : 'text-red-700 bg-red-50 border-red-200';

                  return (
                    <tr
                      key={att.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-3.5 px-4 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        <div className="flex items-center gap-2">
                          <span>{att.studentName}</span>
                          {att.tabSwitchCount > 0 && (
                            <span
                              className="inline-flex items-center text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200"
                              title={`Chuyển tab ${att.tabSwitchCount} lần`}
                            >
                              <ShieldAlert className="w-3 h-3 mr-0.5" />
                              {att.tabSwitchCount}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-600">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {att.studentClass}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate" title={att.quizTitle}>
                        {att.quizTitle}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-xs border ${scoreClass}`}
                        >
                          {att.score?.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-emerald-600 font-bold">
                        {att.numCorrect}
                      </td>
                      <td className="py-3.5 px-4 text-center text-red-500 font-bold">
                        {att.numIncorrect}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{duration}</td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {new Date(att.submittedAt || '').toLocaleString('vi-VN')}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedAttemptId(att.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px] transition-all cursor-pointer"
                            title="Xem chi tiết bài làm của học sinh"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Xem bài</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setAttemptToDelete(att)}
                            className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Xóa bài làm"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Attempt Modal (In-app, no window.confirm) */}
      {attemptToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Xóa kết quả bài làm?</h3>
              <p className="text-xs text-slate-700 font-semibold mt-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                {attemptToDelete.studentName} &bull; Lớp {attemptToDelete.studentClass} &bull; Điểm: {attemptToDelete.score?.toFixed(2)}
              </p>
              <p className="text-[11px] text-slate-400 mt-2">
                Bài thi của học sinh này sẽ bị xóa khỏi bảng kết quả.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={deletingAttempt}
                onClick={() => setAttemptToDelete(null)}
                className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={deletingAttempt}
                onClick={async () => {
                  setDeletingAttempt(true);
                  try {
                    await onDeleteAttempt(attemptToDelete.id);
                    setAttemptToDelete(null);
                    onRefresh();
                  } catch (err: any) {
                    alert(err.message || 'Lỗi khi xóa bài làm');
                  } finally {
                    setDeletingAttempt(false);
                  }
                }}
                className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-500/20 cursor-pointer disabled:opacity-50"
              >
                {deletingAttempt ? 'Đang xóa...' : 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
