import api from '/DoAnThucTapChuyenNganh/ThucTapChuyenNganh/frontend/src/components/frontend/services/api/api'

const managementApi = {
    // Lấy danh sách user (có lọc và tìm kiếm)
    getUsers: (params) => {
        return api.get('/admin/users/show', { params });
    },

    // Lấy dữ liệu bổ trợ để hiện thị trong Select (Phòng ban & Chức vụ)
    getMetaData: () => {
        return api.get('/admin/users/showMetaData');
    },

    // Tạo user mới
    createUser: (data) => {
        return api.post('/admin/users/create', data);
    },

    // Cập nhật thông tin user
    updateUser: (id, data) => {
        return api.put(`/admin/users/${id}`, data);
    },

    // Xóa user
    deleteUser: (id) => {
        return api.delete(`/admin/users/${id}`);
    }
};

export default managementApi;