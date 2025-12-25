import React, { useContext, useEffect } from 'react'
import { AuthContext } from '../backend/context/Auth'
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const RequireAuth = ({children}) => {
     const {user, loading} = useContext(AuthContext);

    useEffect(() => {
        // Chỉ hiển thị toast khi đã hoàn thành loading và không c  ó user
        if (!loading && !user) {
            toast.info("Vui lòng đăng nhập để tiếp tục");
        }
    }, [user, loading]);

    // Hiển thị loading trong khi kiểm tra auth
    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">
            <div className="text-lg">Đang kiểm tra...</div>
        </div>;
    }

    if(!user) {
        return <Navigate to="/login"/>
    }

    return children;
}

export default RequireAuth;
