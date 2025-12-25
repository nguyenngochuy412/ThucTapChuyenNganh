import React, { useContext } from 'react'
import Header from '../../main/Header';
import SideBar from '../../main/SideBar';
import './NotificationPage.scss';
import { useState } from 'react';
import { AuthContext } from '../../../backend/context/Auth';

const NotificationPage = () => {
    const { user } = useContext(AuthContext);
    const idUseNotifications = [5, 4]; // IDs của các chức danh là Trưởng phòng
    const [filter, setFilter] = useState('all'); // 'all' | 'unread'
    const [showCreateModal, setShowCreateModal] = useState(false);

    // State cho form tạo thông báo mới
    const [newNotif, setNewNotif] = useState({ title: '', content: '', type: 'info' });

    const [notifications, setNotifications] = useState([
        {
            id: 1,
            title: "Check-in thành công",
            content: "Bạn đã hoàn thành điểm danh vào ca lúc 08:00 AM.",
            time: "10 phút trước",
            type: "success",
            isRead: false
        },
        {
            id: 2,
            title: "Nhắc nhở cập nhật thông tin",
            content: "Vui lòng bổ sung ảnh đại diện mới để hệ thống nhận diện khuôn mặt chính xác hơn.",
            time: "2 giờ trước",
            type: "warning",
            isRead: false
        },
        {
            id: 3,
            title: "Phê duyệt đơn nghỉ phép",
            content: "Đơn nghỉ phép ngày 28/12 của bạn đã được quản lý phê duyệt.",
            time: "1 ngày trước",
            type: "info",
            isRead: true
        },
        {
            id: 4,
            title: "Cảnh báo vị trí",
            content: "Phát hiện nỗ lực điểm danh ngoài phạm vi cho phép tại chi nhánh Quận 1.",
            time: "2 ngày trước",
            type: "danger",
            isRead: true
        }
    ]);

    const handleCreateNotif = (e) => {
        e.preventDefault();
        const createdNotif = {
            id: Date.now(),
            ...newNotif,
            time: "Vừa xong",
            isRead: false
        };
        setNotifications([createdNotif, ...notifications]);
        setShowCreateModal(false);
        setNewNotif({ title: '', content: '', type: 'info' });
        toast.success("Đã gửi thông báo mới!");
    };

    const handleMarkAsRead = (id) => {
        setNotifications(prev => 
            prev.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
    };

    const handleMarkAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const filteredNotifs = filter === 'unread' 
        ? notifications.filter(n => !n.isRead) 
        : notifications;

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
                                <p>Cập nhật những tin tức và cảnh báo mới nhất từ hệ thống</p>
                            </div>
                            <div className="header-actions">
                                {/* CHỈ TRƯỞNG PHÒNG MỚI THẤY NÚT NÀY */}
                                
                                {idUseNotifications.includes(user?.position_id) && (
                                    <button className="btn-create-notif" onClick={() => setShowCreateModal(true)}>
                                        <i className="fas fa-plus-circle"></i> Tạo thông báo
                                    </button>
                                )}
                                <button className="btn-mark-all" onClick={() => setNotifications(notifications.map(n => ({...n, isRead: true})))}>
                                    Đánh dấu tất cả đã đọc
                                </button>
                            </div>
                        </div>

                        <div className="filter-tabs">
                            <button 
                                className={`tab ${filter === 'all' ? 'active' : ''}`}
                                onClick={() => setFilter('all')}
                            >
                                Tất cả
                            </button>
                            <button 
                                className={`tab ${filter === 'unread' ? 'active' : ''}`}
                                onClick={() => setFilter('unread')}
                            >
                                Chưa đọc
                                {notifications.filter(n => !n.isRead).length > 0 && (
                                    <span className="count-badge">
                                        {notifications.filter(n => !n.isRead).length}
                                    </span>
                                )}
                            </button>
                        </div>

                        <div className="notification-list">
                            {filteredNotifs.length > 0 ? (
                                filteredNotifs.map((notif) => (
                                    <div 
                                        key={notif.id} 
                                        className={`notif-item ${notif.isRead ? 'read' : 'unread'} ${notif.type}`}
                                        onClick={() => handleMarkAsRead(notif.id)}
                                    >
                                        <div className="notif-icon">
                                            {notif.type === 'success' && <i className="fas fa-check-circle"></i>}
                                            {notif.type === 'warning' && <i className="fas fa-exclamation-triangle"></i>}
                                            {notif.type === 'info' && <i className="fas fa-info-circle"></i>}
                                            {notif.type === 'danger' && <i className="fas fa-radiation"></i>}
                                        </div>
                                        <div className="notif-content">
                                            <div className="notif-top">
                                                <h4>{notif.title}</h4>
                                                <span className="time">{notif.time}</span>
                                            </div>
                                            <p>{notif.content}</p>
                                        </div>
                                        {!notif.isRead && <div className="unread-dot"></div>}
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-icon">🔔</div>
                                    <p>Không có thông báo nào!</p>
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

