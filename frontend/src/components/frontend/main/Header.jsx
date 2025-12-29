import React, { useContext } from 'react'
import './main.scss';
import { AuthContext } from '../../backend/context/Auth';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const {user, logout} = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () =>{
    if(window.confirm("Bạn có chắc muốn đăng xuất không?")){
      logout();
    }
  }

  const goToProfile = () => {
    navigate('/user/profile'); // Thay '/profile' bằng đường dẫn route bạn đã định nghĩa
  }
  
  return (
    <div className='header'>
      <div>
          <h1>🎯 Hệ Thống Chấm Công</h1>
      </div>
      <div className="user-info">
        <div 
          className="user-group" 
          onClick={goToProfile} 
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <div className="user-avatar">
            {user?.avatar || user?.name?.charAt(0) || 'U'}
          </div>
          <div className="user-details">
            <span className="user-name">{user?.name}</span>
            <span className="user-position">{user?.position} • {user?.department}</span>
          </div>
        </div>

        <button className="btn-logout" onClick={handleLogout}>
          Đăng Xuất
        </button>
      </div>
  </div>
  )
}

export default Header
