import { useState, useContext, useCallback } from 'react';
import { toast } from 'react-toastify';
import { AuthContext } from '../../backend/context/Auth';
import attendanceApi from '../services/api/attendanceApi';

export const useAttendance = () => {
    const { user } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);
    const [todayAttendance, setTodayAttendance] = useState([]);
    const [historyAttendance, setHistoryAttendance] = useState([]);
    const [salaryData, setSalaryData] = useState([]);

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
            const res = await attendanceApi.getTodayAttendance();
            // Lưu ý: res.data là object của Axios, res.data.data là mảng từ Laravel
            const record = res.data;
            if (record && typeof record === 'object') {
                // Nếu có dữ liệu, bọc vào mảng để logic Frontend chạy được
                setTodayAttendance([record]);
            } else {
                // Nếu record là null (chưa điểm danh), để mảng rỗng
                setTodayAttendance([]);
            } 
        } catch (err) { 
            console.error(err);
        }
    };

    const getHistoryAttendance = useCallback(async (startDate, endDate) => {
        if (!user) return;

        setIsLoading(true);
        try {
            const res = await attendanceApi.getHistory(user.id, startDate, endDate);
            setHistoryAttendance(res.data || res || []);
            return res.data || [];
        } catch (error) {
            console.error("Lỗi lấy lịch sử chấm công:", error);
            toast.error("Không thể tải lịch sử chấm công");
        } finally {
            setIsLoading(false);
        }
    }, [user]);

     const fetchSalaryReport = useCallback(async (filters) => {
        if (!user) return;
        
        setIsLoading(true);
        try {
            const res = await attendanceApi.getSalaryReport(filters);
            // Laravel trả về mảng dữ liệu tính toán sẵn
            setSalaryData(res.data);
        } catch (error) {
            toast.error("Không thể tải báo cáo lương");
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        isLoading,
        todayAttendance,
        historyAttendance,
        getHistoryAttendance,
        checkIn: (params) => handleAttendance('checkin', params),
        checkOut: (params) => handleAttendance('checkout', params),
        loadTodayAttendance,
        fetchSalaryReport,
        salaryData
    };
};
