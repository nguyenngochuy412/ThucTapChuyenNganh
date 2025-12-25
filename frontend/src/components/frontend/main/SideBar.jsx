import React from 'react'
import './main.scss';
import { useLocation, useNavigate } from 'react-router-dom';

const MENU_ITEMS  = [
    { id: 'attendance', icon: '📷', label: 'Chấm Công', path: '/user/attendance' },
    { id: 'notifications', icon: '🔔', label: 'Thông Báo', path: '/user/notifications' },
    { id: 'requests', icon: '📝', label: 'Gửi Đơn', path: '/user/requests' },
    { id: 'history', icon: '📋', label: 'Lịch Sử', path: '/user/history' }
];

const SideBar = (activePage) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleNavigation = (path) => {
        if(location.pathname !== path) {
            navigate(path);
        }
    };

    return (
        <div className="sidebar">
            {MENU_ITEMS.map(item => {
                const isActive = activePage === item.id;

                return (
                    <div
                        key={item.id}
                        className={`menu-item ${activePage === item.id ? 'active' : ''}`}
                        onClick={() => handleNavigation(item.path)}
                    >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                    </div>
                );
            })}
        </div>
    );
}

export default SideBar;
