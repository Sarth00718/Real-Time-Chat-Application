import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { upload } from "../middlewares/multer.js";
import {
  createGroup,
  getUserGroups,
  getGroupDetails,
  addGroupMembers,
  removeGroupMember,
  leaveGroup,
  updateGroup,
  uploadGroupPhoto
} from "../controllers/groupController.js";

const router = express.Router();

router.post("/create", isAuthenticated, createGroup);
router.get("/", isAuthenticated, getUserGroups);
router.get("/:groupId", isAuthenticated, getGroupDetails);
router.post("/:groupId/members", isAuthenticated, addGroupMembers);
router.delete("/:groupId/members/:memberId", isAuthenticated, removeGroupMember);
router.post("/:groupId/leave", isAuthenticated, leaveGroup);
router.put("/:groupId", isAuthenticated, updateGroup);
router.post("/:groupId/photo", isAuthenticated, upload.single('groupPhoto'), uploadGroupPhoto);

export default router;
