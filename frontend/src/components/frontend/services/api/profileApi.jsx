

import React from 'react'
import api from './api';

const profileApi = {
    getProfile: async (id) => {
        try {
            const response = await api.get(`/profile/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || new Error('Lỗi khi cập nhật hồ sơ');
        }
    },

    updateProfile: async (data) => {
        try {
            const response = await api.post(`/profile/update`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || new Error('Lỗi khi cập nhật hồ sơ');
        }
    },

    changePassword: async (data) => {
        try {
            const response = await api.post(`/profile/change-password`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || new Error('Lỗi khi đổi mật khẩu');
        }
    }
}

export default profileApi