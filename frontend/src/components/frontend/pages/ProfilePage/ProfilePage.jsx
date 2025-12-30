import React, { useContext, useEffect, useState } from 'react';
import Header from '../../main/Header';
import SideBar from '../../main/SideBar';
import './ProfilePage.scss';
import { AuthContext } from '../../../backend/context/Auth';
import { useProfile } from '../../hooks/useProfile';
import { toast } from 'react-toastify';

const ProfilePage = () => {
    const { profileData, fetchProfile, updateProfile, changePassword, isLoading } = useProfile();
    const { user } = useContext(AuthContext);

    const [isEditing, setIsEditing] = useState(false);
    const [showPassModal, setShowPassModal] = useState(false);
    const [editData, setEditData] = useState({ name: '', phone: '', address: '', birth_date: '' });
    const [passData, setPassData] = useState({ current_password: '', new_password: '', new_password_confirmation: '' });

    useEffect(() => {
        fetchProfile();
    }, [user?.id, fetchProfile]);

    // Hàm hỗ trợ hiển thị ngày dd/mm/yyyy
    const formatDateDisplay = (dateStr) => {
        if (!dateStr) return 'Chưa cập nhật';
        
        // Nếu dateStr đã là định dạng dd/mm/yyyy từ Laravel (do Carbon format)
        if (typeof dateStr === 'string' && dateStr.includes('/')) return dateStr;

        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return 'Chưa cập nhật';
        
        return date.toLocaleDateString('vi-VN'); // Trả về dd/mm/yyyy
    };

    const openEditMode = () => {
        setEditData({
            name: profileData?.name || '',
            phone: profileData?.phone || '',
            address: profileData?.address || '',
            birth_date: profileData?.birth_date || ''
        });
        setIsEditing(true);
    };

    const handleUpdate = async () => {
        await updateProfile(editData);
        setIsEditing(false);
    };

    const handleChangePass = async (e) => {
        e.preventDefault();
        if (passData.new_password !== passData.new_password_confirmation) {
            return toast.error("Mật khẩu xác nhận không khớp!");
        }
        try {
            await changePassword(passData);
            setShowPassModal(false);
            setPassData({ current_password: '', new_password: '', new_password_confirmation: '' });
        } catch (err) {}
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                await updateProfile({ ...editData, avatar: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const userAvatar = profileData?.avatar ? `http://localhost:8000/storage/${profileData.avatar}` : null;
    const defaultAvatar = `https://ui-avatars.com/api/?name=${profileData?.name || 'User'}&background=4361ee&color=fff&size=128`;

    return (
        <div className="profile-page-container">
            <Header />
            <div className="main-content-layout">
                <SideBar activePage="profile" />
                <main className="profile-main-area">
                    <div className="profile-grid">
                        
                        {/* IDENTITY CARD */}
                        <div className="identity-card animate-fadeIn">
                            <div className="avatar-section">
                                <div className="avatar-wrapper">
                                    <img src={userAvatar || defaultAvatar} alt="Avatar" />
                                    <input type="file" id="avatar-upload" hidden onChange={handleAvatarChange} accept="image/*" />
                                    <label htmlFor="avatar-upload" className="btn-edit-avatar">
                                        <i className="fas fa-camera"></i>
                                    </label>
                                </div>
                                <h2>{profileData?.name || 'Đang tải...'}</h2>
                                <span className="badge-position">{profileData?.position || 'Nhân viên'}</span>
                            </div>
                            
                            <div className="quick-stats">
                                <div className="stat-item">
                                    <span className="label">Mã NV</span>
                                    <span className="value">#{profileData?.id?.toString().padStart(4, '0') || '----'}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="label">Phòng ban</span>
                                    <span className="value">{profileData?.department || 'N/A'}</span>
                                </div>
                            </div>

                            <div className="action-buttons">
                                <button className="btn-primary-outline" onClick={() => setShowPassModal(true)}>
                                    <i className="fas fa-key"></i> Đổi mật khẩu
                                </button>
                                {!isEditing && (
                                    <button className="btn-primary" onClick={openEditMode}>
                                        <i className="fas fa-edit"></i> Chỉnh sửa Profile
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* DETAILS CARD */}
                        <div className="details-card animate-fadeInDelay">
                            <div className="card-header">
                                <h3><i className="fas fa-user-shield"></i> Thông tin chi tiết</h3>
                                {isEditing && (
                                    <div className="edit-actions">
                                        <button className="btn-save" onClick={handleUpdate} disabled={isLoading}>
                                            <i className="fas fa-check"></i> Lưu
                                        </button>
                                        <button className="btn-cancel" onClick={() => setIsEditing(false)}>
                                            Hủy
                                        </button>
                                    </div>
                                )}
                            </div>
                            
                            <div className="info-groups">
                                <div className="info-group">
                                    <label><i className="fas fa-user"></i> Họ và tên</label>
                                    {isEditing ? (
                                        <input className="edit-input" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
                                    ) : (
                                        <div className="info-value">{profileData?.name}</div>
                                    )}
                                </div>

                                <div className="info-group">
                                    <label><i className="fas fa-envelope"></i> Email công việc</label>
                                    <div className="info-value muted">
                                        {profileData?.email || 'Chưa cập nhật'}
                                    </div>
                                </div>

                                <div className="info-group">
                                    <label><i className="fas fa-phone"></i> Số điện thoại</label>
                                    {isEditing ? (
                                        <input className="edit-input" value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})} />
                                    ) : (
                                        <div className="info-value">{profileData?.phone || 'Chưa cập nhật'}</div>
                                    )}
                                </div>

                                <div className="info-group">
                                    <label><i className="fas fa-birthday-cake"></i> Ngày sinh</label>
                                    {isEditing ? (
                                        <input type="date" className="edit-input" value={editData.birth_date} onChange={e => setEditData({...editData, birth_date: e.target.value})} />
                                    ) : (
                                        <div className="info-value">{formatDateDisplay(profileData?.birth_date)}</div>
                                    )}
                                </div>

                                {/* THÊM NGÀY GIA NHẬP TẠI ĐÂY */}
                                <div className="info-group">
                                    <label><i className="fas fa-calendar-check"></i> Ngày gia nhập</label>
                                    <div className="info-value muted">
                                        {formatDateDisplay(profileData?.hire_date)}
                                    </div>
                                </div>

                                <div className="info-group">
                                    <label><i className="fas fa-map-marker-alt"></i> Địa chỉ thường trú</label>
                                    {isEditing ? (
                                        <input className="edit-input" value={editData.address} onChange={e => setEditData({...editData, address: e.target.value})} />
                                    ) : (
                                        <div className="info-value">{profileData?.address || 'Chưa cập nhật'}</div>
                                    )}
                                </div>
                            </div>

                            <div className="card-header mt-4">
                                <h3><i className="fas fa-clock"></i> Cấu hình làm việc</h3>
                            </div>
                            <div className="work-config-grid">
                                <div className="config-item">
                                    <span className="title">Giờ vào ca</span>
                                    <span className="time-val">{profileData?.department?.start_time || '08:00'}</span>
                                </div>
                                <div className="config-item">
                                    <span className="title">Giờ tan ca</span>
                                    <span className="time-val">{profileData?.department?.end_time || '17:00'}</span>
                                </div>
                                <div className="config-item">
                                    <span className="title">Vị trí GPS cơ quan</span>
                                    <span className="gps-val">{profileData?.department?.latitude ? 'Đã cấu hình' : 'Chưa cấu hình'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* MODAL ĐỔI MẬT KHẨU (GIỮ NGUYÊN) */}
            {showPassModal && (
                <div className="modal-overlay">
                    <div className="modal-content animate-zoom">
                        <h2><i className="fas fa-lock"></i> Đổi mật khẩu</h2>
                        <form onSubmit={handleChangePass}>
                            <div className="form-group">
                                <label>Mật khẩu hiện tại</label>
                                <input type="password" required value={passData.current_password} onChange={e => setPassData({...passData, current_password: e.target.value})} min='6'/>
                            </div>
                            <div className="form-group">
                                <label>Mật khẩu mới</label>
                                <input type="password" required value={passData.new_password} onChange={e => setPassData({...passData, new_password: e.target.value})} min='6'/>
                            </div>
                            <div className="form-group">
                                <label>Xác nhận mật khẩu mới</label>
                                <input type="password" required value={passData.new_password_confirmation} onChange={e => setPassData({...passData, new_password_confirmation: e.target.value})} min='6'/>
                            </div>  
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowPassModal(false)}>Hủy</button>
                                <button type="submit" className="btn-confirm" disabled={isLoading}>Cập nhật mật khẩu</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;