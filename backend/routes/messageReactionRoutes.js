import express from 'express';
import { addReaction, removeReaction } from '../controllers/messageReactionController.js';
import isAuthenticated from '../middlewares/auth.js';

const router = express.Router();

// Add or update reaction
router.route('/react/:messageId').post(isAuthenticated, addReaction);

// Remove reaction
router.route('/react/:messageId').delete(isAuthenticated, removeReaction);

export default router;
