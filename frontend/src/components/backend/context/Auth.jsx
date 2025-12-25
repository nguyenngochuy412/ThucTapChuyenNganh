import { createContext, useEffect, useState } from "react";
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = () => {
            try {
                const userInfo = localStorage.getItem('userInfo');
                const token = localStorage.getItem('token'); // Lấy thêm token
                if (userInfo && token) {
                    const parsedUser = JSON.parse(userInfo);
                    setUser(parsedUser);
                } else {
                    // Nếu thiếu 1 trong 2 thì xóa sạch để đảm bảo an toàn
                    localStorage.removeItem('userInfo');
                    localStorage.removeItem('token');
                }
            } catch (error) {
                console.error('Error loading user:', error);
                localStorage.removeItem('userInfo');
            } finally {
                setLoading(false); // ← Kết thúc loading
            }
        };

        loadUser();
    }, []);

    const login = (userData, token) => {
        localStorage.setItem('userInfo', JSON.stringify(userData));
        localStorage.setItem('token', token); // Lưu token riêng để API sử dụng
        setUser(userData);
    }

    const logout = () => {
        localStorage.removeItem('userInfo');
        localStorage.removeItem('token');
        setUser(null);
    }

    return(
        <AuthContext.Provider value= {{
            user, 
            login, 
            logout,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    )
}