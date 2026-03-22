import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { upload } from "../middlewares/multer.js";
import { sendGroupMessage, getGroupMessages } from "../controllers/groupMessageController.js";

const router = express.Router();

router.post("/:groupId", isAuthenticated, upload.array('files', 5), sendGroupMessage);
router.get("/:groupId", isAuthenticated, getGroupMessages);

export default router;
