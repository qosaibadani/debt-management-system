import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../api/authStore";
import {
  LayoutDashboard, Users, History, Settings, LogOut,
  CreditCard, FileText, Menu, X, ShieldCheck, User as UserIcon
} from "lucide-react";

const Layout = ({ children }) => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // تحديث المسميات والمسارات لتطابق App.jsx
  // ... داخل مصفوفة menuItems في ملف Layout.jsx، استخدم هذه المسميات والمسارات:
  const menuItems = [
    { path: "/", icon: LayoutDashboard, label: "الرئيسية", roles: ["owner", "employee"] },
    { path: "/customers", icon: Users, label: "العملاء", roles: ["owner", "employee"] },
    { path: "/transactions", icon: History, label: "العمليات", roles: ["owner", "employee"] },
    { path: "/reports", icon: FileText, label: "التقارير", roles: ["owner", "employee"] },
    { path: "/settings", icon: Settings, label: "الإعدادات", roles: ["owner"] },
    { path: "/users", icon: UserIcon, label: "الموظفين", roles: ["owner"] },
  ];


  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const filteredMenu = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-['Cairo']" dir="rtl">
      <aside className={`${isSidebarOpen ? "w-72" : "w-20"} bg-white border-l border-gray-100 shadow-xl transition-all duration-300 flex flex-col fixed h-full z-50`}>
        <div className="p-6 flex items-center justify-between">
          <div className={`flex items-center gap-3 transition-all ${isSidebarOpen ? "opacity-100" : "opacity-0 w-0"}`}>
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <span className="font-black text-xl text-indigo-900">QNB SYSTEM</span>
          </div>
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {filteredMenu.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group ${isActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"
                  }`}
              >
                <item.icon size={22} />
                <span className={`font-bold transition-all duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-50 bg-gray-50/50">
          <div className={`flex items-center gap-3 p-3 mb-3 bg-white rounded-2xl border border-gray-100 shadow-sm transition-all ${isSidebarOpen ? "opacity-100" : "opacity-0 h-0 overflow-hidden"}`}>
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-bold">
              {user?.name?.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden text-right">
              <div className="font-black text-sm text-gray-800 truncate">{user?.name}</div>
              <div className="text-[10px] text-indigo-500 font-bold uppercase">{user?.role === 'owner' ? 'صاحب المتجر' : 'موظف'}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3.5 text-red-500 hover:bg-red-50 rounded-2xl transition-all group">
            <LogOut size={22} />
            <span className={`font-bold transition-all ${isSidebarOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "mr-72" : "mr-20"} p-8 text-right`}>
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-sm font-bold text-gray-400">مرحباً بك مجدداً 👋</h2>
            <h1 className="text-2xl font-black text-gray-800">{user?.store?.name || "متجر QNB"}</h1>
          </div>
        </header>
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
