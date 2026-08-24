import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import {
  UserPlus, Search, Phone, MapPin,
  PlusCircle, MinusCircle, ExternalLink, X, DollarSign, Calendar, CreditCard
} from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // حالات النوافذ المنبثقة (Modals)
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionType, setTransactionType] = useState('debt'); // 'debt' or 'payment'
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [formData, setFormData] = useState({
    name: '', phone: '', address: '', creditLimit: '', notes: ''
  });

  const [transData, setTransData] = useState({
    amount: '', notes: '', date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash' // القيمة الافتراضية للسداد
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data);
    } catch (error) {
      toast.error('فشل في تحميل قائمة العملاء');
    } finally {
      setLoading(false);
    }
  };

  // إضافة عميل جديد
  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      await api.post('/customers', formData);
      toast.success('تم إضافة العميل بنجاح');
      setShowAddModal(false);
      setFormData({ name: '', phone: '', address: '', creditLimit: '', notes: '' });
      fetchCustomers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'فشل في الإضافة');
    }
  };

  // فتح نافذة العملية (دين أو سداد)
  const openTransModal = (customer, type) => {
    setSelectedCustomer(customer);
    setTransactionType(type);
    setTransData({
      amount: '',
      notes: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash'
    });
    setShowTransactionModal(true);
  };

  // تنفيذ عملية الدين أو السداد
  const handleTransSubmit = async (e) => {
    e.preventDefault();
    if (!transData.amount || transData.amount <= 0) {
      toast.error('يرجى إدخال مبلغ صحيح');
      return;
    }

    const endpoint = transactionType === 'debt' ? '/debts' : '/payments';
    try {
      // إرسال البيانات مع التأكد من إرسال customer_business_code و payment_method
      await api.post(endpoint, {
        customer_business_code: selectedCustomer.business_code,
        amount: transData.amount,
        description: transData.notes,
        date: transData.date,
        payment_method: transactionType === 'payment' ? transData.paymentMethod : null
      });

      toast.success(transactionType === 'debt' ? 'تم تسجيل الدين بنجاح' : 'تم تسجيل السداد بنجاح');
      setShowTransactionModal(false);
      fetchCustomers(); // لتحديث الأرصدة فوراً
    } catch (error) {
      const serverErrors = error.response?.data?.errors;
      if (serverErrors) {
        const firstError = Object.values(serverErrors)[0][0];
        toast.error(firstError);
      } else {
        toast.error(error.response?.data?.message || 'فشل تنفيذ العملية');
      }
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.business_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 font-['Cairo']" dir="rtl">
      {/* الترويسة والبحث */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
          إدارة العملاء
        </h1>

        <div className="flex w-full md:w-auto gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="بحث باسم العميل أو الهاتف..."
              className="w-full pr-9 pl-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition-all text-sm shadow-lg shadow-blue-100"
          >
            <UserPlus size={18} />
            إضافة عميل
          </button>
        </div>
      </div>

      {/* الجدول الأفقي */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-600">
                <th className="p-4 text-sm font-bold">العميل</th>
                <th className="p-4 text-sm font-bold">الهاتف والعنوان</th>
                <th className="p-4 text-sm font-bold">الرصيد الحالي</th>
                <th className="p-4 text-sm font-bold text-center">عمليات سريعة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="4" className="p-10 text-center text-gray-400">جاري التحميل...</td></tr>
              ) : filteredCustomers.length === 0 ? (
                <tr><td colSpan="4" className="p-10 text-center text-gray-400">لا يوجد عملاء مطابقين للبحث</td></tr>
              ) : filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-gray-800">{customer.name}</div>
                    <div className="text-[10px] text-gray-400 font-mono">{customer.business_code}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600"><Phone size={12} /> {customer.phone}</div>
                    <div className="text-xs text-gray-400 truncate max-w-[150px]">{customer.address || 'لا يوجد عنوان'}</div>
                  </td>
                  <td className="p-4">
                    <div className={`font-black text-lg ${parseFloat(customer.current_balance) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {parseFloat(customer.current_balance).toLocaleString()}
                    </div>
                    {parseFloat(customer.credit_limit) > 0 && (
                      <div className="text-[10px] text-orange-600 font-bold">السقف: {parseFloat(customer.credit_limit).toLocaleString()}</div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openTransModal(customer, 'debt')}
                        className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition-all flex items-center gap-1"
                      >
                        <PlusCircle size={14} /> دين
                      </button>
                      <button
                        onClick={() => openTransModal(customer, 'payment')}
                        className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-bold hover:bg-green-600 hover:text-white transition-all flex items-center gap-1"
                      >
                        <MinusCircle size={14} /> سداد
                      </button>
                      <Link
                        to={`/customers/${customer.business_code}`}
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white transition-all flex items-center gap-1"
                      >
                        <ExternalLink size={14} /> كشف
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* نافذة تسجيل دين أو سداد */}
      {showTransactionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in duration-200">
            <div className={`p-4 text-white rounded-t-2xl flex justify-between items-center ${transactionType === 'debt' ? 'bg-red-600' : 'bg-green-600'}`}>
              <h2 className="font-bold flex items-center gap-2">
                {transactionType === 'debt' ? <PlusCircle size={20} /> : <MinusCircle size={20} />}
                تسجيل {transactionType === 'debt' ? 'دين جديد' : 'سداد'} لـ: {selectedCustomer?.name}
              </h2>
              <button onClick={() => setShowTransactionModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleTransSubmit} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">المبلغ</label>
                <div className="relative">
                  <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="number" step="0.001" required autoFocus
                    className="w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg text-center"
                    value={transData.amount}
                    onChange={(e) => setTransData({ ...transData, amount: e.target.value })}
                  />
                </div>
              </div>

              {transactionType === 'payment' && (
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">طريقة الدفع</label>
                  <div className="relative">
                    <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <select
                      className="w-full pr-10 pl-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                      value={transData.paymentMethod}
                      onChange={(e) => setTransData({ ...transData, paymentMethod: e.target.value })}
                    >
                      <option value="cash">نقداً</option>
                      <option value="transfer">تحويل بنكي</option>
                      <option value="check">شيك</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">التاريخ</label>
                <div className="relative">
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="date" required
                    className="w-full pr-10 pl-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                    value={transData.date}
                    onChange={(e) => setTransData({ ...transData, date: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">ملاحظات</label>
                <textarea
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none min-h-[80px]"
                  placeholder="ملاحظات العملية..."
                  value={transData.notes}
                  onChange={(e) => setTransData({ ...transData, notes: e.target.value })}
                ></textarea>
              </div>

              <button
                type="submit"
                className={`w-full py-3 rounded-xl font-bold text-white transition-all shadow-lg ${transactionType === 'debt' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                  }`}
              >
                تأكيد العملية
              </button>
            </form>
          </div>
        </div>
      )}

      {/* نافذة إضافة عميل جديد */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in duration-200">
            <div className="bg-blue-600 p-4 text-white rounded-t-2xl flex justify-between items-center">
              <h2 className="font-bold flex items-center gap-2"><UserPlus size={20} /> إضافة عميل جديد</h2>
              <button onClick={() => setShowAddModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddCustomer} className="p-5 space-y-3">
              <input
                type="text" placeholder="اسم العميل *" required
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <input
                type="text" placeholder="رقم الهاتف *" required
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <input
                type="text" placeholder="العنوان"
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
              <input
                type="number" placeholder="سقف الدين"
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.creditLimit}
                onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
              />
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">حفظ العميل</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
