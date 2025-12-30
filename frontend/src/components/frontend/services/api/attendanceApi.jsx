import api from './api';

const attendanceApi = {
    // Hàm gửi dữ liệu check-in
    checkIn: async (attendanceData) => {
        try {
            // data gửi lên gồm: { userId, imageData, location }
            const response = await api.post('/attendance/check-in', attendanceData);
            return response.data;
        } catch (error) {
            // Trả về message lỗi từ Laravel (nếu có)
            throw error.response?.data || new Error('Lỗi khi check-in');
        }
    },

    // Hàm gửi dữ liệu check-out
    checkOut: async (attendanceData) => {
        try {
            const response = await api.post('/attendance/check-out', attendanceData);
            return response.data;
        } catch (error) {
            throw error.response?.data || new Error('Lỗi khi check-out');
        }
    },

    // Lấy lịch sử điểm danh hôm nay
    getTodayAttendance: async () => {
        try {
            const response = await api.get(`/attendance/today`);
            return response.data; // Kết quả trả về { data: [...] }
        } catch (error) {
            throw error.response?.data || new Error('Lỗi khi lấy dữ liệu hôm nay');
        }
    },

    // Lấy lịch sử theo khoảng thời gian
    getHistory: async (userId, startDate, endDate) => {
        try {
            const response = await api.get('/attendance/history', {
                params: { userId, startDate, endDate }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || new Error('Lỗi khi lấy lịch sử');
        }
    },

    getSalaryReport: (params) => {
        return api.get('/admin/attendance/salary-report', { params });
    }
};

export default attendanceApi;