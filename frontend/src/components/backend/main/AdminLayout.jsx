import React, { useContext } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import '../main/AdminLayout.scss';
import { AuthContext } from '../context/Auth';

const AdminLayout = () => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();

    // Hàm lấy title dựa trên route
    const getPageTitle = () => {
        const path = location.pathname;
        if (path.includes('dashboard')) return 'Tổng quan hệ thống';
        if (path.includes('users')) return 'Quản lý nhân viên';
        return 'Admin Panel';
    };

     const handleLogout = () => {
        if (window.confirm("Hệ thống Admin: Bạn có chắc muốn đăng xuất?")) {
        logout();
        }
    };

    const goToProfile = () => {
        // Admin có thể dùng chung trang profile với user hoặc trang riêng
        navigate('/user/profile'); 
    };

    return (
        <div className="admin-container">
            {/* --- SIDEBAR --- */}
            <aside className="admin-sidebar">
                <div className="admin-logo">
                    <h2>⚡ HRM PRO</h2>
                    <span>Hệ thống Quản trị Admin</span>
                </div>

                <nav className="sidebar-menu">
                    <p className="menu-label">Main Menu</p>
                    <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? "admin-menu-item active" : "admin-menu-item"}>
                        <span className="icon">📊</span> Dashboard
                    </NavLink>
                    <NavLink to="/admin/users" className={({ isActive }) => isActive ? "admin-menu-item active" : "admin-menu-item"}>
                        <span className="icon">👥</span> Nhân viên
                    </NavLink>
                    
                    <p className="menu-label" style={{ marginTop: '20px' }}>Operations</p>
                    
                </nav>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className="admin-main">
                <header className="admin-header">
                    <div className="page-title">
                        <h1>{getPageTitle()}</h1>
                    </div>

                    <div className="admin-user-nav">
                        <div className="admin-profile" onClick={goToProfile} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <div className="avatar">
                                {user?.avatar || user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="info">
                                <span className="name">{user?.name || 'Admin'}</span>
                                <span className="role">{user?.role == 'admin'?'Administrator':''}</span>
                            </div>
                        </div>
                        <button className="btn-logout-admin" onClick={handleLogout}>
                            Đăng xuất
                        </button>
                    </div>
                </header>

                <section className="admin-content-body">
                    {/* Các trang con sẽ hiển thị ở đây */}
                    <Outlet />
                </section>
            </main>
        </div>
    );
};

export default AdminLayout;