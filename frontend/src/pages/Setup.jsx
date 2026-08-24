import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../api/axios';
import { useAuthStore } from '../api/authStore';
import { toast } from 'react-hot-toast';

const Setup = () => {
  const [form, setForm] = useState({
    storeName: '',
    name: '',
    phone: '',
    password: '',
    password_confirmation: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.password_confirmation) {
      toast.error('كلمتا المرور غير متطابقتين');
      return;
    }

    setLoading(true);
    try {
      // 1. تهيئة حماية CSRF من الرابط الأساسي
      await axios.get('http://127.0.0.1:8000/sanctum/csrf-cookie', {
        withCredentials: true
      });

      // 2. إرسال بيانات التسجيل
      const response = await api.post('/setup/first-user', form);

      // 3. تحديث حالة المستخدم في الـ Store فوراً
      const userData = response.data.user || response.data.data;
      if (userData) {
        setUser(userData);
        toast.success('تم إنشاء المتجر والحساب بنجاح');

        // 4. التوجه للوحة التحكم مباشرة بدون F5
        navigate('/', { replace: true });
      }
    } catch (err) {
      console.error('Setup Error:', err);
      const errors = err.response?.data?.errors;
      if (errors) {
        Object.values(errors).flat().forEach((msg) => toast.error(msg));
      } else {
        toast.error(err.response?.data?.message || 'حدث خطأ أثناء الإعداد، حاول مرة أخرى');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full p-3 border-2 border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-right bg-gray-50";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-['Cairo'] p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border-t-8 border-blue-600">
        <h1 className="text-3xl font-black text-center text-gray-800 mb-2">أهلاً بك 👋</h1>
        <p className="text-sm text-gray-500 text-center mb-8 font-bold">
          أنشئ متجرك الجديد وابدأ إدارة ديونك باحترافية
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 mr-1">اسم المتجر</label>
            <input className={inputCls} value={form.storeName} onChange={set('storeName')} placeholder="مثال: متجر الأمل" required />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 mr-1">الاسم الكامل</label>
            <input className={inputCls} value={form.name} onChange={set('name')} placeholder="أدخل اسمك الثلاثي" required />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 mr-1">رقم الهاتف</label>
            <input className={inputCls} type="tel" value={form.phone} onChange={set('phone')} placeholder="77xxxxxxx" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 mr-1">كلمة المرور</label>
              <input className={inputCls} type="password" value={form.password} onChange={set('password')} placeholder="••••••" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 mr-1">تأكيد الكلمة</label>
              <input className={inputCls} type="password" value={form.password_confirmation} onChange={set('password_confirmation')} placeholder="••••••" required />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-black text-white text-lg transition-all duration-300 shadow-lg ${loading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:transform active:scale-95'
              }`}
          >
            {loading ? 'جاري إنشاء المتجر...' : 'إنشاء المتجر والبدء'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Setup;
