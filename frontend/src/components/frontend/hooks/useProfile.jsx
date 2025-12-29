import { useState, useContext, useCallback } from 'react'; // Thêm useCallback
import { AuthContext } from '../../backend/context/Auth';
import profileApi from '../services/api/profileApi';
import { toast } from 'react-toastify';

export const useProfile = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const { user, updateUser } = useContext(AuthContext);

    const fetchProfile = useCallback(async () => {
        if (!user?.id) return;
        setIsLoading(true);
        try {
            const res = await profileApi.getProfile(user.id);
            setProfileData(res.data);
        } catch (error) {
            toast.error("Không thể tải thông tin nhân viên");
        } finally {
            setIsLoading(false);
        }
    }, [user?.id]);

    const updateProfile = async (data) => {
        setIsLoading(true);
        try {
            const res = await profileApi.updateProfile(data);
            const updatedUser = res.user; 
            if (updatedUser) {
                setProfileData(updatedUser); 
                updateUser(updatedUser);
                toast.success("Cập nhật thành công!");
                return updatedUser;
            }
        } catch (error) {
            const msg = error.response?.data?.message || "Lỗi cập nhật";
            toast.error(msg);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const changePassword = async (data) => {
        setIsLoading(true);
        try {
            await profileApi.changePassword(data);
            toast.success("Đổi mật khẩu thành công!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi đổi mật khẩu");
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return { profileData, fetchProfile, updateProfile, changePassword, isLoading };
};