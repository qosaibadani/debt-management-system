import { create } from 'zustand';
import api from './axios';
import axios from 'axios'; // نحتاج أكسيوس الخام لطلبات الحماية خارج الـ API

// تصدير مسمى (Named Export)
export const useAuthStore = create((set) => ({
  user: null,
  isInitialized: false,

  // وظيفة لتحديث المستخدم يدوياً
  setUser: (userData) => set({ user: userData, isInitialized: true }),

  // التحقق من الجلسة عند تحميل الصفحة
  checkAuth: async () => {
    try {
      const response = await api.get('/auth/me');
      // التعامل مع بنية البيانات الراجعة (user object)
      const userData = response.data.user || response.data;
      set({ user: userData, isInitialized: true });
    } catch (error) {
      set({ user: null, isInitialized: true });
    }
  },

  // وظيفة تسجيل الدخول (تمت إضافتها وحل مشكلة CSRF)
  login: async (credentials) => {
    try {
      // 1. طلب كوكيز الحماية من المسار الرئيسي (خارج /api)
      // نستخدم الرابط المباشر لضمان وصول الكوكيز للمتصفح بشكل صحيح
      await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
        withCredentials: true
      });

      // 2. إرسال بيانات الدخول للـ API
      const response = await api.post('/auth/login', credentials);

      // 3. تحديث حالة المستخدم في النظام
      const userData = response.data.user || response.data;
      set({ user: userData });

      return response.data;
    } catch (error) {
      // تمرير الخطأ ليتم معالجته في صفحة Login.jsx
      throw error;
    }
  },

  // وظيفة تسجيل الخروج
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      set({ user: null });
      // توجيه المستخدم لصفحة الدخول
      window.location.href = '/login';
    }
  },
}));

// تصدير افتراضي (Default Export) لضمان توافق الملفات مثل Layout.jsx و App.jsx
export default useAuthStore;
