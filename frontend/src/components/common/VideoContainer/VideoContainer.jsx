import React from 'react';
import './VideoContainer.scss';

const VideoContainer = ({ isCameraActive, videoRef }) => {
    return (
        <div className="video-container">
            {/* 1. Video stream */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                // Sử dụng class video-feed và thêm class active/inactive dựa trên state
                className={`video-feed ${isCameraActive ? 'active' : 'inactive'}`}
            />
            
            {/* 2. Hiệu ứng khung quét mặt (Thêm vào để app chuyên nghiệp hơn) */}
            {isCameraActive && <div className="scanning-overlay"></div>}
            
            {/* 3. Placeholder khi chưa bật camera */}
            {!isCameraActive && (
                <div className="video-placeholder">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15 8v8H5V8h10zm1-2H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4V7c0-.55-.45-1-1-1z"/>
                    </svg>
                    <p>Camera đang tắt</p>
                </div>
            )}
        </div>
    );
};

export default VideoContainer;