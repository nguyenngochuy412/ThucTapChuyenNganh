import React, { useState, useEffect, useContext } from 'react';
import './AttendancePage.scss';
import Header from '../../main/Header';
import SideBar from '../../main/SideBar';
import { toast } from 'react-toastify';

// Hooks
import { useCamera } from '../../hooks/useCamera';
import { useLocation } from '../../hooks/useLocation';
import { useAttendance } from '../../hooks/useAttendance';

import { addWatermark, compressImage } from '../../services/utils/imageService';
import VideoContainer from '../../../common/VideoContainer/VideoContainer';
import { AuthContext } from '../../../backend/context/Auth';
import AddressDisplay from '../HistoryPage/AddressDisplay';

const AttendancePage = () => {
    const { user } = useContext(AuthContext);
    const camera = useCamera();
    const location = useLocation();
    const { 
        checkIn, 
        checkOut, 
        isLoading: isAttendanceLoading,
        todayAttendance,
        loadTodayAttendance
    } = useAttendance();

    const [currentTime, setCurrentTime] = useState(new Date());
    const [attendanceMode, setAttendanceMode] = useState(null); // 'checkin' | 'checkout' | null
    const [showResult, setShowResult] = useState(false);
    const [resultData, setResultData] = useState(null);

    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(new Date()), 1000);
        location.getCurrentLocation().catch(() => toast.error("Không thể xác định vị trí!"));
        // Gọi API lấy dữ liệu đã điểm danh hôm nay
        loadTodayAttendance();
        return () => {
            clearInterval(interval);
            camera.stop();
        };
    }, [user]);

    // Lấy bản ghi đầu tiên trong mảng data trả về từ Laravel
    const todayRecord = (Array.isArray(todayAttendance) && todayAttendance.length > 0) 
    ? todayAttendance[0] 
    : null;

    // Hàm khi bấm nút Check-in hoặc Check-out chính
    const handleStartAction = async (mode) => {
        setAttendanceMode(mode);
        try {
            await camera.start(); // Bật camera lên
        } catch (error) {
            toast.error("Vui lòng cấp quyền camera để tiếp tục");
            setAttendanceMode(null);
        }
    };

    // Hàm Hủy (Quay lại trạng thái ban đầu)
    const handleCancel = () => {
        camera.stop();
        setAttendanceMode(null);
    };

    // Hàm Chụp và Gửi dữ liệu (Nút Chụp)
    const handleCaptureAndConfirm = async () => {
        try {
            // Bước A: Kiểm tra vị trí sơ bộ ở Frontend (UX)
            if (!location.currentLocation) {
                toast.warning("Đang xác định vị trí, vui lòng đợi...");
                await location.getCurrentLocation();
            }
            
            // Bước B: Chụp ảnh thô từ camera
            const rawImageData = await camera.captureImage({ quality: 0.9 });

            // Bước C: Thêm Watermark (Thời gian + Địa chỉ) để chống gian lận
            const watermarkText = `${new Date().toLocaleString('vi-VN')} | ${location.address || 'Không rõ vị trí'}`;
            const watermarkedData = await addWatermark(rawImageData, watermarkText, {
                fontSize: 20,
                position: 'bottom-right'
            });

            // Bước D: Nén ảnh để giảm tải cho Server Laravel
            const compressedResult = await compressImage(watermarkedData, {
                quality: 0.6,
                maxWidth: 800
            });

            // Bước E: Gửi dữ liệu qua Hook useAttendance (gọi API)
            const attendanceParams = {
                image: compressedResult.dataURL,
                latitude: location.currentLocation.latitude,
                longitude: location.currentLocation.longitude,
                address: location.address
            };

            if (attendanceMode === 'checkin') {
                await checkIn(attendanceParams);
            } else {
                await checkOut(attendanceParams);
            }

            await loadTodayAttendance(); // Tải lại dữ liệu điểm danh hôm nay

            // Bước F: Hiển thị kết quả thành công
            setResultData({
                type: attendanceMode,
                time: new Date(),
                location: location.address,
            });
            setShowResult(true);
            handleCancel(); // Tắt camera

            // Tự đóng thông báo sau 5 giây
            setTimeout(() => setShowResult(false), 5000);

        } catch (error) {
            // Lỗi 403 từ Laravel (Sai vị trí) sẽ rơi vào đây
            toast.error(error.message || "Điểm danh thất bại");
        }
    };

    return (
       <div className="attendance-page-container">
            <Header />
            <div className="main-content-layout">
                <SideBar />
                <main className="attendance-main-area">
                    <div className="glass-card attendance-card">
                        {/* Header của Card */}
                        <div className="card-header">
                            <div className="title-section">
                                <h1>Chấm Công Gương Mặt</h1>
                                <p>Hệ thống nhận diện vị trí & hình ảnh thời gian thực</p>
                            </div>
                            <div className="digital-clock">
                                <div className="time">{currentTime.toLocaleTimeString('vi-VN')}</div>
                                <div className="date">{currentTime.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
                            </div>
                        </div>

                        <div className="card-body">
                            {/* Cột trái: Camera */}
                            <div className="camera-section">
                                <VideoContainer 
                                    isCameraActive={camera.isActive} 
                                    videoRef={camera.videoRef} 
                                />
                                <div className={`status-badge ${location.currentLocation ? 'active' : ''}`}>
                                    <i className="fas fa-map-marker-alt"></i>
                                    {location.address || 'Đang xác định vị trí...'}
                                </div>
                            </div>

                            {/* Cột phải: Điều khiển */}
                            <div className="action-section">
                                {!attendanceMode ? (
                                    <div className="mode-selector">
                                        <h3>Chào mừng bạn quay lại!</h3>
                                        <p>Vui lòng chọn hình thức điểm danh</p>
                                        <div className="button-group">
                                            <button className="btn-action in" onClick={() => handleStartAction('checkin')} disabled={!!todayRecord?.check_in}>
                                                <div className="icon"><i className="fas fa-sign-in-alt"></i></div>
                                                <span>Vào Ca (Check-in)</span>
                                            </button>
                                            <button className="btn-action out" onClick={() => handleStartAction('checkout')} disabled={!!todayRecord?.check_out}>
                                                <div className="icon"><i className="fas fa-sign-out-alt"></i></div>
                                                <span>Tan Ca (Check-out)</span>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="capture-flow">
                                        <div className="mode-tag">
                                            Chế độ: <span>{attendanceMode === 'checkin' ? 'Vào Ca' : 'Tan Ca'}</span>
                                        </div>
                                        <button 
                                            className={`btn-confirm ${isAttendanceLoading ? 'loading' : ''}`}
                                            onClick={handleCaptureAndConfirm}
                                            disabled={isAttendanceLoading || !location.currentLocation}
                                        >
                                            {isAttendanceLoading ? (
                                                <span className="spinner"></span>
                                            ) : (
                                                <><i className="fas fa-camera"></i> Xác Nhận Khuôn Mặt</>
                                            )}
                                        </button>
                                        <button className="btn-cancel-flat" onClick={handleCancel}>
                                            Hủy bỏ và quay lại
                                        </button>
                                    </div>
                                )}

                                {/* Kết quả nhanh */}
                                {showResult && (
                                    <div className="result-toast-inline">
                                        <div className="icon-success"><i className="fas fa-check-circle"></i></div>
                                        <div className="text">
                                            <h4>Thành công!</h4>
                                            <p>Đã ghi nhận {resultData.type} lúc {resultData.time.toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* THANH TRẠNG THÁI CHẤM CÔNG HÔM NAY */}
                            {todayRecord && (
                                <div className="today-full-details">
                                    <div className="detail-header">
                                        <h3><i className="fas fa-calendar-day"></i> Chi tiết chấm công ngày {todayRecord.date}</h3>
                                        <span className={`status-badge ${todayRecord.status}`}>
                                            {todayRecord.status_label}
                                        </span>
                                    </div>

                                    <div className="detail-grid">
                                        {/* PHẦN VÀO CA */}
                                        <div className={`detail-box in ${todayRecord.check_in ? 'active' : ''}`}>
                                            <div className="box-label">VÀO CA</div>
                                            <div className="box-content">
                                                <div className="time">{todayRecord.check_in || '--:--'}</div>
                                                {todayRecord.check_in_image && (
                                                    <div className="image-preview">
                                                        <img src={todayRecord.check_in_image} alt="Ảnh vào ca" />
                                                    </div>
                                                )}
                                                <div className="location">
                                                    <i className="fas fa-map-marker-alt"></i> 
                                                    <AddressDisplay coords={todayRecord.check_in_location} getAddressFn={location.getAddressFromCoords} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* PHẦN TAN CA */}
                                        <div className={`detail-box out ${todayRecord.check_out ? 'active' : ''}`}>
                                            <div className="box-label">TAN CA</div>
                                            <div className="box-content">
                                                <div className="time">{todayRecord.check_out || '--:--'}</div>
                                                {todayRecord.check_out_image && (
                                                    <div className="image-preview">
                                                        <img src={todayRecord.check_out_image} alt="Ảnh tan ca" />
                                                    </div>
                                                )}
                                                <div className="location">
                                                    <i className="fas fa-map-marker-alt"></i> 
                                                    <AddressDisplay coords={todayRecord.check_out_location} getAddressFn={location.getAddressFromCoords} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                    </div>
                </main>
            </div>
        </div>

        
    );
};

export default AttendancePage;