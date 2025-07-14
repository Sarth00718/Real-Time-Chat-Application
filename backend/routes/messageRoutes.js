import express from 'express';
import { sendMessage, getMessage } from '../controllers/messagecontroller.js';
import isAuthenticated from '../middlewares/auth.js';
import { uploadFiles } from '../middlewares/multer.js';

const router = express.Router();

router.route('/send/:id').post(isAuthenticated, uploadFiles, sendMessage);
router.route('/:id').get(isAuthenticated, getMessage);

export default router;
