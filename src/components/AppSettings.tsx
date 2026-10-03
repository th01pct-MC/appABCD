import React, { useState, useRef } from 'react';
import { 
  Sliders, 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  Save, 
  Check, 
  Mail, 
  School, 
  User, 
  ShieldCheck, 
  Sparkles,
  Send,
  AlertCircle
} from 'lucide-react';
import { AppSettings as IAppSettings } from '../types/quiz';
import { api } from '../services/api';

interface AppSettingsProps {
  settings: IAppSettings;
  onUpdateSettings: (newSettings: Partial<IAppSettings>) => Promise<void>;
}

export const AppSettings: React.FC<AppSettingsProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [formData, setFormData] = useState<IAppSettings>(settings);
  const [logoPreview, setLogoPreview] = useState<string>(settings.logoUrl || '');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
      alert('Vui lòng chọn file hình ảnh định dạng PNG, JPG, JPEG hoặc WEBP');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setLogoPreview(base64);
      setFormData((prev) => ({ ...prev, logoUrl: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoPreview('');
    setFormData((prev) => ({ ...prev, logoUrl: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      await onUpdateSettings(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu cài đặt');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    setTestingEmail(true);
    setEmailStatus(null);
    try {
      const res = await api.testEmailNotification();
      setEmailStatus(`✓ ${res.message}`);
    } catch (err: any) {
      setEmailStatus(`⚠ ${err.message}`);
    } finally {
      setTestingEmail(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Sliders className="w-6 h-6 text-indigo-600" />
          <span>Cài Đặt Hệ Thống & Logo Giáo Viên</span>
        </h2>
        <p className="text-xs text-slate-600 mt-1">
          Tùy chỉnh thông tin giáo viên, logo thương hiệu trường học và cấu hình thông báo kết quả qua email
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* LOGO & GIAO DIỆN (Section 28) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-indigo-600" />
                <span>Logo & Giao Diện Giáo Viên</span>
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Logo hiển thị nổi bật tại trang thông tin học sinh, trang làm bài thi và trang kết quả
              </p>
            </div>

            {logoPreview && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="text-xs text-red-600 hover:text-red-700 font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa logo</span>
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
            {/* Logo Preview box */}
            <div className="w-28 h-28 rounded-2xl bg-white border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden shadow-inner flex-shrink-0">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Logo Giáo viên"
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <div className="text-center p-2 text-slate-400">
                  <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                  <span className="text-[10px]">Chưa có logo</span>
                </div>
              )}
            </div>

            {/* Upload action */}
            <div className="flex-1 space-y-2 text-center sm:text-left">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleLogoFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-sm transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4 text-indigo-600" />
                <span>Tải Lên Logo Mới (PNG, JPG, WEBP)</span>
              </button>
              <p className="text-[11px] text-slate-500">
                Khuyến nghị: Ảnh nền trong suốt (PNG), kích thước tối thiểu 200x200px. Thay đổi sẽ có hiệu lực ngay lập tức cho tất cả học sinh.
              </p>
            </div>
          </div>
        </div>

        {/* TEACHER & SCHOOL PROFILE */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            <span>Thông Tin Giáo Viên Quản Trị</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Họ và tên Giáo viên
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={formData.teacherName}
                  onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                  placeholder="HÀ THỊ MINH CHÂU"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Tên Trường / Đơn vị
              </label>
              <div className="relative">
                <School className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={formData.schoolName}
                  onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                  placeholder="Trường THPT Chuyên"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>

        {/* EMAIL NOTIFICATIONS */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-600" />
              <span>Cấu Hình Nhận Email Kết Quả</span>
            </h3>

            <button
              type="button"
              onClick={handleTestEmail}
              disabled={testingEmail}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              {testingEmail ? (
                <span className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Gửi Email Thử Nghiệm</span>
            </button>
          </div>

          <p className="text-xs text-slate-600">
            Mỗi khi học sinh hoàn thành và nộp bài thi, hệ thống sẽ tự động tổng hợp điểm và gửi email báo cáo tới địa chỉ bên dưới.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Email nhận kết quả học sinh
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={formData.teacherEmail}
                  onChange={(e) => setFormData({ ...formData, teacherEmail: e.target.value })}
                  placeholder="th01pct@gmail.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none text-slate-800"
                />
              </div>
            </div>

            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={formData.emailNotificationsEnabled}
                onChange={(e) =>
                  setFormData({ ...formData, emailNotificationsEnabled: e.target.checked })
                }
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <span className="font-semibold text-slate-800">
                Bật tự động gửi email thông báo kết quả ngay khi học sinh nộp bài
              </span>
            </label>
          </div>

          {emailStatus && (
            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-800 font-medium">
              {emailStatus}
            </div>
          )}
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {saveSuccess && (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-bold animate-in fade-in">
              <Check className="w-4 h-4" />
              Đã lưu cài đặt thành công!
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>LƯU CÀI ĐẶT</span>
          </button>
        </div>
      </form>
    </div>
  );
};
