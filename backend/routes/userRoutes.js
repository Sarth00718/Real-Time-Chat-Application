import express from 'express';
import isAuthenticated from '../middlewares/auth.js';
import { authLimiter } from '../middlewares/rateLimiter.js';
import { bruteForceProtection } from '../middlewares/security.js';
import { validate, registerSchema, loginSchema } from '../utils/validation.js';
import { uploadProfilePhoto as uploadPhoto, handleProfileUploadError } from '../middlewares/profileUpload.js';
import { register, login, logout, getOtherUsers } from '../controllers/usercontroller.js';
import { uploadProfilePhoto } from '../controllers/profileController.js';

const router = express.Router();

// Apply rate limiting and validation to auth routes
router.route('/register').post(
    authLimiter, 
    validate(registerSchema),
    register
);

router.route('/login').post(
    authLimiter, 
    bruteForceProtection,
    validate(loginSchema),
    login
);

router.route('/logout').get(logout);
router.route('/').get(isAuthenticated, getOtherUsers);

// Profile photo upload
router.route('/upload-profile-photo').post(
    isAuthenticated, 
    uploadPhoto, 
    handleProfileUploadError, 
    uploadProfilePhoto
);

export default router;