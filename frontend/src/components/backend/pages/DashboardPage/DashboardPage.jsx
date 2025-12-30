import React, { useEffect } from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const DashboardPage = () => {
    const { stats, chartData, salaryData, loading, refreshStats } = useDashboard();
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0,
        }).format(value);
    };

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'];
    // Hiển thị trạng thái đang tải (Loading)
    if (loading) {
        return (
            <div className="dashboard-wrapper">
                <div style={{ padding: '20px', color: '#6366f1', fontWeight: 'bold' }}>
                    <span className="spinner"></span> Đang tải dữ liệu hệ thống...
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-wrapper">
            {/* Header Dashboard có nút làm mới dữ liệu */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: '#1e293b', margin: 0 }}>Tổng quan hệ thống</h2>
                <button 
                    onClick={refreshStats} 
                    style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer' }}
                >
                    🔄 Làm mới
                </button>
            </div>

            {/* Stats Cards - Dữ liệu thực từ API */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon blue">👥</div>
                    <div className="stat-info">
                        <span className="value">{stats.total_users || 0}</span>
                        <span className="label">Tổng nhân viên</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon green">✅</div>
                    <div className="stat-info">
                        <span className="value">{stats.today_attendance || 0}</span>
                        <span className="label">Đã đi làm hôm nay</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon orange">📝</div>
                    <div className="stat-info">
                        <span className="value">{stats.department_active || 0}</span>
                        <span className="label">Phòng ban đang hoạt động</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon purple">📢</div>
                    <div className="stat-info">
                        <span className="value">{stats.total_notifications || 0}</span>
                        <span className="label">Thông báo đã gửi</span>
                    </div>
                </div>
            </div>

            {/* Báo cáo tóm tắt */}
            <div className="admin-card" style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>📊 Tình trạng vận hành</h3>
                <p style={{ color: '#64748b', margin: 0, lineHeight: '1.6' }}>
                    Hôm nay đã ghi nhận <strong>{stats.today_attendance}</strong> lượt chấm công. 
                    {stats.pending_requests > 0 ? (
                        <span style={{ color: '#ef4444' }}> Hiện có {stats.pending_requests} đơn từ đang chờ bạn phê duyệt.</span>
                    ) : (
                        " Mọi đơn từ đã được xử lý xong."
                    )}
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '20px', marginTop: '20px' }}>
                
                {/* Biểu đồ xu hướng (Area Chart) */}
                <div className="admin-card" style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '1.1rem' }}>📈 Xu hướng đi làm (7 ngày)</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" name="Nhân viên" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Biểu đồ lương (Bar Chart) */}
                <div className="admin-card" style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '1.1rem' }}>💰 Quỹ lương theo phòng ban</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={salaryData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="department" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} tickFormatter={(v) => `${v/1000000}Tr`} />
                                <Tooltip 
                                    cursor={{fill: '#f8fafc'}}
                                    formatter={(value) => [formatCurrency(value), "Tổng lương"]}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="total_salary" radius={[6, 6, 0, 0]} barSize={40}>
                                    {salaryData?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;