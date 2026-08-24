import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import {
    Search, Filter, TrendingUp, TrendingDown,
    Calendar, User, FileText, ArrowLeftRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/ledger');

            // تصحيح: التعامل مع المصفوفة المباشرة كما يرسلها السيرفر عندك
            const data = Array.isArray(response.data) ? response.data : (response.data.data || []);
            setTransactions(data);

        } catch (error) {
            toast.error('فشل في تحميل سجل العمليات');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    // تصفية البيانات محلياً لضمان السرعة وعدم الاعتماد على دعم السيرفر للبحث حالياً
    const filteredTransactions = transactions.filter(trans => {
        const matchesSearch =
            trans.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            trans.customer?.business_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            trans.description?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = filterType === 'all' || trans.type === filterType;

        return matchesSearch && matchesType;
    });

    const formatNumber = (num) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(num || 0);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* رأس الصفحة والبحث */}
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4 text-right w-full md:w-auto">
                        <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
                            <ArrowLeftRight size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-gray-800">سجل العمليات المالي</h1>
                            <p className="text-sm font-bold text-gray-400">مراقبة كافة حركات الديون والسداد</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="بحث باسم العميل..."
                                className="w-full pr-12 pl-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all text-right"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="relative">
                            <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <select
                                className="pr-12 pl-8 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer transition-all text-right"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option value="all">كل العمليات</option>
                                <option value="debt">الديون فقط (+)</option>
                                <option value="payment">السداد فقط (-)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* جدول العمليات */}
            <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-5 text-sm font-black text-gray-500">العميل</th>
                                <th className="px-8 py-5 text-sm font-black text-gray-500">التاريخ</th>
                                <th className="px-8 py-5 text-sm font-black text-gray-500">النوع</th>
                                <th className="px-8 py-5 text-sm font-black text-gray-500 text-center">المبلغ</th>
                                <th className="px-8 py-5 text-sm font-black text-gray-500 text-center">الرصيد الجاري</th>
                                <th className="px-8 py-5 text-sm font-black text-gray-500">البيان</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="6" className="px-8 py-6"><div className="h-4 bg-gray-100 rounded-full w-full"></div></td>
                                    </tr>
                                ))
                            ) : filteredTransactions.length > 0 ? (
                                filteredTransactions.map((trans) => (
                                    <tr key={trans.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gray-100 text-gray-500 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                    <User size={16} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-gray-800">{trans.customer?.name}</div>
                                                    <div className="text-[10px] font-bold text-gray-400">{trans.customer?.business_code}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                                <Calendar size={14} />
                                                {formatDate(trans.created_at)}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black inline-flex items-center gap-1 ${trans.type === 'debt'
                                                    ? 'bg-red-50 text-red-600'
                                                    : 'bg-green-50 text-green-600'
                                                }`}>
                                                {trans.type === 'debt' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
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
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium max-w-[200px] truncate">
                                                <FileText size={14} className="shrink-0" />
                                                {trans.description || '-'}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center text-gray-400 italic font-bold">
                                        لا توجد عمليات مسجلة حالياً.
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

export default Transactions;
