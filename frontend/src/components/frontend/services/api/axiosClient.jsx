import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:8000/api', // Đường dẫn API Laravel của bạn
});

// INTERCEPTOR CHO REQUEST: Tự động đính kèm Token vào Header mỗi khi gọi API
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// INTERCEPTOR CHO RESPONSE: Chính là đoạn code bạn hỏi
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosClient;