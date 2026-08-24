import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { 
  UserPlus, Search, Phone, MapPin, 
  MoreVertical, Edit2, Trash2, X,
  AlertCircle, Wallet, User, FileText,
  TrendingUp, TrendingDown, History,
  Plus, Minus, DollarSign
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Customers = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDebtModal, setShowDebtModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    creditLimit: '0',
    notes: ''
  });

  const [transactionData, setTransactionData] = useState({
    amount: '',
    description: '',
    payment_method: 'cash',
    due_date: ''
  });

  const fetchCustomers = useCallback(async () => {
    try {
      const response = await api.get('/customers', {
        params: { search: searchTerm }
      });
      setCustomers(response.data);
    } catch (error) {
      toast.error('فشل في تحميل قائمة العملاء');
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchCustomers();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [fetchCustomers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.phone.length !== 9) {
      toast.error('يجب أن يتكون رقم الهاتف من 9 أرقام بالضبط');
      return;
    }
    try {
      await api.post('/customers', formData);
      toast.success('تم إضافة العميل بنجاح');
      setShowModal(false);
      setFormData({ name: '', phone: '', address: '', creditLimit: '0', notes: '' });
      fetchCustomers();
    } catch (error) {
      const message = error.response?.data?.message || 'حدث خطأ ما';
      toast.error(message);
    }
  };

  const handleDebtSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/debts', {
        customer_business_code: selectedCustomer.business_code,
        ...transactionData
      });
      toast.success('تم تسجيل الدين بنجاح');
      setShowDebtModal(false);
      setTransactionData({ amount: '', description: '', payment_method: 'cash', due_date: '' });
      fetchCustomers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'فشل في تسجيل الدين');
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/payments', {
        customer_business_code: selectedCustomer.business_code,
        ...transactionData
      });
      toast.success('تم تسجيل السداد بنجاح');
      setShowPaymentModal(false);
      setTransactionData({ amount: '', description: '', payment_method: 'cash', due_date: '' });
      fetchCustomers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'فشل في تسجيل السداد');
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num || 0);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header & Search */}
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4 text-right w-full md:w-auto">
          <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
            <User size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-800">إدارة العملاء</h1>
            <p className="text-sm font-bold text-gray-400">إجمالي العملاء المسجلين: {customers.length}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="بحث بالاسم أو الهاتف..."
              className="w-full pr-12 pl-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all text-right"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 justify-center"
          >
            <UserPlus size={20} />
            إضافة عميل
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-sm font-black text-gray-500">العميل</th>
                <th className="px-8 py-5 text-sm font-black text-gray-500">الرصيد المتبقي</th>
                <th className="px-8 py-5 text-sm font-black text-gray-500">سقف الدين</th>
                <th className="px-8 py-5 text-sm font-black text-gray-500 text-center">العمليات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="4" className="px-8 py-6"><div className="h-4 bg-gray-100 rounded-full w-full"></div></td>
                  </tr>
                ))
              ) : customers.length > 0 ? (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black">
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-black text-gray-800">{customer.name}</div>
                          <div className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                            <Phone size={10} /> {customer.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`text-sm font-black ${customer.current_balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatNumber(customer.current_balance)} <span className="text-[10px]">ر.س</span>
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-bold text-gray-500">
                        {formatNumber(customer.credit_limit)}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => { setSelectedCustomer(customer); setShowDebtModal(true); }}
                          className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                          title="إضافة دين"
                        >
                          <Plus size={18} />
                        </button>
                        <button 
                          onClick={() => { setSelectedCustomer(customer); setShowPaymentModal(true); }}
                          className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm"
                          title="تسجيل سداد"
                        >
                          <Minus size={18} />
                        </button>
                        <button 
                          onClick={() => navigate(`/customers/${customer.business_code}`)}
                          className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                          title="كشف حساب"
                        >
                          <History size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center text-gray-400 italic font-bold">
                    لا يوجد عملاء مطابقين للبحث.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-indigo-600 text-white">
              <h3 className="text-xl font-black flex items-center gap-2">
                <UserPlus size={24} /> إضافة عميل جديد
              </h3>
              <button onClick={() => setShowModal(false)} className="hover:rotate-90 transition-all">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5 text-right">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">اسم العميل *</label>
                  <div className="relative">
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      required
                      className="w-full pr-12 pl-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500"
                      placeholder="الاسم الكامل"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">رقم الهاتف *</label>
                  <div className="relative">
                    <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      required
                      maxLength="9"
                      className="w-full pr-12 pl-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500"
                      placeholder="7xxxxxxxx (9 أرقام)"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}
                    />
                  </div>
                  {formData.phone.length > 0 && formData.phone.length !== 9 && (
                    <p className="text-[10px] text-red-500 mt-1 font-bold">يجب إدخال 9 أرقام (الحالي: {formData.phone.length})</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">سقف الدين</label>
                  <div className="relative">
                    <Wallet className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="number"
                      className="w-full pr-12 pl-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500"
                      placeholder="0.00"
                      value={formData.creditLimit}
                      onChange={(e) => setFormData({...formData, creditLimit: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">العنوان</label>
                  <div className="relative">
                    <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      className="w-full pr-12 pl-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500"
                      placeholder="المدينة / الشارع"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">ملاحظات</label>
                <textarea
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                  placeholder="أي معلومات إضافية عن العميل..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                ></textarea>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                  حفظ العميل
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

      {/* Debt Modal (إضافة دين) */}
      {showDebtModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-right">
          <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-red-600 text-white">
              <h3 className="text-xl font-black flex items-center gap-2">
                <Plus size={24} /> تسجيل دين جديد
              </h3>
              <button onClick={() => setShowDebtModal(false)} className="hover:rotate-90 transition-all">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleDebtSubmit} className="p-8 space-y-5">
              <div className="bg-red-50 p-4 rounded-2xl mb-4 text-center">
                <p className="text-xs font-bold text-red-600 mb-1">العميل المستهدف</p>
                <p className="text-lg font-black text-red-700">{selectedCustomer?.name}</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">المبلغ المستحق *</label>
                <div className="relative">
                  <DollarSign className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full pr-12 pl-4 py-4 bg-gray-50 border-none rounded-2xl text-lg font-black text-red-600 focus:ring-2 focus:ring-red-500"
                    placeholder="0.00"
                    value={transactionData.amount}
                    onChange={(e) => setTransactionData({...transactionData, amount: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ الاستحقاق (اختياري)</label>
                <input
                  type="date"
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-red-500"
                  value={transactionData.due_date}
                  onChange={(e) => setTransactionData({...transactionData, due_date: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">البيان / الوصف</label>
                <textarea
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-red-500"
                  placeholder="سبب الدين أو تفاصيل البضاعة..."
                  value={transactionData.description}
                  onChange={(e) => setTransactionData({...transactionData, description: e.target.value})}
                ></textarea>
              </div>
              <button type="submit" className="w-full bg-red-600 text-white py-4 rounded-2xl font-black hover:bg-red-700 transition-all shadow-lg shadow-red-100">
                تأكيد تسجيل الدين
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal (تسجيل سداد) */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-right">
          <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-green-600 text-white">
              <h3 className="text-xl font-black flex items-center gap-2">
                <Minus size={24} /> تسجيل عملية سداد
              </h3>
              <button onClick={() => setShowPaymentModal(false)} className="hover:rotate-90 transition-all">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handlePaymentSubmit} className="p-8 space-y-5">
              <div className="bg-green-50 p-4 rounded-2xl mb-4 text-center">
                <p className="text-xs font-bold text-green-600 mb-1">العميل المسدد</p>
                <p className="text-lg font-black text-green-700">{selectedCustomer?.name}</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">المبلغ المدفوع *</label>
                <div className="relative">
                  <DollarSign className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full pr-12 pl-4 py-4 bg-gray-50 border-none rounded-2xl text-lg font-black text-green-600 focus:ring-2 focus:ring-green-500"
                    placeholder="0.00"
                    value={transactionData.amount}
                    onChange={(e) => setTransactionData({...transactionData, amount: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">طريقة الدفع</label>
                <select
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-green-500 appearance-none"
                  value={transactionData.payment_method}
                  onChange={(e) => setTransactionData({...transactionData, payment_method: e.target.value})}
                >
                  <option value="cash">نقداً (كاش)</option>
                  <option value="transfer">تحويل بنكي</option>
                  <option value="check">شيك</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">ملاحظات السداد</label>
                <textarea
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-green-500"
                  placeholder="رقم الحوالة أو أي ملاحظات..."
                  value={transactionData.description}
                  onChange={(e) => setTransactionData({...transactionData, description: e.target.value})}
                ></textarea>
              </div>
              <button type="submit" className="w-full bg-green-600 text-white py-4 rounded-2xl font-black hover:bg-green-700 transition-all shadow-lg shadow-green-100">
                تأكيد عملية السداد
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
