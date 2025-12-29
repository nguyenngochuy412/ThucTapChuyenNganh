import api from './api';

const notificationsApi = {
    // Lấy danh sách thông báo cho người dùng
    getNotifications: async () => {
        try {
            const response = await api.get(`/notifications/show`);
            return response.data;
        } catch (error) {
            throw error.response?.data || new Error('Lỗi khi lấy thông báo');
        }
    },

    // Tạo thông báo mới
    createNotification: async (notificationData) => {
        try {
            const response = await api.post('/notifications/create', notificationData);
            return response.data;
        } catch (error) {
            throw error.response?.data || new Error('Lỗi khi tạo thông báo');
        }
    }
}

export default notificationsApi;