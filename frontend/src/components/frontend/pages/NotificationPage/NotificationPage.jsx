import React, { useContext, useEffect, useMemo } from 'react'
import Header from '../../main/Header';
import SideBar from '../../main/SideBar';
import './NotificationPage.scss';
import { useState } from 'react';
import { AuthContext } from '../../../backend/context/Auth';
import { useNotifications } from '../../hooks/useNotifications';
import { toast } from 'react-toastify';

const NotificationPage = () => {
    const { user } = useContext(AuthContext);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('notifications');

    const [newNotif, setNewNotif] = useState({
        title: '',
        type: 'info',
        content: ''
    })

    const {
        userNotifications,
        setUserNotifications,
        loadUserNotifications,
        createNotification,
        loadUserReceivers,
        userReceivers,
        updateRequestStatus
    } = useNotifications();

    // Kiểm tra quyền quản lý (có thể tạo thông báo hoặc duyệt đơn)
    const isManager = user?.can_create_notification !== 0;

    useEffect(() => {
        //fetch dữ liệu thông báo từ API
        const fetchData = async () => {
            setIsLoading(true); // Bắt đầu tải
            try {
                // Đợi cả 2 API chạy xong
                await Promise.all([
                    loadUserNotifications(),
                    loadUserReceivers()
                ]);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu:", error);
            } finally {
                setIsLoading(false); // Kết thúc tải
            }
        };

        fetchData();

        if (user?.department) {
        // Tên kênh phải khớp hoàn toàn: department-notifications.ID
        const channelName = `department-notifications.${user.department_id}`;
        
        window.Echo.channel(channelName)
            .listen('.notification.new', (data) => { // Có dấu chấm vì dùng broadcastAs
                console.log("Đã nhận thông báo mới realtime:", data);
                
                // data.notification chính là biến $notification bạn gửi từ Laravel
                const newNotif = data.notification || data;
                setUserNotifications(prev => {
                    const isDuplicate = prev.some(notif => notif.id === newNotif.id);
                    if(isDuplicate) {
                        return prev;
                    }
                    return [newNotif, ...prev];
                });
            });
            
        return () => {
            console.log("Đang hủy lắng nghe kênh:", channelName);
            window.Echo.leaveChannel(channelName);
        };
    }
    },[user]);

    // LOGIC QUAN TRỌNG: Gộp thông báo hệ thống và đơn đã xử lý
    const mergedNotifications = useMemo(() => {
        // Lấy thông báo hệ thống
        const systemNotifs = Array.isArray(userNotifications) ? userNotifications.map(n => ({ ...n, itemType: 'system' })) : [];
        
        // Lấy các đơn từ đã xử lý (approved hoặc rejected)
        const processedRequests = Array.isArray(userReceivers) 
            ? userReceivers
                .filter(r => r.status !== 'pending')
                .map(r => ({ ...r, itemType: 'request_result' })) 
            : [];

        // Gộp lại và sắp xếp theo thời gian mới nhất (created_at hoặc updated_at)
        return [...systemNotifs, ...processedRequests].sort((a, b) => {
            return new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at);
        });
    }, [userNotifications, userReceivers]);

    // Danh sách các đơn đang chờ duyệt (chỉ dành cho Tab quản lý)
    const pendingRequests = useMemo(() => {
        return Array.isArray(userReceivers) ? userReceivers.filter(r => r.status === 'pending') : [];
    }, [userReceivers]);

    const handleCreateNotif = (e) => {
        e.preventDefault();

        if(!newNotif.title || !newNotif.content || !newNotif.type) {
            toast.error("Vui lòng điền đầy đủ tiêu đề, nội dung và loại thông báo!");
            return;
        }
        createNotification(newNotif);
        setShowCreateModal(false);
        setNewNotif({
            title: '',
            type: 'info',
            content: ''
        })
    };

    const handleAction = async (requestId, status) => {
        // Xử lý hành động duyệt/từ chối đơn
        if (isProcessing) return;
        setIsProcessing(true);
        try {
            // 1. Gọi API qua hook
            await updateRequestStatus(requestId, status);
            
            // 2. Thông báo cho người dùng
            toast.success(status === 'approved' ? "Đã phê duyệt đơn!" : "Đã từ chối đơn!");
        } catch (error) {
            toast.error("Thao tác thất bại!");
        } finally {
            setIsProcessing(false);
        }
    }

    return (
        <div className="notification-page-container">
            <Header />
            <div className="main-content-layout">
                <SideBar activePage="notifications"/>
                <main className="notification-main-area">
                    <div className="glass-card notification-card">
                        <div className="card-header">
                            <div className="title-section">
                                <h1>Thông Báo</h1>
                                <p>Cập nhật những tin tức mới nhất từ hệ thống</p>
                            </div>
                            <div className="header-actions">
                                {isManager && (
                                    <button className="btn-create-notif" onClick={() => setShowCreateModal(true)}>
                                        <i className="fas fa-plus-circle"></i> Tạo thông báo
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* THANH TAB CHIA DỮ LIỆU */}
                        <div className="filter-tabs">
                            <button 
                                className={`tab ${activeTab === 'notifications' ? 'active' : ''}`}
                                onClick={() => setActiveTab('notifications')}
                            >
                                <i className="fas fa-bullhorn"></i> Thông báo & Kết quả ({isLoading ? '...' : mergedNotifications.length})
                            </button>
                            
                            {/* CHỈ HIỆN TAB ĐƠN CẦN DUYỆT NẾU LÀ QUẢN LÝ */}
                            {isManager && (
                                <button 
                                    className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('requests')}
                                >
                                    <i className="fas fa-file-signature"></i> Đơn cần duyệt ({isLoading ? '...' : pendingRequests.length})
                                </button>
                            )}
                        </div>

                        <div className="notification-list">
                            {/* HIỆN LOADING KHI ĐANG TẢI */}
                            {isLoading ? (
                                <div className="loading-state">
                                    <div className="spinner-border text-primary"></div>
                                    <p>Đang tải dữ liệu...</p>
                                </div>
                            ) : (
                                <>
                                    {/* TAB 1: THÔNG BÁO HỆ THỐNG */}
                                    {activeTab === 'notifications' && (
                                        mergedNotifications.length > 0 ? (
                                            mergedNotifications.map((item) => (
                                                <div 
                                                    key={`${item.itemType}-${item.id}`} 
                                                    className={`notif-item ${item.itemType === 'system' ? (item.type || 'info') : (item.status === 'approved' ? 'success' : 'danger')}`}
                                                >
                                                    <div className="notif-icon">
                                                        {/* Icon khác nhau cho từng loại */}
                                                        <i className={item.itemType === 'system' ? "fas fa-info-circle" : "fas fa-file-invoice"}></i>
                                                    </div>

                                                    <div className="notif-content">
                                                        <div className="notif-top">
                                                            <h4>
                                                                {item.itemType === 'system' ? (
                                                                    // HIỂN THỊ CHO THÔNG BÁO HỆ THỐNG
                                                                    <>{item.title} <span>• {item.sender?.name === user?.name ? "Tôi" : "Hệ thống"}</span></>
                                                                ) : (
                                                                    // HIỂN THỊ CHO KẾT QUẢ ĐƠN TỪ      
                                                                    <>
                                                                        <span className="req-cate">[{item.category?.name}]</span> Kết quả đơn từ 
                                                                        <span className={`status-text ${item.status}`}>
                                                                            ({item.status === 'approved' ? 'Đã duyệt' : 'Từ chối'})
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </h4>
                                                            <span className="time">
                                                                {new Date(item.updated_at || item.created_at).toLocaleString('vi-VN')}
                                                            </span>
                                                        </div>

                                                        {/* NỘI DUNG KHÁC NHAU */}
                                                        <div className="notif-body">
                                                            {item.itemType === 'system' ? (
                                                                // Nội dung thông báo hệ thống
                                                                <p>{item.content}</p>
                                                            ) : (
                                                                // Nội dung tóm tắt của đơn từ
                                                                <div className="request-summary">
                                                                    <p>Lý do: {item.reason}</p>
                                                                    <p className="small-date">Thời gian: {item.from_date} → {item.to_date}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : <div className="empty-state"><p>Không có thông báo hệ thống.</p></div>
                                    )}

                                    {/* TAB 2: ĐƠN TỪ / REQUESTS */}
                                    {activeTab === 'requests' && isManager && (
                                        pendingRequests.length > 0 ? (
                                            pendingRequests.map((req) => (
                                                <div key={req.id} className="notif-item request-item">
                                                    <div className="notif-icon request-icon">
                                                        <i className="fas fa-envelope-open-text"></i>
                                                    </div>
                                                    <div className="notif-content">
                                                        <div className="notif-top">
                                                            <h4>
                                                                <span className="req-cate">[{req.category?.name}]</span> Đơn từ: {req.sender?.name}
                                                            </h4>
                                                            <span className={`status-badge ${req.status}`}>
                                                                {req.status === 'pending' ? 'Chờ duyệt' : 
                                                                req.status === 'approved' ? 'Đã duyệt' : 'Đã từ chối'}
                                                            </span>
                                                        </div>
                                                        <p><strong>Lý do:</strong> {req.reason}</p>
                                                        <p className="req-date">Thời gian: {req.from_date} đến {req.to_date}</p>
                                                        <div className="request-footer">
                                                            {req.status === 'pending' ? (
                                                                // Nếu đang chờ duyệt thì hiện buttons
                                                                <div className="request-actions">
                                                                    <button 
                                                                        className="btn-approve" 
                                                                        onClick={() => handleAction(req.id, 'approved')}
                                                                        disabled={isProcessing}
                                                                    >
                                                                        Duyệt
                                                                    </button>
                                                                    <button 
                                                                        className="btn-reject" 
                                                                        onClick={() => handleAction(req.id, 'rejected')}
                                                                        disabled={isProcessing}
                                                                    >
                                                                        Từ chối
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                // Nếu đã xử lý rồi thì hiện text/badge trạng thái to
                                                                <div className={`final-status ${req.status}`}>
                                                                    {req.status === 'approved' ? (
                                                                        <span><i className="fas fa-check-circle"></i> Yêu cầu này đã được bạn phê duyệt</span>
                                                                    ) : (
                                                                        <span><i className="fas fa-times-circle"></i> Yêu cầu này đã bị bạn từ chối</span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>  
                                            ))
                                        ) : <div className="empty-state"><p>Không có đơn từ nào cần duyệt.</p></div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* MODAL TẠO THÔNG BÁO MỚI */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-content animate-zoom">
                        <h2>Tạo Thông Báo Mới</h2>
                        <form onSubmit={handleCreateNotif}>
                            <div className="form-group">
                                <label>Tiêu đề</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={newNotif.title}
                                    onChange={(e) => setNewNotif({...newNotif, title: e.target.value})}
                                    placeholder="Ví dụ: Thông báo họp khẩn..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Loại thông báo</label>
                                <select 
                                    value={newNotif.type}
                                    onChange={(e) => setNewNotif({...newNotif, type: e.target.value})}
                                >
                                    <option value="info">Thông tin (Xanh dương)</option>
                                    <option value="success">Thành công (Xanh lá)</option>
                                    <option value="warning">Cảnh báo (Vàng)</option>
                                    <option value="danger">Quan trọng (Đỏ)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Nội dung</label>
                                <textarea 
                                    required 
                                    rows="4"
                                    value={newNotif.content}
                                    onChange={(e) => setNewNotif({...newNotif, content: e.target.value})}
                                    placeholder="Nhập nội dung thông báo chi tiết..."
                                ></textarea>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowCreateModal(false)}>Hủy</button>
                                <button type="submit" className="btn-confirm">Gửi Thông Báo</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}

export default NotificationPage;

