import React, { useContext, useEffect } from 'react'
import { AuthContext } from '../backend/context/Auth'
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const RequireAuth = ({children, allowedRoles}) => {
     const {user, loading} = useContext(AuthContext);

    if (loading) return <div>Đang kiểm tra...</div>;

    if (!user) {
        return <Navigate to="/login" />;
    }

    // Nếu có yêu cầu role cụ thể mà user không khớp -> đá về trang điểm danh
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        toast.error("Bạn không có quyền vào khu vực này");
        return <Navigate to="/user/attendance" />;
    }

    return children;
}

export default RequireAuth;
