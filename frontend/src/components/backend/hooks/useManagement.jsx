import { useCallback, useEffect, useState } from "react";
import managementApi from "../services/api/managementApi";
import { toast } from "react-toastify";

export const useManagement = () => {
    const [users, setUsers] = useState([]);
    const [metaData, setMetaData] = useState({ departments: [], positions: [] });
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ search: '', department_id: '', position_id: '' });

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await managementApi.getUsers(filters);
            setUsers(res.data.data || res.data); // Tùy vào cấu trúc res của bạn
        } catch (error) {
            toast.error("Không thể tải danh sách nhân viên");
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        managementApi.getMetaData().then(res => setMetaData(res.data));
    }, []);

    useEffect(() => {
        const timeout = setTimeout(fetchUsers, 500);
        return () => clearTimeout(timeout);
    }, [fetchUsers]);

    const handleCreate = async (data) => {
        try {
            await managementApi.createUser(data);
            toast.success("Thêm thành công");
            fetchUsers();
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi thêm");
            return false;
        }
    };

    const handleUpdate = async (id, data) => {
        try {
            await managementApi.updateUser(id, data);
            toast.success("Cập nhật thành công");
            fetchUsers();
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi cập nhật");
            return false;
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Xác nhận xóa nhân viên này?")) return;
        try {
            await managementApi.deleteUser(id);
            toast.success("Đã xóa");
            fetchUsers();
        } catch (error) {
            toast.error("Xóa thất bại");
        }
    };

    return { users, metaData, loading, filters, setFilters, handleCreate, handleUpdate, handleDelete };
};