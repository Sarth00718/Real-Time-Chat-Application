import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { uploadVoice } from "../middlewares/multer.js";
import { sendVoiceMessage } from "../controllers/voiceMessageController.js";

const router = express.Router();

router.post("/voice", isAuthenticated, uploadVoice, sendVoiceMessage);

export default router;
