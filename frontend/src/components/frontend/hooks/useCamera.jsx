import { useState, useRef, useCallback, useEffect } from 'react';

export const useCamera = () => {
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    
    const [isActive, setIsActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [devices, setDevices] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState('');
    
    const getCameraDevices = useCallback(async () => {
        try {
            const allDevices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
            setDevices(videoDevices);
            if (videoDevices.length > 0 && !selectedDeviceId) {
                setSelectedDeviceId(videoDevices[0].deviceId);
            }
            return videoDevices;
        } catch (err) {
            return [];
        }
    }, [selectedDeviceId]);
    
    const start = useCallback(async (deviceId = selectedDeviceId) => {
        try {
            setIsLoading(true);
            setError(null);
            const constraints = {
                video: {
                    deviceId: deviceId ? { exact: deviceId } : undefined,
                    facingMode: 'user', // Ưu tiên camera trước
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;
            if (videoRef.current) videoRef.current.srcObject = stream;
            setIsActive(true);
            setIsLoading(false);
            return stream;
        } catch (err) {
            setError('Không thể truy cập camera.');
            setIsLoading(false);
            throw err;
        }
    }, [selectedDeviceId]);
    
    const stop = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) videoRef.current.srcObject = null;
        setIsActive(false);
    }, []);

    const captureImage = useCallback(() => {
        return new Promise((resolve, reject) => {
            if (!videoRef.current || !isActive) {
                reject(new Error('Camera chưa được bật'));
                return;
            }
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const context = canvas.getContext('2d');
            context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            // Trả về ảnh gốc chất lượng cao nhất để imageService xử lý
            resolve(canvas.toDataURL('image/jpeg', 1.0));
        });
    }, [isActive]);
    
    useEffect(() => {
        getCameraDevices();
        return () => stop();
    }, [getCameraDevices, stop]);
    
    return {
        videoRef, isActive, isLoading, error, devices,
        start, stop, captureImage, hasCamera: devices.length > 0
    };
};