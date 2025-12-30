import api from '/DoAnThucTapChuyenNganh/ThucTapChuyenNganh/frontend/src/components/frontend/services/api/api'

const departmentApi = {
    getAll: () => api.get('/admin/departments'),
    create: (data) => api.post('/admin/departments', data),
    update: (id, data) => api.put(`/admin/departments/${id}`, data),
    delete: (id) => api.delete(`/admin/departments/${id}`),
};

export default departmentApi;