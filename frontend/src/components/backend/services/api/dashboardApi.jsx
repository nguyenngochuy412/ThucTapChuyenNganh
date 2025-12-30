import api from '/DoAnThucTapChuyenNganh/ThucTapChuyenNganh/frontend/src/components/frontend/services/api/api'

const dashboardApi = {
    getStats: () => {
        return api.get('/admin/dashboard-stats');
    },

    getAttendanceTrend: () => {
         return api.get('/admin/getAttendanceTrend');
    },

    getSalaryByDepartment: () => {
        return api.get('/admin/getSalaryByDepartment');
    },

    // Lấy danh sách hoạt động gần đây (Nếu bạn muốn hiển thị bảng hoạt động)
    getRecentActivities: () => {
        return api.get('/admin/admin/recent-activities');
    },

    // Có thể thêm các API khác cho biểu đồ nếu cần
    getAttendanceChart: (period = 'week') => {
        return api.get(`/admin/attendance-chart?period=${period}`);
    }
};

export default dashboardApi;