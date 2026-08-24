import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import {
    BarChart3, Calendar, TrendingUp, TrendingDown,
    ArrowLeftRight, Printer, RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Reports = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dates, setDates] = useState({
        start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0]
    });

    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/reports', { params: dates });
            setData(response.data);
        } catch (error) {
            toast.error('فشل في تحميل التقارير المجمعة');
        } finally {
            setLoading(false);
        }
    }, [dates]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const formatNumber = (num) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(num || 0);
    };

    if (loading && !data) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* رأس الصفحة وفلتر التاريخ - سيتم إخفاؤه عند الطباعة */}
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col lg:flex-row justify-between items-center gap-6 print:shadow-none print:border-none">
                <div className="flex items-center gap-4 text-right w-full lg:w-auto">
                    <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 print:bg-black">
                        <BarChart3 size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-800">التقارير المجمعة</h1>
                        <p className="text-sm font-bold text-gray-400">تحليل الأداء المالي للمتجر للفترة من {dates.start_date} إلى {dates.end_date}</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto bg-gray-50 p-3 rounded-2xl print:hidden">
                    <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        <input
                            type="date"
                            className="bg-transparent border-none text-sm font-bold text-gray-700 focus:ring-0"
                            value={dates.start_date}
                            onChange={(e) => setDates({ ...dates, start_date: e.target.value })}
                        />
                    </div>
                    <span className="text-gray-300 font-bold">إلى</span>
                    <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        <input
                            type="date"
                            className="bg-transparent border-none text-sm font-bold text-gray-700 focus:ring-0"
                            value={dates.end_date}
                            onChange={(e) => setDates({ ...dates, end_date: e.target.value })}
                        />
                    </div>
                    <button
                        onClick={fetchReports}
                        className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* بطاقات الملخص */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 relative overflow-hidden print:border-gray-200">
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="p-4 bg-red-50 text-red-600 rounded-2xl print:bg-transparent print:p-0"><TrendingUp size={32} /></div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-gray-400 mb-1">إجمالي الديون الجديدة</p>
                            <p className="text-3xl font-black text-gray-800">{formatNumber(data?.summary?.total_debts)} <span className="text-xs">ر.س</span></p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 relative overflow-hidden print:border-gray-200">
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="p-4 bg-green-50 text-green-600 rounded-2xl print:bg-transparent print:p-0"><TrendingDown size={32} /></div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-gray-400 mb-1">إجمالي التحصيلات</p>
                            <p className="text-3xl font-black text-gray-800">{formatNumber(data?.summary?.total_payments)} <span className="text-xs">ر.س</span></p>
                        </div>
                    </div>
                </div>

                <div className={`bg-white p-8 rounded-[32px] shadow-sm border-2 relative overflow-hidden print:border-gray-200 ${data?.summary?.net_change >= 0 ? 'border-indigo-100' : 'border-orange-100'}`}>
                    <div className="flex items-center gap-6 relative z-10">
                        <div className={`p-4 rounded-2xl text-white ${data?.summary?.net_change >= 0 ? 'bg-indigo-600' : 'bg-orange-600'} print:bg-transparent print:text-black print:p-0`}>
                            <ArrowLeftRight size={32} />
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-gray-400 mb-1">صافي التغير المالي</p>
                            <p className={`text-3xl font-black ${data?.summary?.net_change >= 0 ? 'text-indigo-600' : 'text-orange-600'} print:text-black`}>
                                {formatNumber(data?.summary?.net_change)} <span className="text-xs">ر.س</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* تفاصيل اليومية */}
            <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden print:border-none print:shadow-none">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center print:border-gray-200">
                    <h3 className="text-xl font-black text-gray-800">التفاصيل اليومية للفترة</h3>
                    {/* تم تفعيل الزر هنا */}
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-all print:hidden"
                    >
                        <Printer size={16} /> طباعة التقرير
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead>
                            <tr className="bg-gray-50/50 print:bg-gray-100">
                                <th className="px-8 py-5 text-sm font-black text-gray-500">التاريخ</th>
                                <th className="px-8 py-5 text-sm font-black text-gray-500 text-center">الديون (+)</th>
                                <th className="px-8 py-5 text-sm font-black text-gray-500 text-center">التحصيلات (-)</th>
                                <th className="px-8 py-5 text-sm font-black text-gray-500 text-center">الصافي اليومي</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 print:divide-gray-200">
                            {data?.daily_details?.length > 0 ? data.daily_details.map((day, idx) => (
                                <tr key={idx} className="hover:bg-gray-50/50 transition-colors font-bold">
                                    <td className="px-8 py-5 text-gray-700">{day.date}</td>
                                    <td className="px-8 py-5 text-center text-red-600">{formatNumber(day.debts)}</td>
                                    <td className="px-8 py-5 text-center text-green-600">{formatNumber(day.payments)}</td>
                                    <td className={`px-8 py-5 text-center ${day.debts - day.payments >= 0 ? 'text-indigo-600' : 'text-orange-600'} print:text-black`}>
                                        {formatNumber(day.debts - day.payments)}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="px-8 py-20 text-center text-gray-400 italic font-bold">
                                        لا توجد بيانات لهذه الفترة المحددة.
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

export default Reports;
