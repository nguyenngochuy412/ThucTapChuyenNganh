import axios from "axios";
import { createContext, useEffect, useState } from "react";
import axiosClient from "../../frontend/services/api/axiosClient";
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = () => {
            try {
                const userInfo = localStorage.getItem('userInfo');
                const token = localStorage.getItem('token'); // Lấy thêm token
                if (userInfo && token) {
                    const parsedUser = JSON.parse(userInfo);
                    setUser(parsedUser);
                } else {
                    // Nếu thiếu 1 trong 2 thì xóa sạch để đảm bảo an toàn
                    localStorage.removeItem('userInfo');
                    localStorage.removeItem('token');
                }
            } catch (error) {
                console.error('Error loading user:', error);
                localStorage.removeItem('userInfo');
            } finally {
                setLoading(false); // ← Kết thúc loading
            }
        };

        loadUser();
    }, []);

    const login = (userData, token) => {
        localStorage.setItem('userInfo', JSON.stringify(userData));
        localStorage.setItem('token', token); // Lưu token riêng để API sử dụng
        setUser(userData);
    }

    const updateUser = (newUserData) => {
        setUser((prevUser) => {
            const mergedData = { ...prevUser, ...newUserData };

            // Chỉ lưu đúng 6 trường bạn cần vào localStorage
            const storageData = {
                id: mergedData.id,
                name: mergedData.name,
                role: mergedData.role,
                department_id: mergedData.department_id,
                department: mergedData.department, // Đã là chuỗi từ Backend
                position: mergedData.position,     // Đã là chuỗi từ Backend
                can_create_notification: mergedData.can_create_notification,
            };

            // Lưu dữ liệu đã gọt vào LocalStorage
            localStorage.setItem('userInfo', JSON.stringify(storageData));
            
            return mergedData; // TRẢ VỀ DỮ LIỆU ĐÃ GỌT CHO STATE
        });
    };

    const logout = async () => {
        try {
            // 1. Gọi API Logout ở Backend
            await axiosClient.post('http://localhost:8000/api/logout');
        } catch (error) {
            console.error("Lỗi khi gọi API logout server:", error);
        } finally {
            // 2. Dù API có lỗi hay thành công, vẫn phải xóa dữ liệu ở Frontend
            localStorage.removeItem('userInfo');
            localStorage.removeItem('token');
            setUser(null);
            window.location.href = '/login'; // Chuyển hướng về trang đăng nhập
        }
    }

    return(
        <AuthContext.Provider value= {{
            user, 
            updateUser,
            login, 
            logout,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    )
}