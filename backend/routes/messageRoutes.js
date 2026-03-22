import express from 'express';
import { sendMessage, getMessage } from '../controllers/messagecontroller.js';
import isAuthenticated from '../middlewares/auth.js';
import { uploadFiles, handleMulterError } from '../middlewares/multer.js';
import { messageLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// Apply rate limiting to message sending
router.route('/send/:id').post(
    isAuthenticated, 
    messageLimiter, 
    uploadFiles, 
    handleMulterError, // Handle multer errors
    sendMessage
);
router.route('/:id').get(isAuthenticated, getMessage);

export default router;
