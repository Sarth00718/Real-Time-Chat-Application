import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { upload } from "../middlewares/multer.js";
import { sendVoiceMessage } from "../controllers/voiceMessageController.js";

const router = express.Router();

router.post("/voice", isAuthenticated, upload.single('audio'), sendVoiceMessage);

export default router;
