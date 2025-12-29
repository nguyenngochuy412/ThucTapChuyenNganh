import React, { useState, useEffect } from 'react';
import Header from '../../main/Header';
import SideBar from '../../main/SideBar';
import './HistoryPage.scss';
import { toast } from 'react-toastify';
import { useAttendance } from '../../hooks/useAttendance';
import { useLocation } from '../../hooks/useLocation';
import AddressDisplay from './AddressDisplay';

const HistoryPage = () => {
    const { historyAttendance, getHistoryAttendance, isLoading } = useAttendance();
    const { getAddressFromCoords } = useLocation();

    // State cho bộ lọc ngày
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Tự động load dữ liệu lần đầu khi vào trang
    useEffect(() => {
        getHistoryAttendance(startDate, endDate);
    }, [getHistoryAttendance]);

    const handleSearch = async () => {
        // Kiểm tra nhanh ở Frontend để không cần tốn một lượt gọi API
        if (!startDate && endDate) {
            toast.warning("Vui lòng chọn Ngày bắt đầu!");
            return;
        }

        try {
            await getHistoryAttendance(startDate, endDate);
        } catch (error) {
            // Nếu Backend trả về lỗi (ví dụ 400), hiển thị message từ server
            const errorMsg = error.response?.data?.message || "Có lỗi xảy ra";
            toast.error(errorMsg);
        }
    }

    return (
        <div className="history-page-container">
            <Header />
            <div className="main-content-layout">
                <SideBar activePage="history" />
                <main className="history-main-area">
                    <div className="history-card">
                        <div className="card-header">
                            <h1>📅 Lịch Sử Chấm Công</h1>
                            <p>Theo dõi thời gian vào ca, ra ca và tổng kết chuyên cần</p>
                            <p>
                                {(!startDate && !endDate) 
                                    ? "Đang hiển thị 7 bản ghi gần nhất" 
                                    : `Hiển thị dữ liệu từ ${startDate} đến ${endDate}`}
                            </p>
                        </div>

                        <div className="filter-section">
                            <div className="filter-group">
                                <label>Từ ngày</label>
                                <input 
                                    type="date" 
                                    value={startDate} 
                                    onChange={(e) => setStartDate(e.target.value)} 
                                />
                            </div>
                            <div className="filter-group">
                                <label>Đến ngày</label>
                                <input 
                                    type="date" 
                                    value={endDate} 
                                    onChange={(e) => setEndDate(e.target.value)} 
                                    disabled={!startDate} // Chỉ cho phép nhập khi đã có startDate
                                    style={{ opacity: !startDate ? 0.5 : 1, cursor: !startDate ? 'not-allowed' : 'auto' }}
                                />
                            </div>
                            <button className="btn-filter" onClick={handleSearch} disabled={isLoading}>
                                <i className="fas fa-search"></i> {isLoading ? 'Đang tìm...' : 'Tìm kiếm'}
                            </button>
                        </div>

                        <div className="history-content-list">
                            {isLoading ? (
                                <div className="loading-state">
                                    <div className="spinner-border text-primary"></div>
                                    <p>Đang tải dữ liệu...</p>
                                </div>
                            ) : historyAttendance.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="history-table">
                                        <thead>
                                            <tr>
                                                <th>Ngày</th>
                                                <th>Giờ Vào</th>
                                                <th>Giờ Ra</th>
                                                <th>Ảnh check in</th>
                                                <th>Ảnh check out</th>
                                                <th>Địa Điểm check in</th>
                                                <th>Địa Điểm check out</th>
                                                <th>Trạng Thái</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {historyAttendance.map((item) => (
                                                <tr key={item.id}>
                                                    <td><strong>{item.date}</strong></td>
                                                    <td className="time-in">{item.check_in || '--:--'}</td>
                                                    <td className="time-out">{item.check_out || '--:--'}</td>
                                                    
                                                    {/* Hiển thị ảnh nếu có (Ví dụ nhỏ) */}
                                                    <td>
                                                        {item.check_in_image && (
                                                            <img src={item.check_in_image} alt="Check-in" style={{ width: '40px', borderRadius: '4px' }} />
                                                        )}
                                                    </td>

                                                    <td>
                                                        {item.check_out_image && (
                                                            <img src={item.check_out_image} alt="Check-out" style={{ width: '40px', borderRadius: '4px' }} />
                                                        )}
                                                    </td>

                                                    <td className="location-cell">
                                                        <i className="fas fa-map-marker-alt"></i>
                                                        {/* Gọi component con để xử lý async */}
                                                        <AddressDisplay
                                                            coords={item.check_in_location} 
                                                            getAddressFn={getAddressFromCoords} 
                                                        />
                                                    </td>

                                                    <td className="location-cell">
                                                        <i className="fas fa-map-marker-alt"></i>
                                                        {/* Gọi component con để xử lý async */}
                                                        <AddressDisplay
                                                            coords={item.check_out_location} 
                                                            getAddressFn={getAddressFromCoords} 
                                                        />
                                                    </td>

                                                    <td>
                                                        <span className={`badge ${item.status}`}>
                                                            {item.status_label}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <i className="fas fa-calendar-times"></i>
                                    <p>Không tìm thấy dữ liệu chấm công.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default HistoryPage;