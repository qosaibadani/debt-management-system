import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuthStore } from '../api/authStore';
import {
    UserPlus, Users as UsersIcon, Shield,
    Phone, User, Lock, Power, Trash2,
    CheckCircle2, XCircle, ShieldCheck, ShieldAlert
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Users = () => {
    const { user: currentUser } = useAuthStore();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        password: '',
        password_confirmation: '',
        role: 'employee'
    });

    const isOwner = currentUser?.role === 'owner';

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (error) {
            toast.error('فشل في تحميل قائمة الموظفين');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (user) => {
        if (!isOwner) return;
        try {
            await api.post(`/users/${user.id}/toggle-status`);
            toast.success(`تم ${user.is_active ? 'تعطيل' : 'تفعيل'} الحساب بنجاح`);
            fetchUsers();
        } catch (error) {
            toast.error('فشل في تغيير حالة الحساب');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users', formData);
            toast.success('تم إضافة الموظف بنجاح');
            setShowModal(false);
            setFormData({ name: '', phone: '', password: '', password_confirmation: '', role: 'employee' });
            fetchUsers();
        } catch (error) {
            const msg = error.response?.data?.message || 'فشل في إضافة الموظف';
            toast.error(msg);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* رأس الصفحة */}
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4 text-right w-full md:w-auto">
                    <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
                        <UsersIcon size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-800">إدارة الموظفين</h1>
                        <p className="text-sm font-bold text-gray-400">التحكم في صلاحيات الوصول للمتجر</p>
                    </div>
                </div>

                {isOwner && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 w-full md:w-auto justify-center"
                    >
                        <UserPlus size={20} />
                        إضافة موظف جديد
                    </button>
                )}
            </div>

            {/* قائمة الموظفين */}
            <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-5 text-sm font-black text-gray-500">الموظف</th>
                                <th className="px-8 py-5 text-sm font-black text-gray-500">كود المستخدم</th>
                                <th className="px-8 py-5 text-sm font-black text-gray-500">الصلاحية</th>
                                <th className="px-8 py-5 text-sm font-black text-gray-500">الحالة</th>
                                {isOwner && <th className="px-8 py-5 text-sm font-black text-gray-500 text-center">العمليات</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {users.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black">
                                                {u.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-gray-800">{u.name}</div>
                                                <div className="text-xs font-bold text-gray-400 flex items-center gap-1">
                                                    <Phone size={12} /> {u.phone}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold">
                                            {u.user_code}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className={`flex items-center gap-1 text-xs font-black ${u.role === 'owner' ? 'text-indigo-600' : 'text-amber-600'}`}>
                                            {u.role === 'owner' ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                                            {u.role === 'owner' ? 'صاحب المتجر' : 'موظف'}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-black ${u.is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                            }`}>
                                            {u.is_active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                            {u.is_active ? 'نشط' : 'معطل'}
                                        </span>
                                    </td>
                                    {isOwner && (
                                        <td className="px-8 py-5 text-center">
                                            {u.id !== currentUser.id && (
                                                <button
                                                    onClick={() => handleToggleStatus(u)}
                                                    className={`p-2 rounded-xl transition-all ${u.is_active ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'
                                                        }`}
                                                    title={u.is_active ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                                                >
                                                    <Power size={18} />
                                                </button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* مودال إضافة موظف */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-indigo-600 text-white">
                            <h3 className="text-xl font-black flex items-center gap-2">
                                <UserPlus size={24} /> إضافة موظف جديد
                            </h3>
                            <button onClick={() => setShowModal(false)} className="hover:rotate-90 transition-all">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-5 text-right">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">اسم الموظف</label>
                                <div className="relative">
                                    <User className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        required
                                        className="w-full pr-12 pl-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500"
                                        placeholder="أدخل الاسم الرباعي"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">رقم الهاتف (للدخول)</label>
                                <div className="relative">
                                    <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        required
                                        className="w-full pr-12 pl-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500"
                                        placeholder="05xxxxxxxx"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">كلمة المرور</label>
                                <div className="relative">
                                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="password"
                                        required
                                        className="w-full pr-12 pl-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">تأكيد كلمة المرور</label>
                                <div className="relative">
                                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="password"
                                        required
                                        className="w-full pr-12 pl-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500"
                                        placeholder="••••••••"
                                        value={formData.password_confirmation}
                                        onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                                >
                                    حفظ البيانات
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-2xl font-black hover:bg-gray-200 transition-all"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
