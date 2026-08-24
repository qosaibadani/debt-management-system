import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import {
    Printer, ArrowRight, Calendar, FileText,
    TrendingUp, TrendingDown, Wallet, Clock
} from 'lucide-react';

const CustomerStatement = () => {
    const { businessCode } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCustomerData = useCallback(async () => {
        try {
            const response = await api.get(`/customers/${businessCode}`);
            // السيرفر الآن يرسل العميل ومعه سجل العمليات ledger_entries
            const data = response.data;

            setCustomer(data);
            // ربط سجل العمليات المالي بالجدول
            setTransactions(data.ledger_entries || []);

        } catch (error) {
            toast.error('فشل في تحميل بيانات كشف الحساب');
            navigate('/customers');
        } finally {
            setLoading(false);
        }
    }, [businessCode, navigate]);

    useEffect(() => {
        fetchCustomerData();
    }, [fetchCustomerData]);

    const formatNumber = (num) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(num || 0);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* رأس الصفحة */}
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-6 text-right">
                    <button
                        onClick={() => navigate('/customers')}
                        className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 transition-all"
                    >
                        <ArrowRight size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-gray-800 mb-2">{customer?.name}</h1>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 font-bold">
                            <span className="flex items-center gap-1"><FileText size={16} /> كود: {customer?.business_code}</span>
                            <span className="flex items-center gap-1"><Calendar size={16} /> انضم في: {new Date(customer?.created_at).toLocaleDateString('ar-SA')}</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
                >
                    <Printer size={20} />
                    طباعة الكشف
                </button>
            </div>

            {/* ملخص الأرصدة */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex items-center gap-6">
                    <div className="p-4 bg-red-50 text-red-600 rounded-2xl"><TrendingUp size={32} /></div>
                    <div className="text-right">
                        <p className="text-sm font-bold text-gray-400 mb-1">إجمالي الديون</p>
                        <p className="text-2xl font-black text-gray-800">{formatNumber(customer?.total_debts)} <span className="text-xs">ر.س</span></p>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex items-center gap-6">
                    <div className="p-4 bg-green-50 text-green-600 rounded-2xl"><TrendingDown size={32} /></div>
                    <div className="text-right">
                        <p className="text-sm font-bold text-gray-400 mb-1">إجمالي المسدد</p>
                        <p className="text-2xl font-black text-gray-800">{formatNumber(customer?.total_paid)} <span className="text-xs">ر.س</span></p>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[32px] shadow-sm border-indigo-100 border-2 flex items-center gap-6 relative overflow-hidden">
                    <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100"><Wallet size={32} /></div>
                    <div className="text-right z-10">
                        <p className="text-sm font-bold text-indigo-400 mb-1">الرصيد المتبقي</p>
                        <p className="text-2xl font-black text-indigo-600">{formatNumber(customer?.current_balance)} <span className="text-xs">ر.س</span></p>
                    </div>
                    <div className="absolute -bottom-4 -left-4 text-indigo-50 opacity-[0.03] rotate-12"><Wallet size={120} /></div>
                </div>
            </div>

            {/* جدول العمليات */}
            <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                    <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
                        <Clock className="text-indigo-600" size={24} />
                        سجل العمليات المالي
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-5 text-sm font-black text-gray-500">التاريخ</th>
                                <th className="px-8 py-5 text-sm font-black text-gray-500">النوع</th>
                                <th className="px-8 py-5 text-sm font-black text-gray-500 text-center">المبلغ</th>
                                <th className="px-8 py-5 text-sm font-black text-gray-500 text-center">الرصيد بعد العملية</th>
                                <th className="px-8 py-5 text-sm font-black text-gray-500">البيان / الملاحظات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {transactions.length > 0 ? transactions.map((trans) => (
                                <tr key={trans.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="text-sm font-bold text-gray-700">{formatDate(trans.created_at)}</div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`px-3 py-1 rounded-lg text-xs font-black ${trans.type === 'debt'
                                                ? 'bg-red-50 text-red-600'
                                                : 'bg-green-50 text-green-600'
                                            }`}>
                                            {trans.type === 'debt' ? 'دين (+)' : 'سداد (-)'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <span className={`font-black ${trans.type === 'debt' ? 'text-red-600' : 'text-green-600'}`}>
                                            {formatNumber(trans.amount)}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-center font-bold text-gray-600 bg-gray-50/30">
                                        {formatNumber(trans.running_balance)}
                                    </td>
                                    <td className="px-8 py-5 text-sm text-gray-500 font-medium max-w-xs truncate">
                                        {trans.description || '-'}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center text-gray-400 italic font-bold">
                                        لا توجد عمليات مسجلة لهذا العميل حتى الآن.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CustomerStatement;
