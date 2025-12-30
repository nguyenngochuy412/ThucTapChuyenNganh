import api from './api';

const locationApi = {
    // 1. Lấy địa chỉ từ tọa độ (Giữ nguyên - Phục vụ hiển thị UI)
    reverseGeocode: async (latitude, longitude) => {
        if (latitude === undefined || longitude === undefined || latitude === null || longitude === null) {
            console.warn("Tọa độ không hợp lệ:", { latitude, longitude });
            return { address: 'Không có dữ liệu tọa độ' };
        }
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