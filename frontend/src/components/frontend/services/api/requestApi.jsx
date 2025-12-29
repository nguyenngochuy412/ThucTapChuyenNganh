import api from './api';

const requestApi = {
    // Lấy danh sách thông báo cho người dùng
    getCategories: async () => {
        try {
            const response = await api.get(`/requests/categories`);
            return response.data;
        } catch (error) {
            throw error.response?.data || new Error('Lỗi khi lấy danh mục đơn');
        }
    },

    //
    getUsers: async () => {
        try {
            const response = await api.get(`/requests/users`);
            return response.data;
        } catch (error) {
            throw error.response?.data || new Error('Lỗi khi lấy danh sách người dùng');
        }
    },

    getReceivers: async () => {
        try {
            const response = await api.get(`/requests/receivers`);
            return response.data;
        } catch (error) {
            throw error.response?.data || new Error('Lỗi khi lấy danh sách người nhận');
        }
    },

    getSentRequests: async () => {
        try {
            const response = await api.get('/requests/sent');
            return response.data;
        } catch (error) {
            throw error.response?.data || new Error('Lỗi khi lấy đơn đã gửi');
        }
    },

    // Tạo thông báo mới
    createRequest: async (requestData) => {
        try {
            const response = await api.post('/requests/create', requestData);
            return response.data;
        } catch (error) {
            throw error.response?.data || new Error('Lỗi khi tạo đơn');
        }
    },

    updateStatus: async (requestId, status) => {
        try {
            // Gửi requestId lên URL và status trong Body
            const response = await api.post(`/requests/${requestId}/status`, { status });
            return response.data;
        } catch (error) {
            throw error.response?.data || new Error('Lỗi khi cập nhật trạng thái');
        }
    }
}

export default requestApi