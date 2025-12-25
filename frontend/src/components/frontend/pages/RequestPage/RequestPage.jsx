import React, { useState } from 'react'
import Header from '../../main/Header';
import SideBar from '../../main/SideBar';
import './RequestPage.scss';

const RequestPage = () => {
  const [formData, setFormData] = useState({
        type: '',
        fromDate: '',
        toDate: '',
        reason: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submittedRequests, setSubmittedRequests] = useState([]); // Để trống để hiện giao diện "Chưa có đơn"

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.type || !formData.fromDate || !formData.toDate || !formData.reason) {
            toast.warning("Vui lòng điền đầy đủ thông tin!");
            return;
        }
        
        setIsSubmitting(true);
        // Giả lập gửi API
        setTimeout(() => {
            toast.success("Gửi đơn thành công!");
            setIsSubmitting(false);
            setFormData({ type: '', fromDate: '', toDate: '', reason: '' });
        }, 1500);
    };

    return (
        <div className="request-page-container">
            <Header />
            <div className="main-content-layout">
                <SideBar activePage="requests" />
                <main className="request-main-area">
                    <div className="glass-card request-card">
                        <div className="card-header">
                            <div className="title-section">
                                <h1>📝 Gửi Đơn</h1>
                                <p>Tạo đơn xin nghỉ phép, đi muộn hoặc làm thêm giờ</p>
                            </div>
                        </div>

                        <form className="request-form" onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Loại đơn</label>
                                    <select name="type" value={formData.type} onChange={handleChange}>
                                        <option value="">-- Chọn loại đơn --</option>
                                        <option value="leave">Nghỉ phép</option>
                                        <option value="late">Đi muộn / Về sớm</option>
                                        <option value="ot">Làm thêm giờ (OT)</option>
                                        <option value="business">Công tác</option>
                                    </select>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Từ ngày</label>
                                        <input 
                                            type="date" 
                                            name="fromDate" 
                                            value={formData.fromDate} 
                                            onChange={handleChange} 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Đến ngày</label>
                                        <input 
                                            type="date" 
                                            name="toDate" 
                                            value={formData.toDate} 
                                            onChange={handleChange} 
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Lý do</label>
                                    <textarea 
                                        name="reason" 
                                        rows="4" 
                                        placeholder="Nhập lý do chi tiết..."
                                        value={formData.reason}
                                        onChange={handleChange}
                                    ></textarea>
                                </div>
                            </div>

                            <button type="submit" className={`btn-submit ${isSubmitting ? 'loading' : ''}`} disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <span className="spinner"></span>
                                ) : (
                                    <><i className="fas fa-paper-plane"></i> Gửi Đơn</>
                                )}
                            </button>
                        </form>

                        <div className="history-divider">
                            <span>📋 Đơn Đã Gửi</span>
                        </div>

                        <div className="submitted-section">
                            {submittedRequests.length > 0 ? (
                                <div className="request-table-wrapper">
                                    {/* Map dữ liệu đơn ở đây nếu có */}
                                </div>
                            ) : (
                                <div className="empty-history">
                                    <div className="empty-icon">
                                        <i className="far fa-file-alt"></i>
                                    </div>
                                    <p>Chưa có đơn nào được gửi</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default RequestPage;