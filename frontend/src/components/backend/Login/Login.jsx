import React, { useContext, useState } from 'react';
import './login.scss';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/Auth';

const Login = () => {
    const {login} = useContext(AuthContext)
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        mode: 'onChange'
    });

    const onSubmit = async (data) => {

        const res = await fetch('http://127.0.0.1:8000/api/authenticate', {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if(result.status == false) {
            toast.error(result.message)
        } else {
            // 1. Tạo object chứa thông tin user (không nên để token ở đây để dễ quản lý)
            const userData = {
                id: result.id,
                name: result.name,
                role: result.role,
                avatar: result.avatar, 
                department_id: result.department_id,
                department: result.department,
                position: result.position,
                can_create_notification: result.can_create_notification,
            };

            // 2. Gọi hàm login từ AuthContext 
            // Truyền cả userData và token vào (để AuthContext tự lưu vào localStorage)
            login(userData, result.token); 

            toast.success("Đăng nhập thành công!");
            if (result.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/user/attendance');
            }  
        }
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    }

    return (
        <div className="container">
            <div className="login-container">
                <div className="login-header">
                    <div className="login-icon">🔐</div>
                    <h1>Đăng Nhập</h1>
                    <p>Hệ Thống Chấm Công Khuôn Mặt</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-group">
                        <label htmlFor="email">Email đăng nhập</label>
                        <input 
                            type="text" 
                            id="email" 
                            placeholder="Nhập email đăng nhập" 
                            {...register("email", { 
                                required: "Email đăng nhập là bắt buộc",
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Địa chỉ email không hợp lệ"
                                }})
                            } 
                        />
                        {errors.email && (
                            <span className="error-message">{errors.email?.message}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Mật khẩu</label>
                        <div className="password-input-group">
                          <input 
                              type={showPassword ? 'text' : 'password'}
                              id="password" 
                              placeholder="Nhập mật khẩu"
                              {...register("password", {
                                required: "Mật khẩu là bắt buộc",
                                minLength: {
                                    value: 6,
                                    message: "Mật khẩu phải có ít nhất 6 ký tự"
                                }})
                              }
                          />
                          <button
                              type="button"
                              className="btn-toggle-password"
                              onClick={togglePasswordVisibility}
                          >
                              {showPassword ? '🙈 Ẩn' : '👁️ Hiện'}
                          </button>
                        </div>
                        {errors.password && ( 
                            <span className="error-message">{errors.password?.message}</span>
                        )}
                    </div>

                    <button type="submit" className="btn-login">
                        Đăng Nhập
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;