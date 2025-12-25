import { useState, useCallback } from 'react';
import locationApi from '../services/api/locationApi';

export const useLocation = () => {
    const [currentLocation, setCurrentLocation] = useState(null);
    const [address, setAddress] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const getCurrentLocation = useCallback(async () => {
        if (!navigator.geolocation) {
            const err = 'Trình duyệt không hỗ trợ định vị';
            setError(err);
            throw new Error(err);
        }

        setIsLoading(true);
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const coords = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                    setCurrentLocation(coords);
                    
                    // Lấy địa chỉ hiển thị
                    const info = await locationApi.reverseGeocode(coords.latitude, coords.longitude);
                    setAddress(info.address);
                    
                    setIsLoading(false);
                    resolve(coords);
                },
                (err) => {
                    setError('Không thể lấy vị trí');
                    setIsLoading(false);
                    reject(err);
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        });
    }, []);

    return { currentLocation, address, isLoading, error, getCurrentLocation };
};