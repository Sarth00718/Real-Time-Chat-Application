import multer from 'multer';

// Use memory storage for cloud deployments
// Files are stored in memory as Buffer objects and uploaded to Cloudinary
const storage = multer.memoryStorage();

// File filter for images only
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'), false);
    }
};

export const uploadProfilePhoto = multer({
    storage,
    limits: { 
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter
}).single('profilePhoto');

// Error handling middleware
export const handleProfileUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
                error: 'File too large. Maximum file size is 5MB.' 
            });
        }
        return res.status(400).json({ 
            error: `Upload error: ${err.message}` 
        });
    }
    
    if (err) {
        return res.status(400).json({ 
            error: err.message || 'File upload failed' 
        });
    }
    
    next();
};
