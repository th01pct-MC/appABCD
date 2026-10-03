import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  HelpCircle, 
  FileSpreadsheet, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { parseDocxFile, parseExcelOrCsvFile, parsePlainTextFile } from '../utils/fileParser';
import { generateSampleDocx, generateSampleExcel } from '../utils/sampleGenerator';
import { ParsedQuestionResult } from '../types/quiz';

interface QuestionUploaderProps {
  onParsedResult: (result: ParsedQuestionResult, fileName: string) => void;
}

export const QuestionUploader: React.FC<QuestionUploaderProps> = ({ onParsedResult }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcessFile = async (file: File) => {
    setError(null);
    setLoading(true);
    setCurrentFileName(file.name);

    try {
      const ext = file.name.split('.').pop()?.toLowerCase();
      let result: ParsedQuestionResult;

      if (ext === 'docx') {
        const buffer = await file.arrayBuffer();
        result = await parseDocxFile(buffer);
      } else if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
        const buffer = await file.arrayBuffer();
        result = await parseExcelOrCsvFile(buffer);
      } else if (ext === 'txt') {
        const text = await file.text();
        result = parsePlainTextFile(text);
      } else {
        throw new Error('Định dạng file không được hỗ trợ. Vui lòng tải lên file .DOCX, .XLSX, .CSV hoặc .TXT');
      }

      if (result.questions.length === 0) {
        throw new Error('Không nhận diện được câu hỏi nào từ file. Vui lòng kiểm tra định dạng hoặc tải file mẫu để xem cấu trúc chuẩn.');
      }

      onParsedResult(result, file.name);
    } catch (err: any) {
      console.error('File parsing error:', err);
      setError(err.message || 'Không thể xử lý file. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const downloadDocxSample = async () => {
    try {
      const blob = await generateSampleDocx();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'DeThi_Mau_ChuDo_GachChan.docx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  const downloadExcelSample = () => {
    try {
      const blob = generateSampleExcel();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'NganHangCauHoi_Mau.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <UploadCloud className="w-6 h-6 text-indigo-600" />
              Tải Lên File Ngân Hàng Câu Hỏi
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Hệ thống tự động phân tích định dạng <strong className="text-indigo-600">chữ màu đỏ</strong>, <strong className="text-indigo-600">gạch chân</strong> và nhãn đáp án để lưu vào ngân hàng.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={downloadDocxSample}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs border border-blue-200 transition-all cursor-pointer shadow-sm"
              title="Tải file DOCX mẫu có sẵn chữ đỏ và gạch chân"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>Tải File Mẫu DOCX</span>
            </button>
            <button
              onClick={downloadExcelSample}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs border border-emerald-200 transition-all cursor-pointer shadow-sm"
              title="Tải file Excel mẫu"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Tải File Mẫu Excel</span>
            </button>
          </div>
        </div>

        {/* Smart Recognition Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2 font-semibold text-xs text-slate-800 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
              Nhận diện chữ màu đỏ
            </div>
            <p className="text-xs text-slate-600">
              Phương án A, B, C, D có chữ màu đỏ (mã <code className="text-red-600 font-mono">#FF0000</code>, <code className="text-red-600 font-mono">#C00000</code>...) được chọn làm đáp án đúng.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2 font-semibold text-xs text-slate-800 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span>
              Nhận diện chữ gạch chân
            </div>
            <p className="text-xs text-slate-600">
              Phương án được gạch chân (<u className="decoration-indigo-600">underline</u>) tự động nhận diện thành đáp án chính xác.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2 font-semibold text-xs text-slate-800 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
              Phát hiện mâu thuẫn & Cần kiểm tra
            </div>
            <p className="text-xs text-slate-600">
              Nếu "Đáp án: B" nhưng C lại tô đỏ, hệ thống sẽ gắn nhãn <strong>Cần kiểm tra</strong> để Admin duyệt, tuyệt đối không đoán mò.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer bg-white ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]'
            : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50/60'
        } ${loading ? 'pointer-events-none opacity-75' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".docx,.xlsx,.xls,.csv,.txt"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
            {loading ? (
              <span className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <UploadCloud className="w-8 h-8 animate-bounce-subtle" />
            )}
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-800">
              {loading ? 'Đang phân tích cấu trúc file & màu chữ...' : 'Kéo thả file câu hỏi vào đây hoặc bấm để chọn'}
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Hỗ trợ định dạng: <strong>.DOCX (Word)</strong>, <strong>.XLSX</strong>, <strong>.CSV</strong>, <strong>.TXT</strong>
            </p>
          </div>

          {!loading && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all">
              <span>Chọn file từ máy tính</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          )}

          {currentFileName && loading && (
            <div className="text-xs text-indigo-600 font-medium">
              Đang đọc thuộc tính định dạng của: <strong>{currentFileName}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
          <div className="flex-1">
            <p className="font-semibold">Không thể tải file</p>
            <p className="text-xs text-red-600 mt-0.5">{error}</p>
            <div className="mt-2">
              <button
                onClick={downloadDocxSample}
                className="text-xs font-semibold text-red-700 underline hover:text-red-900 cursor-pointer"
              >
                Nhấp vào đây để tải file mẫu chuẩn DOCX về xem thử
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
