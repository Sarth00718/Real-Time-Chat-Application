import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { pinMessage, unpinMessage, getPinnedMessages } from "../controllers/messagePinController.js";

const router = express.Router();

router.post("/:messageId/pin", isAuthenticated, pinMessage);
router.delete("/:messageId/pin", isAuthenticated, unpinMessage);
router.get("/pinned/:chatId", isAuthenticated, getPinnedMessages);

export default router;
