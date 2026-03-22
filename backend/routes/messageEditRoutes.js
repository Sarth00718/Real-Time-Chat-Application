import express from 'express';
import { editMessage } from '../controllers/messageEditController.js';
import isAuthenticated from '../middlewares/auth.js';

const router = express.Router();

// Edit message
router.route('/edit/:messageId').put(isAuthenticated, editMessage);

export default router;
