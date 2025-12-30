import React, { useEffect, useState } from 'react';
import { useAttendance } from '../../../frontend/hooks/useAttendance';

const AttendanceManagementPage = () => {
    const { salaryData, isLoading, fetchSalaryReport } = useAttendance();
    const [filters, setFilters] = useState({
        month: new Date().getMonth()+1,
        year: new Date().getFullYear(),
        department_id: ''
    });

    console.log(filters);

    // Gọi API mỗi khi filter thay đổi
    useEffect(() => {
        fetchSalaryReport(filters);
    }, [filters, fetchSalaryReport]);

    const handleExportExcel = async () => {
        try {
            toast.info("Đang khởi tạo file Excel, vui lòng đợi...");
            
            // Gọi API bằng axios với responseType là 'blob'
            const response = await api.get('/admin/attendance/export-salary', {
                params: {
                    month: filters.month,
                    year: filters.year,
                    department_id: filters.department_id
                },
                responseType: 'blob', // Rất quan trọng để tải file binary
            });

            // Tạo một URL tạm thời cho file
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            
            // Đặt tên file khi tải về
            const fileName = `Bang_Luong_Thang_${filters.month}_${filters.year}.xlsx`;
            link.setAttribute('download', fileName);
            
            document.body.appendChild(link);
            link.click();
            
            // Dọn dẹp
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success("Tải bảng lương thành công!");
        } catch (error) {
            console.error("Export error:", error);
            toast.error("Không thể xuất file Excel. Vui lòng thử lại!");
        }
    };

    return (
        <div className="admin-page-content">
            <div className="admin-card">
                <div className="card-header-flex">
                    <h3>Bảng Tính Lương Nhân Viên</h3>
                    {/* Bộ lọc tháng/năm */}
                    <div className="filter-group">
                        <input 
                            type="month" 
                            defaultValue={`${filters.year}-${String(filters.month).padStart(2, '0')}`}
                            onChange={(e) => {
                                const [y, m] = e.target.value.split('-');
                                setFilters({...filters, year: y, month: m});
                            }}
                        />
                    </div>
                    <button className="btn-export" onClick={handleExportExcel}>
                        📊 Xuất Excel
                    </button>
                </div>

                <div className="table-responsive">
                    {isLoading ? <div className="loader">Đang tính toán lương...</div> : (
                        <table className="modern-table salary-table">
                            <thead>
                                <tr>
                                    <th>NHÂN VIÊN</th>
                                    <th>CHỨC VỤ</th>
                                    <th>PHÒNG BAN</th>
                                    <th>LƯƠNG CHỨC VỤ</th>
                                    <th className="text-center">ĐI LÀM ĐẦY ĐỦ</th>
                                    <th className="text-center">MUỘN / VỀ SỚM</th>
                                    <th className="text-center">MUỘN & VỀ SỚM</th>
                                    <th>TIỀN VI PHẠM</th>
                                    <th>LƯƠNG THỰC NHẬN</th>
                                </tr>
                            </thead>
                            <tbody>
                                {salaryData.map(s => (
                                    <tr key={s.id}>
                                        <td><strong>{s.name}</strong><br/><small>{s.email}</small></td>
                                        <td><span className="pos-tag">{s.position_name}</span></td>
                                        <td>{s.department_name}</td>
                                        <td>{Number(s.base_salary).toLocaleString()}đ</td>
                                        <td className="text-center">
                                            <span className="count-badge success">{s.full_attendance_count}</span>
                                        </td>
                                        <td className="text-center">
                                            <span className="count-badge warning">{s.late_or_early_count}</span>
                                        </td>
                                        <td className="text-center">
                                            <span className="count-badge danger">{s.late_and_early_count}</span>
                                        </td>
                                        <td className="text-danger">-{Number(s.penalty_amount).toLocaleString()}đ</td>
                                        <td className="final-salary">{Number(s.final_salary).toLocaleString()}đ</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AttendanceManagementPage;