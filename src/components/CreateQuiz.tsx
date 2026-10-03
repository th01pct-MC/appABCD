import React, { useState } from 'react';
import { 
  FileCheck2, 
  Clock, 
  Shuffle, 
  Eye, 
  ShieldAlert, 
  HelpCircle, 
  ArrowRight, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Quiz, Question } from '../types/quiz';

interface CreateQuizProps {
  questions: Question[];
  onCreateQuiz: (quiz: Partial<Quiz>) => Promise<Quiz>;
  onCreatedSuccess: (quiz: Quiz) => void;
}

export const CreateQuiz: React.FC<CreateQuizProps> = ({
  questions,
  onCreateQuiz,
  onCreatedSuccess,
}) => {
  const mcAvailable = questions.filter((q) => q.type === 'multiple_choice').length;
  const tfAvailable = questions.filter((q) => q.type === 'true_false').length;

  const [title, setTitle] = useState('Kiểm Tra 15 Phút - Khảo Sát Năng Lực');
  const [numMC, setNumMC] = useState(Math.min(5, mcAvailable));
  const [numTF, setNumTF] = useState(Math.min(2, tfAvailable));
  const [durationMinutes, setDurationMinutes] = useState(15);

  // Options
  const [randomQuestions, setRandomQuestions] = useState(true);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleOptions, setShuffleOptions] = useState(true);
  const [individualRandomTests, setIndividualRandomTests] = useState(true);
  const [autoSubmitOnTimeUp, setAutoSubmitOnTimeUp] = useState(true);
  const [showScoreAfterSubmit, setShowScoreAfterSubmit] = useState(true);
  const [showCorrectAnswersAfterSubmit, setShowCorrectAnswersAfterSubmit] = useState(false);
  const [warnTabSwitch, setWarnTabSwitch] = useState(true);
  const [trackTabSwitchCount, setTrackTabSwitchCount] = useState(true);
  const [oneSubmissionPerStudent, setOneSubmissionPerStudent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Vui lòng nhập tên bài kiểm tra');
      return;
    }

    if (numMC < 0 || numTF < 0 || numMC + numTF === 0) {
      setError('Tổng số câu hỏi phải lớn hơn 0');
      return;
    }

    if (numMC > mcAvailable) {
      setError(`Số lượng câu yêu cầu vượt quá ngân hàng (Bạn yêu cầu ${numMC} câu trắc nghiệm nhưng ngân hàng chỉ có ${mcAvailable} câu)`);
      return;
    }

    if (numTF > tfAvailable) {
      setError(`Số lượng câu yêu cầu vượt quá ngân hàng (Bạn yêu cầu ${numTF} câu Đúng/Sai nhưng ngân hàng chỉ có ${tfAvailable} câu)`);
      return;
    }

    if (durationMinutes <= 0) {
      setError('Thời gian làm bài phải lớn hơn 0 phút');
      return;
    }

    setLoading(true);
    try {
      const created = await onCreateQuiz({
        title: title.trim(),
        numMultipleChoice: Number(numMC),
        numTrueFalse: Number(numTF),
        durationMinutes: Number(durationMinutes),
        randomQuestions,
        shuffleQuestions,
        shuffleOptions,
        individualRandomTests,
        autoSubmitOnTimeUp,
        showScoreAfterSubmit,
        showCorrectAnswersAfterSubmit,
        warnTabSwitch,
        trackTabSwitchCount,
        oneSubmissionPerStudent,
      });

      onCreatedSuccess(created);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tạo bài kiểm tra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <FileCheck2 className="w-6 h-6 text-indigo-600" />
          <span>Tạo Bài Kiểm Tra Mới</span>
        </h2>
        <p className="text-xs text-slate-600 mt-1">
          Thiết lập đề thi, lấy ngẫu nhiên câu hỏi từ ngân hàng và cài đặt các quy tắc chống gian lận
        </p>

        {/* Bank Availability Bar */}
        <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-medium text-slate-700">
            <span>Ngân hàng hiện có:</span>
            <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
              {mcAvailable} câu trắc nghiệm
            </span>
            <span>&bull;</span>
            <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
              {tfAvailable} câu Đúng/Sai
            </span>
          </div>
          {mcAvailable + tfAvailable === 0 && (
            <span className="text-red-600 font-semibold">
              Ngân hàng đang trống! Vui lòng tải file câu hỏi trước.
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Tên bài kiểm tra <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ví dụ: Kiểm Tra 15 Phút Chương 1, Đề Khảo Sát Giữa Kỳ..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none text-slate-800"
          />
        </div>

        {/* Numbers Configuration */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Số câu nhiều lựa chọn
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max={mcAvailable}
                value={numMC}
                onChange={(e) => setNumMC(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-600">
                / {mcAvailable}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Số câu Đúng / Sai
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max={tfAvailable}
                value={numTF}
                onChange={(e) => setNumTF(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500 focus:bg-white focus:outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-600">
                / {tfAvailable}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Thời gian làm bài (Phút)
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="180"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Math.max(1, parseInt(e.target.value) || 15))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-600">
                phút
              </span>
            </div>
          </div>
        </div>

        {/* Quiz Options Checkboxes */}
        <div className="pt-4 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 mb-3">
            Tùy chọn đề thi & xáo trộn
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-white cursor-pointer transition-all">
              <input
                type="checkbox"
                checked={randomQuestions}
                onChange={(e) => setRandomQuestions(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <div>
                <span className="text-xs font-bold text-slate-800">Lấy câu ngẫu nhiên</span>
                <p className="text-[11px] text-slate-600">Chọn ngẫu nhiên từ ngân hàng câu hỏi mà không lấy trùng</p>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-white cursor-pointer transition-all">
              <input
                type="checkbox"
                checked={shuffleQuestions}
                onChange={(e) => setShuffleQuestions(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <div>
                <span className="text-xs font-bold text-slate-800">Đảo thứ tự câu</span>
                <p className="text-[11px] text-slate-600">Xáo trộn vị trí các câu hỏi trong đề</p>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-white cursor-pointer transition-all">
              <input
                type="checkbox"
                checked={shuffleOptions}
                onChange={(e) => setShuffleOptions(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <div>
                <span className="text-xs font-bold text-slate-800">Đảo A/B/C/D</span>
                <p className="text-[11px] text-slate-600">Xáo trộn vị trí các phương án lựa chọn</p>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-white cursor-pointer transition-all">
              <input
                type="checkbox"
                checked={individualRandomTests}
                onChange={(e) => setIndividualRandomTests(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <div>
                <span className="text-xs font-bold text-slate-800">Mỗi học sinh nhận đề khác nhau</span>
                <p className="text-[11px] text-slate-600">Hệ thống random đề riêng biệt ngay khi học sinh bắt đầu</p>
              </div>
            </label>
          </div>
        </div>

        {/* Security & Submission Rules */}
        <div className="pt-4 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 mb-3">
            Quy định nộp bài & Xem kết quả
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-white cursor-pointer transition-all">
              <input
                type="checkbox"
                checked={autoSubmitOnTimeUp}
                onChange={(e) => setAutoSubmitOnTimeUp(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <div>
                <span className="text-xs font-bold text-slate-800">Tự động nộp khi hết giờ</span>
                <p className="text-[11px] text-slate-600">Khóa bài và tự nộp ngay khi đồng hồ về 00:00</p>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-white cursor-pointer transition-all">
              <input
                type="checkbox"
                checked={showScoreAfterSubmit}
                onChange={(e) => setShowScoreAfterSubmit(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <div>
                <span className="text-xs font-bold text-slate-800">Cho học sinh xem điểm sau khi nộp</span>
                <p className="text-[11px] text-slate-600">Hiển thị điểm số thang 10 ngay khi hoàn thành</p>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-white cursor-pointer transition-all">
              <input
                type="checkbox"
                checked={showCorrectAnswersAfterSubmit}
                onChange={(e) => setShowCorrectAnswersAfterSubmit(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <div>
                <span className="text-xs font-bold text-slate-800">Cho học sinh xem đáp án đúng sau khi nộp</span>
                <p className="text-[11px] text-slate-600">Mặc định tắt để tránh lộ đề thi cho các lớp sau</p>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-white cursor-pointer transition-all">
              <input
                type="checkbox"
                checked={warnTabSwitch}
                onChange={(e) => setWarnTabSwitch(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <div>
                <span className="text-xs font-bold text-slate-800">Cảnh báo & ghi nhận khi rời tab</span>
                <p className="text-[11px] text-slate-600">Theo dõi số lần học sinh đổi tab / cửa sổ trong lúc thi</p>
              </div>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={loading || numMC + numTF === 0}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FileCheck2 className="w-4 h-4" />
            )}
            <span>TẠO BÀI KIỂM TRA</span>
          </button>
        </div>
      </form>
    </div>
  );
};
