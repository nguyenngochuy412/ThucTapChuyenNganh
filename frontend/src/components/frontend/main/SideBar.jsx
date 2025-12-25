import React from 'react'
import './main.scss';

const SideBar = ({ activePage, onPageChange, notificationCount }        ) => {
  const menuItems = [
        { id: 'attendance', icon: '📷', label: 'Chấm Công' },
        { id: 'notifications', icon: '🔔', label: 'Thông Báo' },
        { id: 'requests', icon: '📝', label: 'Gửi Đơn' },
        { id: 'history', icon: '📋', label: 'Lịch Sử' }
    ];

    return (
        <div className="sidebar">
            {menuItems.map(item => (
                <div
                    key={item.id}
                    className={`menu-item ${activePage === item.id ? 'active' : ''}`}
                    onClick={() => onPageChange(item.id)}
                >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                    {item.id === 'notifications' && notificationCount > 0 && (
                        <span id="notifBadge" className="notification-badge">
                            {notificationCount}
                        </span>
                    )}
                </div>
            ))}
        </div>
    );
}

export default SideBar;
