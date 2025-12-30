import { useState, useEffect, useCallback } from 'react';
import departmentApi from '../services/api/departmentApi';
import { toast } from 'react-toastify';

export const useDepartment = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchDepartments = useCallback(async () => {
        setLoading(true);
        try {
            const res = await departmentApi.getAll();
            setDepartments(res.data);
        } catch (error) {
            toast.error("Không thể tải danh sách phòng ban");
        } finally {
            setLoading(false);
        }
    }, []);

    const addDepartment = async (data) => {
        try {
            await departmentApi.create(data);
            toast.success("Thêm phòng ban thành công");
            fetchDepartments();
            return true;
        } catch (error) {
            toast.error("Lỗi khi thêm phòng ban");
            return false;
        }
    };

    const editDepartment = async (id, data) => {
        try {
            await departmentApi.update(id, data);
            toast.success("Cập nhật thành công");
            fetchDepartments();
            return true;
        } catch (error) {
            toast.error("Lỗi khi cập nhật");
            return false;
        }
    };

    const removeDepartment = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa phòng ban này?")) return;
        try {
            await departmentApi.delete(id);
            toast.success("Đã xóa phòng ban");
            fetchDepartments();
        } catch (error) {
            toast.error("Xóa thất bại");
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, [fetchDepartments]);

    return { departments, loading, addDepartment, editDepartment, removeDepartment, refresh: fetchDepartments };
};