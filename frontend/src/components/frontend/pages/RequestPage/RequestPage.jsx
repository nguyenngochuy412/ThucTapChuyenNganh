import React, { useEffect, useState } from 'react'
import Header from '../../main/Header';
import SideBar from '../../main/SideBar';
import './RequestPage.scss';
import { toast } from 'react-toastify';
import useRequest from '../../hooks/useRequest';

const RequestPage = () => {
  const [formData, setFormData] = useState({
        type: '',
        recipient_id: '',
        fromDate: '',
        toDate: '',
        reason: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submittedRequests, setSubmittedRequests] = useState([]); // Để trống để hiện giao diện "Chưa có đơn"

    const {
        categories,
        loadCategories,
        recipients,
        loadUser,
        loadSentRequests,
        sentRequests,
        createRequest
    } = useRequest();

    useEffect(() => {
        loadCategories();
        loadUser();
        loadSentRequests()
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async   (e) => {
        e.preventDefault();
        if (!formData.type || !formData.recipient_id || !formData.fromDate || !formData.toDate || !formData.reason) {
            toast.warning("Vui lòng điền đầy đủ thông tin!");
            return;
        }

        const toDay = new Date();
        const todayStr = toDay.toISOString().split('T')[0];

        console.log("Today:", todayStr, "FromDate:", formData.fromDate, "ToDate:", formData.toDate);

        if(formData.fromDate < todayStr) {
            toast.error("Ngày bắt đầu không được sau ngày hiện tại!");
            return;
        }
        
        if(formData.fromDate > formData.toDate) {
            toast.error("Ngày bắt đầu không được sau ngày kết thúc!");
            return;
        }

        const payload = {
            category_id: formData.type,
            recipient_id: formData.recipient_id,
            from_date: formData.fromDate,
            to_date: formData.toDate,
            reason: formData.reason
        };

        try {
        // Gọi API thật
            const response = await createRequest(payload);

            // 3. Hiển thị thông báo thành công
            toast.success(response?.message || "Gửi đơn thành công!");

            // 4. Reset form (Chỉ reset khi thành công)
            setFormData({
                type: '',
                recipient_id: '',
                fromDate: '',
                toDate: '',
                reason: '',
            });

            // 5. Cập nhật lại danh sách lịch sử (nếu hàm này tồn tại)
            await loadSentRequests(); 

        } catch (err) {
            // Xử lý lỗi từ Server (ví dụ: lỗi validation từ Laravel)
            const serverError = err.response?.data?.message || "Có lỗi xảy ra khi gửi đơn!";
            toast.error(serverError);
        } finally {
            setIsSubmitting(false); // Kết thúc trạng thái gửi
        }
        
        // 3. Reset form
        setFormData({
            type: '',
            recipient_id: '',
            fromDate: '',
            toDate: '',
            reason: '',
        });

        // 4. Cập nhật lại danh sách lịch sử
        // loadHistory(); 
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
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Loại đơn</label>
                                        <select name="type" value={formData.type} onChange={handleChange}>
                                            <option value="">-- Chọn loại đơn --</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Người nhận đơn (Người duyệt)</label>
                                        <select 
                                            name="recipient_id" 
                                            value={formData.recipient_id} 
                                            onChange={handleChange}
                                        >
                                            <option value="">-- Chọn người duyệt --</option>
                                            {recipients.map(user => (
                                                <option key={user.id} value={user.id}>
                                                    {user.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
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
                            {sentRequests && sentRequests.length > 0 ? (
                                <div className="request-list-wrapper">
                                    {sentRequests.map((req) => (
                                        <div key={req.id} className="sent-request-item glass-card">
                                            <div className="req-header">
                                                <div className="req-info">
                                                    <span className="req-category">[{req.category?.name}]</span>
                                                    <span className="req-recipient">Gửi tới: {req.recipient?.name}</span>
                                                </div>
                                                {/* Hiển thị trạng thái tiếng Việt */}
                                                <span className={`status-badge ${req.status}`}>
                                                    {req.status === 'pending' ? 'Chờ duyệt' : 
                                                    req.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
                                                </span>
                                            </div>
                                            
                                            <div className="req-body">
                                                <p className="req-reason"><strong>Lý do:</strong> {req.reason}</p>
                                                <div className="req-date-range">
                                                    <i className="far fa-calendar-alt"></i> {req.from_date} ➔ {req.to_date}
                                                </div>
                                            </div>

                                            <div className="req-footer">
                                                <small>Ngày gửi: {new Date(req.created_at).toLocaleString('vi-VN')}</small>
                                            </div>
                                        </div>
                                    ))}
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