import axios from "axios";
import { get } from "react-hook-form";

const laravelApi = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

laravelApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
})

const notificationsApi = {
    // Lấy danh sách thông báo cho người dùng
    getNotifications: async (userId) => {
        try {
            const response = await laravelApi.get(`/notifications/show`);
            return response.data;
        } catch (error) {
            throw error.response?.data || new Error('Lỗi khi lấy thông báo');
        }
    },

    // Tạo thông báo mới
    createNotification: async (notificationData) => {
        try {
            const response = await laravelApi.post('/notifications/create', notificationData);
            return response.data;
        } catch (error) {
            throw error.response?.data || new Error('Lỗi khi tạo thông báo');
        }
    }
}

export default notificationsApi;