import { useState, useCallback, useEffect } from 'react';
import dashboardApi from '../services/api/dashboardApi';

export const useDashboard = () => {
    const [stats, setStats] = useState({
        total_users: 0,
        today_attendance: 0,
        pending_requests: 0,
        total_notifications: 0
    });
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [salaryData, setSalaryData] = useState([]);

    const fetchData  = useCallback(async () => {
        setLoading(true);
        try {
            // Sử dụng dashboardApi để gọi dữ liệu
            const [statsRes, chartRes, chartSalary] = await Promise.all([
                dashboardApi.getStats(),
                dashboardApi.getAttendanceTrend(),
                dashboardApi.getSalaryByDepartment()
            ]);
            setStats(statsRes.data);
            setChartData(chartRes.data);
            setSalaryData(chartSalary.data);
        } catch (error) {
            console.error("Lỗi lấy dữ liệu Dashboard:", error);
            // Bạn có thể dùng toast.error tại đây để thông báo cho người dùng
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    return { stats, chartData, salaryData, loading, refreshStats: fetchData };
};