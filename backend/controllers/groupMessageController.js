import { Message } from "../models/messagemodel.js";
import { Group } from "../models/groupmodel.js";
import { validateObjectId, sanitizeInput } from "../utils/validation.js";
import { io, getRecieverSocketId } from "../socket/socket.js";
import cloudinary from "../config/cloudinary.js";

// Send message to group
export const sendGroupMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    let { message, replyToId } = req.body;
    const senderId = req.id;

    if (!validateObjectId(groupId)) {
      return res.status(400).json({ error: "Invalid group ID" });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if sender is a member
    const isMember = group.members.some(m => m.userId.toString() === senderId);
    if (!isMember) {
      return res.status(403).json({ error: "You are not a member of this group" });
    }

    // Sanitize message
    if (message) {
      message = sanitizeInput(message);
    }

    // Upload files if any
    let fileUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'group_messages',
          resource_type: 'auto'
        });
        fileUrls.push(result.secure_url);
      }
    }

    // Handle reply
    let replyTo = null;
    if (replyToId && validateObjectId(replyToId)) {
      const replyMessage = await Message.findById(replyToId);
      if (replyMessage) {
        replyTo = {
          messageId: replyMessage._id,
          senderId: replyMessage.senderId,
          message: replyMessage.message,
          messageType: replyMessage.messageType
        };
      }
    }

    // Create message
    const newMessage = await Message.create({
      senderId,
      groupId,
      message,
      files: fileUrls,
      messageType: fileUrls.length > 0 ? 'file' : 'text',
      replyTo
    });

    group.messages.push(newMessage._id);
    await group.save();

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('senderId', 'fullName username profilePhoto')
      .populate('replyTo.senderId', 'fullName username');

    // Emit to all group members
    group.members.forEach(member => {
      const socketId = getRecieverSocketId(member.userId.toString());
      if (socketId) {
        io.to(socketId).emit('newGroupMessage', {
          groupId,
          message: populatedMessage
        });
      }
    });

    return res.status(200).json({ message: populatedMessage });
  } catch (error) {
    console.error("sendGroupMessage error:", error);
    return res.status(500).json({ error: "Failed to send message" });
  }
};

// Get group messages
export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.id;

    if (!validateObjectId(groupId)) {
      return res.status(400).json({ error: "Invalid group ID" });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if user is a member
    const isMember = group.members.some(m => m.userId.toString() === userId);
    if (!isMember) {
      return res.status(403).json({ error: "You are not a member of this group" });
    }

    const messages = await Message.find({
      groupId,
      deletedForEveryone: false,
      deletedFor: { $ne: userId }
    })
      .populate('senderId', 'fullName username profilePhoto')
      .populate('replyTo.senderId', 'fullName username')
      .populate('forwardedFrom.originalSenderId', 'fullName username')
      .sort({ createdAt: 1 });

    return res.status(200).json({ messages });
  } catch (error) {
    console.error("getGroupMessages error:", error);
    return res.status(500).json({ error: "Failed to fetch messages" });
  }
};
