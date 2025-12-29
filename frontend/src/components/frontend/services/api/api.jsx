import axiosClient from "./axiosClient";

// 1. Tạo instance chung
const api = axiosClient.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// 2. Interceptor cho REQUEST: Tự động đính kèm Token vào mọi yêu cầu
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

// 3. Interceptor cho RESPONSE: Xử lý khi Token bị xóa bên Backend (Lỗi 401)
api.interceptors.response.use(
    (response) => response, 
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn("Phiên đăng nhập hết hạn hoặc Token không hợp lệ!");
            
            // Xóa sạch local để văng về login
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
            
            // Chuyển hướng người dùng (Dùng window.location để reset toàn bộ app cho sạch)
            window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default api;