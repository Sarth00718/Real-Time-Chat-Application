import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        cb(null, file.originalname); 
    },
});

export const uploadFiles = multer({
    storage,
    limits: { fileSize: 1000 * 1024 * 1024 }, // 1GB limit
}).array('files');