import React, { useState } from 'react';
import { ShieldCheck, Mail, AlertCircle, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: (email: string) => void;
  teacherEmail: string;
  teacherName: string;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLoginSuccess,
  teacherEmail,
  teacherName,
}) => {
  const [emailInput, setEmailInput] = useState(teacherEmail);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (selectedEmail?: string) => {
    const emailToVerify = (selectedEmail || emailInput).trim().toLowerCase();
    setLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      setLoading(false);
      if (emailToVerify === teacherEmail.toLowerCase()) {
        onLoginSuccess(emailToVerify);
      } else {
        setErrorMessage('Bạn không có quyền truy cập trang quản trị. Chỉ email quản trị viên mới được phép đăng nhập.');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30 text-white">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Đăng Nhập Quản Trị Viên</h1>
          <p className="text-sm text-slate-600 mt-1">
            Hệ thống kiểm tra & chấm điểm trắc nghiệm thông minh
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100">
            Giáo viên: {teacherName}
          </div>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3 animate-shake">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
            <div>
              <p className="font-semibold">Truy cập bị từ chối</p>
              <p className="text-xs text-red-600 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* Direct Google Sign-In with Authorized Teacher Email */}
          <button
            onClick={() => handleLogin(teacherEmail)}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm shadow-sm transition-all hover:border-slate-400 group cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Đăng nhập với Google ({teacherEmail})</span>
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-xs font-medium text-slate-600 uppercase">Hoặc kiểm tra quyền email</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Quản Trị Viên
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Nhập email quản trị..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-800"
              />
            </div>
          </div>

          <button
            onClick={() => handleLogin()}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl text-sm shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {loading ? (
              <span className="inline-block animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <>
                <span>Xác Nhận Đăng Nhập</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Informational test badge */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <div className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
            <Lock className="w-3.5 h-3.5 text-slate-600" />
            Email hợp lệ duy nhất: <strong className="text-slate-700">{teacherEmail}</strong>
          </div>
          <div className="mt-2 flex justify-center gap-2">
            <button
              onClick={() => {
                setEmailInput('th01pct@gmail.com');
                handleLogin('th01pct@gmail.com');
              }}
              className="text-[11px] text-indigo-600 hover:text-indigo-800 underline font-medium cursor-pointer"
            >
              [Thử: th01pct@gmail.com]
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => {
                setEmailInput('hocsinh@gmail.com');
                handleLogin('hocsinh@gmail.com');
              }}
              className="text-[11px] text-red-500 hover:text-red-700 underline font-medium cursor-pointer"
            >
              [Thử email khác để xem báo lỗi từ chối]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
