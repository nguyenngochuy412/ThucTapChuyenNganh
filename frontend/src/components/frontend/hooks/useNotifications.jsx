import React, { useContext, useState } from 'react'
import { AuthContext } from '../../backend/context/Auth'
import notificationsApi from '../services/api/notificationsApi';
import { set } from 'react-hook-form';
import requestApi from '../services/api/requestApi';

export const useNotifications = () => {
    const { user } = useContext(AuthContext);
    const [userNotifications, setUserNotifications] = useState([]);
    const [userReceivers, setUserReceivers] = useState([]);

    const loadUserNotifications = async () => {
        if (!user) return ;
        try {
            // Gọi API để lấy thông báo của user
            const res = await notificationsApi.getNotifications();
            setUserNotifications(res || []);
        } catch (err) {
            console.error(err);
        }
    };

    const loadUserReceivers = async () => {
        if (!user) return ;
        try {
            const res = await requestApi.getReceivers();
            setUserReceivers(res || []);
        } catch (err) {
            console.error(err);
        }   
    }

    const createNotification = async(notification) => {
        if(!user) return ;
        try {
            const res = await notificationsApi.createNotification(notification);
            // Cập nhật lại danh sách thông báo sau khi tạo mới
            await loadUserNotifications();
            return res;
        } catch (err) {
            console.error(err);
        }
    }

    const updateRequestStatus = async(requestId, status) => {
        if(!user) return ;
        try {
            const res = await requestApi.updateStatus(requestId, status);
            return res;
        } catch(err) {
            console.error(err);
        }
    }

    return {
        userNotifications,
        setUserNotifications,
        loadUserNotifications,
        loadUserReceivers,
        updateRequestStatus,
        createNotification,
        userReceivers
    };
};
