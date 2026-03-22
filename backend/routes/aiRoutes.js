import express from 'express';
import { chatWithAI, streamChatWithAI } from '../controllers/aiController.js';
import isAuthenticated from '../middlewares/auth.js';
import { createRateLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// Rate limiter for AI endpoints (10 requests per minute)
const aiRateLimiter = createRateLimiter(10, 1);

// Regular chat endpoint
router.post('/chat', isAuthenticated, aiRateLimiter, chatWithAI);

// Streaming chat endpoint
router.post('/stream', isAuthenticated, aiRateLimiter, streamChatWithAI);

export default router;
