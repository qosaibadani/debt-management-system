import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuthStore } from '../api/authStore';
import {
    Settings as SettingsIcon, Store, Lock,
    Save, RefreshCw, Globe, ShieldCheck,
    KeyRound, UserCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Settings = () => {
    const { user, checkAuth } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [storeData, setStoreData] = useState({
        name: '',
        currency: 'SAR'
    });
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        password: '',
        password_confirmation: ''
    });

    const isOwner = user?.role === 'owner';

    useEffect(() => {
        if (user?.store) {
            setStoreData({
                name: user.store.name || '',
                currency: user.store.currency || 'SAR'
            });
        }
    }, [user]);

    const handleUpdateStore = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put('/settings/store', storeData);
            toast.success('تم تحديث إعدادات المتجر بنجاح');
            await checkAuth(); // تحديث بيانات المستخدم والمتجر في الـ Store
        } catch (error) {
            toast.error(error.response?.data?.message || 'فشل في تحديث إعدادات المتجر');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put('/settings/password', passwordData);
            toast.success('تم تغيير كلمة المرور بنجاح');
            setPasswordData({ current_password: '', password: '', password_confirmation: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'فشل في تغيير كلمة المرور');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* رأس الصفحة */}
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex items-center gap-6">
                <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
                    <SettingsIcon size={28} />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-gray-800">إعدادات النظام</h1>
                    <p className="text-sm font-bold text-gray-400">تخصيص المتجر وإدارة الحساب الشخصي</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* قسم إعدادات المتجر - خاص بالمالك */}
                {isOwner && (
                    <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden h-full">
                        <div className="p-8 border-b border-gray-50 bg-indigo-50/30 flex items-center gap-3">
                            <Store className="text-indigo-600" size={24} />
                            <h3 className="text-xl font-black text-gray-800">بيانات المتجر</h3>
                        </div>

                        <form onSubmit={handleUpdateStore} className="p-8 space-y-6 text-right">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">اسم المتجر</label>
                                <div className="relative">
                                    <Store className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        required
                                        className="w-full pr-12 pl-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                                        value={storeData.name}
                                        onChange={(e) => setStoreData({ ...storeData, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">عملة النظام</label>
                                <div className="relative">
                                    <Globe className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <select
                                        className="w-full pr-12 pl-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer transition-all"
                                        value={storeData.currency}
                                        onChange={(e) => setStoreData({ ...storeData, currency: e.target.value })}
                                    >
                                        <option value="SAR">ريال سعودي (SAR)</option>
                                        <option value="YER">ريال يمني (YER)</option>
                                        <option value="USD">دولار أمريكي (USD)</option>
                                        <option value="EGP">جنيه مصري (EGP)</option>
                                    </select>
                                </div>
                                <p className="mt-2 text-[10px] text-gray-400 font-bold leading-relaxed">
                                    * سيتم استخدام هذه العملة في كافة التقارير وكشوفات الحساب.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
                                حفظ إعدادات المتجر
                            </button>
                        </form>
                    </div>
                )}

                {/* قسم تغيير كلمة المرور - للجميع */}
                <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden h-full">
                    <div className="p-8 border-b border-gray-50 bg-amber-50/30 flex items-center gap-3">
                        <Lock className="text-amber-600" size={24} />
                        <h3 className="text-xl font-black text-gray-800">أمان الحساب</h3>
                    </div>

                    <form onSubmit={handleUpdatePassword} className="p-8 space-y-6 text-right">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">كلمة المرور الحالية</label>
                            <div className="relative">
                                <KeyRound className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="password"
                                    required
                                    className="w-full pr-12 pl-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-amber-500 transition-all"
                                    placeholder="••••••••"
                                    value={passwordData.current_password}
                                    onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">كلمة المرور الجديدة</label>
                            <div className="relative">
                                <ShieldCheck className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="password"
                                    required
                                    className="w-full pr-12 pl-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-amber-500 transition-all"
                                    placeholder="••••••••"
                                    value={passwordData.password}
                                    onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">تأكيد كلمة المرور</label>
                            <div className="relative">
                                <ShieldCheck className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="password"
                                    required
                                    className="w-full pr-12 pl-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-amber-500 transition-all"
                                    placeholder="••••••••"
                                    value={passwordData.password_confirmation}
                                    onChange={(e) => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <RefreshCw className="animate-spin" size={20} /> : <Lock size={20} />}
                            تحديث كلمة المرور
                        </button>
                    </form>
                </div>
            </div>

            {/* معلومات المستخدم الحالي */}
            <div className="bg-gray-50 p-6 rounded-[24px] border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                        <UserCircle size={32} />
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-black text-gray-800">{user?.name}</p>
                        <p className="text-[10px] font-bold text-gray-400">كود المستخدم: {user?.user_code} | الصلاحية: {user?.role === 'owner' ? 'صاحب المتجر' : 'موظف'}</p>
                    </div>
                </div>
                <div className="hidden md:block">
                    <span className="px-4 py-2 bg-green-50 text-green-600 rounded-xl text-xs font-black flex items-center gap-2">
                        <ShieldCheck size={16} /> نظام محمي ومشفر
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Settings;
