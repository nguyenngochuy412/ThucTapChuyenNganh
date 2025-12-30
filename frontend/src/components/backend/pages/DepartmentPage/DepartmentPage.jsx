import React, { useState } from 'react';
import { useDepartment } from '../../hooks/useDepartment';

const INITIAL_FORM = { name: '', description: '', latitude: '', longitude: '', is_active: true };

const DepartmentPage = () => {
    const { departments, loading, addDepartment, editDepartment, removeDepartment } = useDepartment();
    
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [currentId, setCurrentId] = useState(null);

    // Mở modal thêm mới
    const handleOpenAdd = () => {
        setIsEdit(false);
        setFormData(INITIAL_FORM);
        setShowModal(true);
    };

    // Mở modal chỉnh sửa
    const handleOpenEdit = (dept) => {
        setIsEdit(true);
        setCurrentId(dept.id);
        setFormData({
            name: dept.name,
            description: dept.description,
            latitude: dept.latitude || '',
            longitude: dept.longitude || '',
            is_active: !!dept.is_active
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = isEdit 
            ? await editDepartment(currentId, formData)
            : await addDepartment(formData);
        
        if (success) setShowModal(false);
    };

    return (
        <div className="admin-page-content">
            <div className="admin-card">
                <div className="card-header-flex">
                    <div className="title-group">
                        <h3>Danh mục phòng ban</h3>
                        <p>Quản lý cơ cấu và vị trí chấm công ({departments.length})</p>
                    </div>
                    <button className="btn-add" onClick={handleOpenAdd}>
                        <span className="icon">+</span> Thêm phòng ban
                    </button>
                </div>

                <div className="table-responsive">
                    {loading ? <p>Đang tải...</p> : (
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th>TÊN PHÒNG BAN</th>
                                    <th>VỊ TRÍ (LAT/LON)</th>
                                    <th>NHÂN SỰ</th>
                                    <th>TRẠNG THÁI</th>
                                    <th className="text-center">THAO TÁC</th>
                                </tr>
                            </thead>
                            <tbody>
                                {departments.map(dept => (
                                    <tr key={dept.id}>
                                        <td>
                                            <div className="dept-info">
                                                <div className="name">{dept.name}</div>
                                                <div className="desc">{dept.description}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <small>{dept.latitude || 'N/A'}, {dept.longitude || 'N/A'}</small>
                                        </td>
                                        <td><span className="count-badge">{dept.users_count || 0} người</span></td>
                                        <td>
                                            <span className={`status-badge ${dept.is_active ? 'active' : 'inactive'}`}>
                                                {dept.is_active ? 'Hoạt động' : 'Khóa'}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <div className="action-btns">
                                                <button className="btn-edit" onClick={() => handleOpenEdit(dept)}>✏️</button>
                                                <button className="btn-delete" onClick={() => removeDepartment(dept.id)}>🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content animate-zoom">
                        <div className="modal-header">
                            <h3>{isEdit ? '📝 Sửa phòng ban' : '🏢 Thêm phòng ban'}</h3>
                            <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="admin-form">
                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <label>Tên phòng ban *</label>
                                    <input 
                                        type="text" required 
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Vĩ độ (Latitude)</label>
                                    <input 
                                        type="number" step="any"
                                        value={formData.latitude}
                                        onChange={e => setFormData({...formData, latitude: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Kinh độ (Longitude)</label>
                                    <input 
                                        type="number" step="any"
                                        value={formData.longitude}
                                        onChange={e => setFormData({...formData, longitude: e.target.value})}
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label>Mô tả chức năng</label>
                                    <textarea 
                                        rows="3"
                                        value={formData.description}
                                        onChange={e => setFormData({...formData, description: e.target.value})}
                                    ></textarea>
                                </div>
                                <div className="form-group checkbox-inline-wrapper">
                                    <label className="checkbox-container">
                                        <input 
                                            type="checkbox" 
                                            checked={formData.is_active}
                                            onChange={e => setFormData({...formData, is_active: e.target.checked})}
                                        />
                                        Kích hoạt phòng ban
                                    </label>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                                <button type="submit" className="btn-primary">Lưu dữ liệu</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DepartmentPage;