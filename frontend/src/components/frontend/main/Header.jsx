import React, { useContext } from 'react'
import './main.scss';
import { AuthContext } from '../../backend/context/Auth';

const Header = () => {
  const {user, logout} = useContext(AuthContext);

  const handleLogout = () =>{
    if(window.confirm("Bạn có chắc muốn đăng xuất không?")){
      logout();
    }
  }
  return (
    <div className='header'>
      <div>
          <h1>🎯 Hệ Thống Chấm Công</h1>
      </div>
      <div className="user-info">
        <div className="user-avatar">
          {user?.avatar || user?.name?.charAt(0) || 'U'}
        </div>
        <div className="user-details">
          <span className="user-name">{user?.name}</span>
          {/* Thêm class user-position để hiển thị đẹp hơn */}
          <span className="user-position">{user?.position} • {user?.department}</span>
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          Đăng Xuất
        </button>
      </div>
  </div>
  )
}

export default Header
