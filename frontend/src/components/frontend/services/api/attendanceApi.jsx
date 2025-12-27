import axios from 'axios';

// 2. Cấu hình instance axios để tự động lấy token từ localStorage
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Thêm Interceptor để mỗi lần gọi API đều tự động đính kèm Token Sanctum
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token'); // Đảm bảo lúc đăng nhập bạn đã lưu token vào đây
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

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
    getTodayAttendance: async (userId) => {
        try {
            const response = await api.get(`/attendance/today/${userId}`);
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
    }
};

export default attendanceApi;