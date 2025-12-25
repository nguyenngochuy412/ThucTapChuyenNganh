//Hàm hỗ trợ: Trích xuất Base64 từ DataURL
const extractBase64 = (dataURL) => {
    if (!dataURL || !dataURL.startsWith('data:')) return null;
    const commaIndex = dataURL.indexOf(',');
    return commaIndex === -1 ? null : dataURL.substring(commaIndex + 1);
};


//Hàm hỗ trợ: Tính dung lượng ảnh (Bytes)
const getDataURLSize = (dataURL) => {
    const base64 = extractBase64(dataURL);
    if (!base64) return 0;
    // Công thức tính dung lượng từ chuỗi Base64
    return Math.ceil((base64.length * 3) / 4);
};


// NÉN ẢNH: Giảm dung lượng và kích thước ảnh
export const compressImage = (dataURL, options = {}) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Calculate new dimensions
            let width = img.width;
            let height = img.height;
            
            const maxWidth = options.maxWidth || 1024;
            const maxHeight = options.maxHeight || 1024;
            const quality = options.quality || 0.8;
            
            // Maintain aspect ratio while resizing
            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width = Math.floor(width * ratio);
                height = Math.floor(height * ratio);
            }
            
            // Set canvas dimensions
            canvas.width = width;
            canvas.height = height;
            
            // Apply image smoothing
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            // Draw resized image
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert to DataURL with specified quality
            const compressedDataURL = canvas.toDataURL('image/jpeg', quality);
            
            resolve({
                dataURL: compressedDataURL,
                width,
                height,
                size: getDataURLSize(compressedDataURL),
                originalSize: getDataURLSize(dataURL),
                compressionRatio: (getDataURLSize(compressedDataURL) / getDataURLSize(dataURL)).toFixed(2)
            });
        };
        
        img.onerror = () => reject(new Error('Không thể load ảnh'));
        img.src = dataURL;
    });
};

// Add watermark to image
export const addWatermark = async (dataURL, watermarkText, options = {}) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set canvas to image size
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Draw original image
            ctx.drawImage(img, 0, 0);
            
            // Watermark settings
            const fontSize = options.fontSize || 20;
            const fontFamily = options.fontFamily || 'Arial';
            const color = options.color || 'rgba(255, 255, 255, 0.7)';
            const position = options.position || 'bottom-right';
            const padding = options.padding || 10;
            
            // Set font
            ctx.font = `${fontSize}px ${fontFamily}`;
            ctx.fillStyle = color;
            ctx.textAlign = 'right';
            ctx.textBaseline = 'bottom';
            
            // Calculate position
            let x, y;
            const textWidth = ctx.measureText(watermarkText).width;
            
            switch (position) {
                case 'top-left':
                    x = padding;
                    y = fontSize + padding;
                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'top';
                    break;
                case 'top-right':
                    x = canvas.width - padding;
                    y = fontSize + padding;
                    ctx.textAlign = 'right';
                    ctx.textBaseline = 'top';
                    break;
                case 'bottom-left':
                    x = padding;
                    y = canvas.height - padding;
                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'bottom';
                    break;
                case 'bottom-right':
                default:
                    x = canvas.width - padding;
                    y = canvas.height - padding;
                    ctx.textAlign = 'right';
                    ctx.textBaseline = 'bottom';
                    break;
            }
            
            // Add shadow for better visibility
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 3;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            
            // Draw watermark
            ctx.fillText(watermarkText, x, y);
            
            // Reset shadow
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            
            // Convert back to DataURL
            const watermarkedDataURL = canvas.toDataURL('image/jpeg', options.quality || 0.8);
            
            resolve(watermarkedDataURL);
        };
        
        img.onerror = () => reject(new Error('Không thể thêm watermark'));
        img.src = dataURL;
    });
};