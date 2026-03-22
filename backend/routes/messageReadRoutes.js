import express from 'express';
import { markMessagesAsRead, getUnreadCount, getUnreadCountPerUser } from '../controllers/messageReadController.js';
import isAuthenticated from '../middlewares/auth.js';

const router = express.Router();

// Mark messages as read
router.route('/read/:senderId').put(isAuthenticated, markMessagesAsRead);

// Get total unread count
router.route('/unread/count').get(isAuthenticated, getUnreadCount);

// Get unread count per user
router.route('/unread/per-user').get(isAuthenticated, getUnreadCountPerUser);

export default router;
