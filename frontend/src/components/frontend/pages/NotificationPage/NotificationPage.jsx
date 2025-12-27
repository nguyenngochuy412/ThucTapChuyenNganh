import React, { useContext, useEffect } from 'react'
import Header from '../../main/Header';
import SideBar from '../../main/SideBar';
import './NotificationPage.scss';
import { useState } from 'react';
import { AuthContext } from '../../../backend/context/Auth';
import { useNotifications } from '../../hooks/useNotifications';

const NotificationPage = () => {
    const { user } = useContext(AuthContext);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const [newNotif, setNewNotif] = useState({
        title: '',
        type: 'info',
        content: ''
    })

    const {
        userNotifications,
        setUserNotifications,
        loadUserNotifications,
        createNotification
    } = useNotifications();

    useEffect(() => {
        //fetch dữ liệu thông báo từ API
        loadUserNotifications();

        if (user?.department) {
        // Tên kênh phải khớp hoàn toàn: department-notifications.ID
        const channelName = `department-notifications.${user.department_id}`;
        
        window.Echo.channel(channelName)
            .listen('.notification.new', (data) => { // Có dấu chấm vì dùng broadcastAs
                console.log("Đã nhận thông báo mới realtime:", data);
                
                // data.notification chính là biến $notification bạn gửi từ Laravel
                setUserNotifications(prev => [data.notification, ...prev]);
            });
            
        return () => {
            window.Echo.leaveChannel(channelName);
        };
    }
    },[]);

    const notificationsList = Array.isArray(userNotifications) ? userNotifications : [];

    const handleCreateNotif = (e) => {
        e.preventDefault();
        createNotification(newNotif);
        setShowCreateModal(false);
    };

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
                                {user?.can_create_notification && (
                                    <button className="btn-create-notif" onClick={() => setShowCreateModal(true)}>
                                        <i className="fas fa-plus-circle"></i> Tạo thông báo
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Thanh tab tối giản - Chỉ để hiển thị tổng số */}
                        <div className="filter-tabs">
                            <button className="tab active">
                                Tất cả thông báo ({notificationsList.length})
                            </button>
                        </div>

                        <div className="notification-list">
                            {notificationsList.length > 0 ? (
                                notificationsList.map((notif) => (
                                    <div key={notif.id} className={`notif-item ${notif.type || 'info'}`}>
                                        <div className="notif-icon">
                                            {notif.type === 'success' && <i className="fas fa-check-circle"></i>}
                                            {notif.type === 'warning' && <i className="fas fa-exclamation-triangle"></i>}
                                            {notif.type === 'danger' && <i className="fas fa-radiation"></i>}
                                            {(notif.type === 'info' || !notif.type) && <i className="fas fa-info-circle"></i>}
                                        </div>
                                        <div className="notif-content">
                                            <div className="notif-top">
                                                <h4>
                                                    {notif.title}
                                                    <span className="sender-name">
                                                        • {notif.sender?.name === user?.name ? (
                                                            <span className="me-badge">Tôi</span>
                                                        ) : (
                                                            notif.sender?.name || 'Hệ thống'
                                                        )}
                                                    </span>
                                                </h4>
                                                <span className="time">
                                                    {notif.created_at ? new Date(notif.created_at).toLocaleString('vi-VN') : ''}
                                                </span>
                                            </div>
                                            <p>{notif.content}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-icon">🔔</div>
                                    <p>Hiện tại chưa có thông báo nào!</p>
                                </div>
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

