import React, { useContext, useState } from 'react'
import { AuthContext } from '../../backend/context/Auth';
import requestApi from '../services/api/requestApi';

export default function useRequest() {
    const {user} = useContext(AuthContext);
    const [categories, setCategories] = useState([]);
    const [recipients, setRecipients] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);

    const loadCategories = async () => {
        if (!user) return ;
        try {
            // Gọi API để lấy thông báo của user
            const res = await requestApi.getCategories();
            setCategories(res || []);
        } catch (err) {
            console.error(err);
        }
    };

    const loadUser = async() => {
        if(!user) return ;
        try {
            const res = await requestApi.getUsers();
            setRecipients(res || []);
        } catch(err) {
            console.error(err);
        }
    };

    const loadSentRequests = async() => {
        if(!user) return ;
        try {
            const res = await requestApi.getSentRequests();
            setSentRequests(res || []);
        } catch (err) {
            console.error(err);
        }
    };


    const createRequest = async (requestData) => {
        if(!user) return ;
        try {
            const res = await requestApi.createRequest(requestData);
            return res;
        } catch(err) {
            console.error(err);
        }
    }


    return { recipients, categories, loadCategories, loadUser,sentRequests, loadSentRequests, createRequest }
}
