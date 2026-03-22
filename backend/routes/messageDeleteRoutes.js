import express from 'express';
import { deleteMessageForMe, deleteMessageForEveryone } from '../controllers/messageDeleteController.js';
import isAuthenticated from '../middlewares/auth.js';

const router = express.Router();

// Delete message for me
router.route('/delete/:messageId').delete(isAuthenticated, deleteMessageForMe);

// Delete message for everyone
router.route('/delete-for-everyone/:messageId').delete(isAuthenticated, deleteMessageForEveryone);

export default router;
