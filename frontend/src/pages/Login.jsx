import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../api/authStore';
import { toast } from 'react-hot-toast';
import { LogIn, ShieldCheck, User, Lock, ArrowLeft } from 'lucide-react';

const Login = () => {
  const [credentials, setCredentials] = useState({ login: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({
        login: credentials.login.trim(),
        password: credentials.password
      });
      toast.success('تم تسجيل الدخول بنجاح');
      navigate('/');
    } catch (error) {
      // إظهار الرسالة القادمة من AuthController.php
      const msg = error.response?.data?.message || 'بيانات الدخول غير صحيحة';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 font-['Cairo'] relative overflow-hidden" dir="rtl">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px] opacity-50"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-50"></div>

      <div className="w-full max-w-[1000px] grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[32px] shadow-2xl shadow-indigo-100 overflow-hidden relative z-10 border border-white">
        <div className="hidden lg:flex bg-indigo-600 p-12 text-white flex-col justify-between relative">
          <div className="relative z-10">
            <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center backdrop-blur-md mb-6 border border-white/30 shadow-xl">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-4xl font-black mb-4 leading-tight">نظام QNB
              لإدارة الديون</h1>
            <p className="text-indigo-100 text-lg leading-relaxed max-w-md">إدارة مالية ذكية، دقيقة، وآمنة لمتجرك.</p>
          </div>
        </div>

        <div className="p-8 lg:p-16 flex flex-col justify-center bg-white">
          <div className="mb-10 text-center lg:text-right">
            <h2 className="text-3xl font-black text-indigo-900 mb-2">تسجيل الدخول</h2>
            <p className="text-gray-500">أدخل رقم الهاتف أو البريد الإلكتروني</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 block mr-1">رقم الهاتف أو البريد</label>
              <div className="relative group">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                  <User size={20} />
                </div>
                <input
                  type="text" required
                  className="w-full pr-12 pl-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all font-bold text-gray-800 text-right"
                  placeholder="7XXXXXXXX"
                  value={credentials.login}
                  onChange={(e) => setCredentials({ ...credentials, login: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 block mr-1">كلمة المرور</label>
              <div className="relative group">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type="password" required
                  className="w-full pr-12 pl-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all font-bold text-gray-800 text-right"
                  placeholder="••••••••"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {loading ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> : <><LogIn size={22} /> دخول للنظام</>}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-gray-50 text-center">
            <button onClick={() => navigate('/setup')} className="text-indigo-600 font-black hover:underline flex items-center gap-2 justify-center w-full group">
              إنشاء متجر جديد <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
