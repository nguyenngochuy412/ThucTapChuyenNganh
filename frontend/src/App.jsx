import { useState } from 'react'
import '../src/assets/css/global.scss';
import '../src/assets/css/responsive.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import {  ToastContainer } from 'react-toastify' ;
import 'react-toastify/dist/ReactToastify.css' ;
import Login from './components/backend/Login/Login';
import AttendancePage from './components/frontend/pages/AttendancePage/AttendancePage';
import RequireAuth from './components/common/RequireAuth';
import NotificationPage from './components/frontend/pages/NotificationPage/NotificationPage';
import RequestPage from './components/frontend/pages/RequestPage/RequestPage';
import HistoryPage from './components/frontend/pages/HistoryPage/HistoryPage';
import ProfilePage from './components/frontend/pages/ProfilePage/ProfilePage';
import AdminLayout from './components/backend/main/AdminLayout';
import UserManagementPage from './components/backend/pages/UserManagementPage/UserManagementPage';
import DashboardPage from './components/backend/pages/DashboardPage/DashboardPage';

function App() {

  const hasToken = !!localStorage.getItem('token');

  return (
    <>
      <BrowserRouter>
        <Routes>
            <Route path="/" element={
                hasToken  
                ? <Navigate to="/user/attendance" /> 
                : <Login />
            } />
            <Route path="/login" element={
                hasToken 
                ? <Navigate to="/user/attendance" /> 
                : <Login />
            } />

            <Route path="/user/profile" element={
              <RequireAuth allowedRoles={['employee', 'admin']}>
                <ProfilePage />
              </RequireAuth>
            } /> 

            <Route path="/user/attendance" element={
              <RequireAuth allowedRoles={['employee', 'admin']}>
                <AttendancePage />
              </RequireAuth>
            } /> 

            <Route path="/user/notifications" element={
              <RequireAuth allowedRoles={['employee', 'admin']}>
                <NotificationPage />
              </RequireAuth>
            } /> 

            <Route path="/user/requests" element={
              <RequireAuth allowedRoles={['employee', 'admin']}>
                <RequestPage />
              </RequireAuth>
            } /> 

            <Route path="/user/history" element={
              <RequireAuth allowedRoles={['employee', 'admin']}>
                <HistoryPage />
              </RequireAuth>
            } />

            {/* --- NHÓM ROUTE CHỈ DÀNH CHO ADMIN --- */}
            <Route path="/admin" element={
                <RequireAuth allowedRoles={['admin']}>
                    <AdminLayout />
                </RequireAuth>
            }>
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="users" element={<UserManagementPage />} />
                {/* Thêm các route admin khác ở đây */}
            </Route>

            {/* CATCH ALL: Nếu gõ linh tinh thì về trang chủ */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer/>
    </>
  )
}

export default App
