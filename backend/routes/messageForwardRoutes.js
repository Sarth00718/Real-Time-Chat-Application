import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { forwardMessage } from "../controllers/messageForwardController.js";

const router = express.Router();

router.post("/:messageId/forward", isAuthenticated, forwardMessage);

export default router;
