import React, { useState } from 'react';
import { useManagement } from '../../hooks/useManagement';
import './UserManagementPage.scss';

const INITIAL_FORM = {
    name: '', email: '', password: '', department_id: '',
    position_id: '', phone: '', birth_date: '', address: '',
    hire_date: new Date().toISOString().split('T')[0],
    role: 'employee', is_active: true
};

const UserManagementPage = () => {
    const { users, metaData, loading, filters, setFilters, handleDelete, handleCreate, handleUpdate } = useManagement();
    
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [errors, setErrors] = useState({});

    // Mở modal để sửa
    const openEditModal = (user) => {
        setIsEdit(true);
        setCurrentId(user.id);
        setFormData({
            ...user,
            password: '', // Không hiện mật khẩu cũ
            department_id: user.department_id || '',
            position_id: user.position_id || ''
        });
        setErrors({});
        setShowModal(true);
    };

    // Mở modal để thêm mới
    const openAddModal = () => {
        setIsEdit(false);
        setFormData(INITIAL_FORM);
        setErrors({});
        setShowModal(true);
    };

    const validateForm = () => {
        let tempErrors = {};
        if (!formData.name) tempErrors.name = "Tên không được để trống";
        if (!formData.email) tempErrors.email = "Email không được để trống";
        if (!isEdit && !formData.password) tempErrors.password = "Mật khẩu là bắt buộc";
        if (!formData.department_id) tempErrors.department_id = "Chọn phòng ban";
        if (!formData.position_id) tempErrors.position_id = "Chọn chức vụ";
        
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const success = isEdit 
            ? await handleUpdate(currentId, formData)
            : await handleCreate(formData);

        if (success) setShowModal(false);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <div className="user-management-container">
            <div className="admin-card">
                <div className="card-header-flex">
                    <div className="title-group">
                        <h3>Danh sách nhân viên</h3>
                        <p>Tổng số: {users.length} nhân sự</p>
                    </div>
                    <button className="btn-add" onClick={openAddModal}>
                        <span className="icon">+</span> Thêm nhân viên
                    </button>
                </div>

                {/* Filter Row */}
                <div className="filter-row">
                    <div className="search-wrapper">
                        <input 
                            type="text" 
                            placeholder="Tìm tên, email, SĐT..." 
                            value={filters.search}
                            onChange={(e) => setFilters({...filters, search: e.target.value})}
                        />
                    </div>
                    <select value={filters.department_id} onChange={(e) => setFilters({...filters, department_id: e.target.value})}>
                        <option value="">Tất cả phòng ban</option>
                        {metaData.departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>

                    <div className="select-wrapper">
                        <select 
                            value={filters.position_id}
                            onChange={(e) => setFilters({...filters, position_id: e.target.value})}
                        >
                            <option value="">Tất cả chức vụ</option>
                            {metaData.positions.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="table-responsive">
                    {loading ? <div className="loader">Đang tải...</div> : (
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th>NHÂN VIÊN</th>
                                    <th>PHÒNG BAN</th>
                                    <th>CHỨC VỤ</th>
                                    <th>TRẠNG THÁI</th>
                                    <th className="text-center">THAO TÁC</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id}>
                                        <td>
                                            <div className="user-cell">
                                                <div className="avatar-circle">{u.name.charAt(0)}</div>
                                                <div className="user-info">
                                                    <div className="name">{u.name}</div>
                                                    <div className="email">{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className="dept-tag">{u.department?.name}</span></td>
                                        <td>{u.position?.name}</td>
                                        <td>
                                            <span className={`status-badge ${u.is_active ? 'active' : 'inactive'}`}>
                                                {u.is_active ? 'Đang làm việc' : 'Đã nghỉ'}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <div className="action-btns">
                                                <button className="btn-edit" onClick={() => openEditModal(u)}>✏️</button>
                                                <button className="btn-delete" onClick={() => handleDelete(u.id)}>🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Reusable Modal for Add & Edit */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content animate-zoom">
                        <div className="modal-header">
                            <h3>{isEdit ? '📝 Chỉnh sửa nhân viên' : '🚀 Thêm nhân viên mới'}</h3>
                            <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Họ và tên *</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} className={errors.name ? 'error' : ''} />
                                    {errors.name && <span className="err-msg">{errors.name}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Email *</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} className={errors.email ? 'error' : ''} />
                                    {errors.email && <span className="err-msg">{errors.email}</span>}
                                </div>
                                <div className="form-group">
                                    <label>{isEdit ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu *'}</label>
                                    <input type="password" name="password" value={formData.password} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Phòng ban *</label>
                                    <select name="department_id" value={formData.department_id} onChange={handleChange}>
                                        <option value="">Chọn phòng ban</option>
                                        {metaData.departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                    {errors.department_id && <span className="err-msg">{errors.department_id}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Chức vụ *</label>
                                    <select name="position_id" value={formData.position_id} onChange={handleChange}>
                                        <option value="">Chọn chức vụ</option>
                                        {metaData.positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Vai trò</label>
                                    <select name="role" value={formData.role} onChange={handleChange}>
                                        <option value="employee">Nhân viên</option>
                                        <option value="admin">Quản trị viên</option>
                                    </select>
                                </div>

                                <div className="form-group checkbox-inline-wrapper">
                                    <label className="checkbox-container">
                                        <input 
                                            type="checkbox" 
                                            name="is_active" 
                                            id="is_active" 
                                            checked={formData.is_active} 
                                            onChange={handleChange} 
                                        />
                                        <span className="checkmark"></span>
                                        <span className="label-text">Kích hoạt tài khoản</span>
                                    </label>
                                </div>

                                {/* Địa chỉ chiếm trọn 1 hàng (2 cột) */}
                                <div className="form-group full-width">
                                    <label>Địa chỉ thường trú</label>
                                    <textarea 
                                        name="address" 
                                        rows="3" 
                                        value={formData.address} 
                                        onChange={handleChange} 
                                        placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                                    ></textarea>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                                <button type="submit" className="btn-primary">{isEdit ? 'Lưu thay đổi' : 'Tạo nhân viên'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagementPage;