import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Tạo một instance axios để cấu hình chung cho các request gửi về Laravel
const laravelApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Tự động đính kèm token vào mỗi request nếu có
laravelApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const locationApi = {
    // 1. Lấy địa chỉ từ tọa độ (Giữ nguyên - Phục vụ hiển thị UI)
    reverseGeocode: async (latitude, longitude) => {
        try {
            const response = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
                params: {
                    lat: latitude,
                    lon: longitude,
                    format: 'json',
                    addressdetails: 1
                },
                headers: { 'User-Agent': 'AttendanceApp/1.0' }
            });
            return {
                address: response.data?.display_name || 'Không thể xác định địa chỉ',
                details: response.data
            };
        } catch (error) {
            return { address: `Tọa độ: ${latitude}, ${longitude}` };
        }
    },
};

export default locationApi;