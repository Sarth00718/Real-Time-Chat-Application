import multer from 'multer';
import path from 'path';

import os from 'os';

// Use disk storage to temporary directory so Cloudinary upload endpoints have a valid file path
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, os.tmpdir());
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter to validate file types
const fileFilter = (req, file, cb) => {
    // Allowed file types
    const allowedMimeTypes = [
        // Images
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        // Documents
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        // Videos
        'video/mp4',
        'video/avi',
        'video/mov',
        'video/quicktime',
        // Archives
        'application/zip',
        'application/x-rar-compressed',
        // Audio
        'audio/mpeg',
        'audio/wav',
        'audio/webm',
        'audio/ogg'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type: ${file.mimetype}. Only images, documents, videos, audio, and archives are allowed.`), false);
    }
};

export const uploadFiles = multer({
    storage,
    limits: { 
        fileSize: 10 * 1024 * 1024, // 10MB limit per file
        files: 5 // Maximum 5 files
    },
    fileFilter
}).array('files', 5); // Max 5 files with field name 'files'

// Single file upload for profile/group photos
export const upload = multer({
    storage,
    limits: { 
        fileSize: 5 * 1024 * 1024 // 5MB limit for photos
    },
    fileFilter: (req, file, cb) => {
        const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedImageTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images are allowed.'), false);
        }
    }
});

// Voice message upload
export const uploadVoice = multer({
    storage,
    limits: { 
        fileSize: 5 * 1024 * 1024 // 5MB limit for voice messages
    },
    fileFilter: (req, file, cb) => {
        const allowedAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg'];
        if (allowedAudioTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only audio files are allowed.'), false);
        }
    }
}).single('voice');

// Error handling middleware for multer
export const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
                error: 'File too large. Maximum file size is 10MB.' 
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ 
                error: 'Too many files. Maximum 5 files allowed.' 
            });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ 
                error: 'Unexpected field name. Use "files" as the field name.' 
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
