import { useState } from 'react'
import '../src/assets/css/global.scss';
import '../src/assets/css/responsive.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import {  ToastContainer } from 'react-toastify' ;
import 'react-toastify/dist/ReactToastify.css' ;
import Login from './components/backend/Login/Login';
import AttendancePage from './components/frontend/pages/AttendancePage/AttendancePage';
import RequireAuth from './components/common/RequireAuth';
import NotificationPage from './components/frontend/pages/NotificationPage/NotificationPage';
import RequestPage from './components/frontend/pages/RequestPage/RequestPage';
import HistoryPage from './components/frontend/pages/HistoryPage/HistoryPage';

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />

            {/* <Route path="/user/profile" element={
              <RequireAuth>
                <ProfilePage />
              </RequireAuth>
            } />  */}

            <Route path="/user/attendance" element={
              <RequireAuth>
                <AttendancePage />
              </RequireAuth>
            } /> 

            <Route path="/user/notifications" element={
              <RequireAuth>
                <NotificationPage />
              </RequireAuth>
            } /> 

            <Route path="/user/requests" element={
              <RequireAuth>
                <RequestPage />
              </RequireAuth>
            } /> 

            <Route path="/user/history" element={
              <RequireAuth>
                <HistoryPage />
              </RequireAuth>
            } />
        </Routes>
      </BrowserRouter>
      <ToastContainer/>
    </>
  )
}

export default App
