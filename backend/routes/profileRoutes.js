import express from 'express';
import { uploadProfilePhoto, updateProfile } from '../controllers/profileController.js';
import isAuthenticated from '../middlewares/auth.js';
import { uploadProfilePhoto as uploadMiddleware } from '../middlewares/profileUpload.js';

const router = express.Router();

router.post('/upload-photo', isAuthenticated, uploadMiddleware, uploadProfilePhoto);
router.put('/update', isAuthenticated, updateProfile);

export default router;
