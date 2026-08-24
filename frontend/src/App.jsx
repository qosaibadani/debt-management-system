import React, { useEffect } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from './api/authStore'

// Pages
import Login from './pages/Login'
import Setup from './pages/Setup'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import CustomerStatement from './pages/CustomerStatement'
import Transactions from './pages/Transactions'
import Settings from './pages/Settings'
import Reports from './pages/Reports'
import Users from './pages/Users'
import Layout from './components/Layout'

export default function App() {
  const { isInitialized, checkAuth, user } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-['Cairo']">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          <div className="text-blue-600 font-bold text-xl">جاري تحميل النظام...</div>
        </div>
      </div>
    )
  }

  const isOwner = user?.role === 'owner';

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
      <Route path="/setup" element={!user ? <Setup /> : <Navigate to="/" replace />} />

      <Route
        path="/"
        element={user ? <Layout><Outlet /></Layout> : <Navigate to="/login" replace />}
      >
        <Route index element={<Dashboard />} />
        <Route path="customers" element={<Customers />} />
        <Route path="customers/:businessCode" element={<CustomerStatement />} />

        {/* تم تصحيح المسار هنا من ledger إلى transactions ليتطابق مع القائمة الجانبية */}
        <Route path="transactions" element={<Transactions />} />

        <Route path="reports" element={<Reports />} />

        {/* حماية المسارات الإدارية */}
        <Route
          path="users"
          element={isOwner ? <Users /> : <Navigate to="/" replace />}
        />
        <Route
          path="settings"
          element={isOwner ? <Settings /> : <Navigate to="/" replace />}
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
