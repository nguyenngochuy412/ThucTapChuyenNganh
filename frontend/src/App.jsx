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

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/user/attendance" element={
              <RequireAuth>
                <AttendancePage />
              </RequireAuth>
            } /> 
        </Routes>
      </BrowserRouter>
      <ToastContainer/>
    </>
  )
}

export default App
