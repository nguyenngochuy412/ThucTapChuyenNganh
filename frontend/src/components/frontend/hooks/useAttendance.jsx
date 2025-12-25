import { useState, useContext } from 'react';
import { toast } from 'react-toastify';
import { AuthContext } from '../../backend/context/Auth';
import attendanceApi from '../services/api/attendanceApi';

export const useAttendance = () => {
    const { user } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);
    const [todayAttendance, setTodayAttendance] = useState([]);

    const handleAttendance = async (type, attendanceParams) => {
        try {
            setIsLoading(true);
            const dataAttendance = {
                userId: user.id,
                imageData: attendanceParams.image,
                location: {
                    latitude: attendanceParams.latitude,
                    longitude: attendanceParams.longitude,
                },
                timestamp: new Date().toISOString()
            };

            const response = type === 'checkin' 
                ? await attendanceApi.checkIn(dataAttendance) 
                : await attendanceApi.checkOut(dataAttendance);

            toast.success(`✅ ${type === 'checkin' ? 'Vào ca' : 'Về'} thành công!`);
            await loadTodayAttendance();
            return response.data;
        } catch (error) {
            // Laravel trả về lỗi 403 (Xa công ty) sẽ hiển thị ở đây
            const msg = error.response?.data?.message || 'Lỗi hệ thống';
            toast.error(`❌ ${msg}`);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const loadTodayAttendance = async () => {
        if (!user) return;
        try {
            const res = await attendanceApi.getTodayAttendance(user.id);
            setTodayAttendance(res.data || []);
        } catch (err) { console.error(err); }
    };

    return {
        isLoading,
        todayAttendance,
        checkIn: (params) => handleAttendance('checkin', params),
        checkOut: (params) => handleAttendance('checkout', params),
        loadTodayAttendance
    };
};