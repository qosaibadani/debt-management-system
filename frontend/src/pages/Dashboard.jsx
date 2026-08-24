import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  Users, TrendingUp, TrendingDown, Wallet,
  ArrowUpRight, ArrowDownRight, Activity, Calendar,
  History
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const [data, setData] = useState({
    stats: {
      total_outstanding: 0,
      total_collected: 0,
      customers_count: 0,
    },
    recent_transactions: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard-stats');
      setData(response.data);
    } catch (error) {
      toast.error('فشل في تحميل بيانات لوحة التحكم');
    } finally {
      setLoading(false);
    }
  };

  // تنسيق الأرقام بشكل احترافي (1,234.56)
  const formatNumber = (val) => {
    const num = parseFloat(val);
    return isNaN(num) ? "0" : new Intl.NumberFormat('en-US').format(num);
  };

  const StatCard = ({ title, value, icon: Icon, color, isCurrency = true }) => (
    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 hover:shadow-md transition-all group relative overflow-hidden text-right">
      <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-[0.03] transition-transform group-hover:scale-110 ${color}`}></div>
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-3 rounded-2xl ${color.replace('bg-', 'bg-opacity-10 text-').replace('text-', 'text-opacity-100 ')}`}>
          <Icon size={24} />
        </div>
      </div>
      <div className="relative z-10">
        <h3 className="text-gray-400 text-sm font-bold mb-1">{title}</h3>
        <div className="text-2xl font-black text-gray-800 flex items-baseline gap-1 justify-start">
          <span>{formatNumber(value)}</span>
          {isCurrency && <span className="text-xs font-bold text-gray-400 mr-1">ر.س</span>}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <div className="p-8 text-center font-bold text-indigo-600 animate-pulse font-['Cairo']">جاري تحميل البيانات...</div>;
  }

  return (
    <div className="space-y-8 font-['Cairo'] animate-in fade-in duration-700" dir="rtl">
      {/* قسم الترحيب */}
      <div className="relative bg-indigo-900 rounded-[32px] p-8 overflow-hidden shadow-xl shadow-indigo-100">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6 text-white">
          <div className="text-center md:text-right">
            <h1 className="text-3xl font-black mb-2">لوحة التحكم</h1>
            <p className="text-indigo-200 text-sm">مرحباً بك! إليك ملخص سريع لنشاط متجرك اليوم.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 flex items-center gap-4">
            <div className="text-right">
              <div className="text-indigo-200 text-[10px] font-bold uppercase">التاريخ</div>
              <div className="font-bold">{new Intl.DateTimeFormat('ar-SA', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}</div>
            </div>
            <Calendar size={20} className="text-white" />
          </div>
        </div>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="عدد العملاء"
          value={data.stats.customers_count}
          icon={Users}
          color="bg-blue-600"
          isCurrency={false} // هنا أزلنا العملة
        />
        <StatCard
          title="إجمالي التحصيلات"
          value={data.stats.total_collected}
          icon={TrendingDown}
          color="bg-green-500"
        />
        <StatCard
          title="صافي الديون القائمة"
          value={data.stats.total_outstanding}
          icon={Wallet}
          color="bg-red-500"
        />
      </div>

      {/* قسم العمليات الأخيرة */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm text-right">
          <h3 className="font-black text-gray-800 flex items-center gap-2 text-lg mb-6">
            <History className="text-indigo-600" size={20} />
            آخر العمليات
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-gray-400 text-xs border-b border-gray-50">
                  <th className="pb-4 text-right">العميل</th>
                  <th className="pb-4 text-right">النوع</th>
                  <th className="pb-4 text-right">المبلغ</th>
                  <th className="pb-4 text-right">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.recent_transactions.map((trans, idx) => (
                  <tr key={idx} className="group hover:bg-gray-50 transition-colors">
                    <td className="py-4 font-bold text-gray-700">{trans.customer?.name}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${trans.type === 'debt' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {trans.type === 'debt' ? 'دين' : 'سداد'}
                      </span>
                    </td>
                    <td className="py-4 font-black text-gray-800">{formatNumber(trans.amount)} ر.س</td>
                    <td className="py-4 text-xs text-gray-400">{new Date(trans.created_at).toLocaleDateString('ar-SA')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-indigo-600 p-8 rounded-[32px] text-white relative overflow-hidden flex flex-col justify-between shadow-xl shadow-indigo-100">
          <div>
            <h3 className="font-black text-xl mb-4 text-right">ملخص سريع 💡</h3>
            <p className="text-indigo-100 text-sm leading-relaxed text-right">
              لديك حالياً {formatNumber(data.stats.customers_count)} عملاء.
              إجمالي المبالغ المطلوبة هو {formatNumber(data.stats.total_outstanding)} ر.س.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
