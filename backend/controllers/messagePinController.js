import { Message } from "../models/messagemodel.js";
import { Group } from "../models/groupmodel.js";
import { Conversation } from "../models/conversationmodel.js";
import { validateObjectId } from "../utils/validation.js";
import { io, getRecieverSocketId } from "../socket/socket.js";

// Pin a message
export const pinMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.id;

    if (!validateObjectId(messageId)) {
      return res.status(400).json({ error: "Invalid message ID" });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Check if it's a group message
    if (message.groupId) {
      const group = await Group.findById(message.groupId);
      if (!group) {
        return res.status(404).json({ error: "Group not found" });
      }

      // Check if user is admin
      const userMember = group.members.find(m => m.userId.toString() === userId);
      if (!userMember || userMember.role !== 'admin') {
        return res.status(403).json({ error: "Only admins can pin messages" });
      }

      message.isPinned = true;
      message.pinnedAt = new Date();
      message.pinnedBy = userId;
      await message.save();

      if (!group.pinnedMessages.includes(messageId)) {
        group.pinnedMessages.push(messageId);
        await group.save();
      }

      // Notify all group members
      group.members.forEach(member => {
        const socketId = getRecieverSocketId(member.userId.toString());
        if (socketId) {
          io.to(socketId).emit('messagePinned', { messageId, groupId: group._id });
        }
      });
    } else {
      // For direct messages, only sender or receiver can pin
      if (message.senderId.toString() !== userId && message.receiverId.toString() !== userId) {
        return res.status(403).json({ error: "You cannot pin this message" });
      }

      message.isPinned = true;
      message.pinnedAt = new Date();
      message.pinnedBy = userId;
      await message.save();

      // Notify the other user
      const otherUserId = message.senderId.toString() === userId 
        ? message.receiverId.toString() 
        : message.senderId.toString();
      
      const socketId = getRecieverSocketId(otherUserId);
      if (socketId) {
        io.to(socketId).emit('messagePinned', { messageId });
      }
    }

    return res.status(200).json({ message: "Message pinned successfully" });
  } catch (error) {
    console.error("pinMessage error:", error);
    return res.status(500).json({ error: "Failed to pin message" });
  }
};

// Unpin a message
export const unpinMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.id;

    if (!validateObjectId(messageId)) {
      return res.status(400).json({ error: "Invalid message ID" });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Check if it's a group message
    if (message.groupId) {
      const group = await Group.findById(message.groupId);
      if (!group) {
        return res.status(404).json({ error: "Group not found" });
      }

      // Check if user is admin
      const userMember = group.members.find(m => m.userId.toString() === userId);
      if (!userMember || userMember.role !== 'admin') {
        return res.status(403).json({ error: "Only admins can unpin messages" });
      }

      message.isPinned = false;
      message.pinnedAt = null;
      message.pinnedBy = null;
      await message.save();

      group.pinnedMessages = group.pinnedMessages.filter(id => id.toString() !== messageId);
      await group.save();

      // Notify all group members
      group.members.forEach(member => {
        const socketId = getRecieverSocketId(member.userId.toString());
        if (socketId) {
          io.to(socketId).emit('messageUnpinned', { messageId, groupId: group._id });
        }
      });
    } else {
      // For direct messages
      if (message.senderId.toString() !== userId && message.receiverId.toString() !== userId) {
        return res.status(403).json({ error: "You cannot unpin this message" });
      }

      message.isPinned = false;
      message.pinnedAt = null;
      message.pinnedBy = null;
      await message.save();

      // Notify the other user
      const otherUserId = message.senderId.toString() === userId 
        ? message.receiverId.toString() 
        : message.senderId.toString();
      
      const socketId = getRecieverSocketId(otherUserId);
      if (socketId) {
        io.to(socketId).emit('messageUnpinned', { messageId });
      }
    }

    return res.status(200).json({ message: "Message unpinned successfully" });
  } catch (error) {
    console.error("unpinMessage error:", error);
    return res.status(500).json({ error: "Failed to unpin message" });
  }
};

// Get pinned messages
export const getPinnedMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { isGroup } = req.query;
    const userId = req.id;

    if (!validateObjectId(chatId)) {
      return res.status(400).json({ error: "Invalid chat ID" });
    }

    let pinnedMessages;

    if (isGroup === 'true') {
      const group = await Group.findById(chatId);
      if (!group) {
        return res.status(404).json({ error: "Group not found" });
      }

      // Check if user is a member
      const isMember = group.members.some(m => m.userId.toString() === userId);
      if (!isMember) {
        return res.status(403).json({ error: "You are not a member of this group" });
      }

      pinnedMessages = await Message.find({
        _id: { $in: group.pinnedMessages },
        deletedForEveryone: false
      })
        .populate('senderId', 'fullName username profilePhoto')
        .populate('pinnedBy', 'fullName username')
        .sort({ pinnedAt: -1 });
    } else {
      pinnedMessages = await Message.find({
        $or: [
          { senderId: userId, receiverId: chatId },
          { senderId: chatId, receiverId: userId }
        ],
        isPinned: true,
        deletedForEveryone: false,
        deletedFor: { $ne: userId }
      })
        .populate('senderId', 'fullName username profilePhoto')
        .populate('pinnedBy', 'fullName username')
        .sort({ pinnedAt: -1 });
    }

    return res.status(200).json({ pinnedMessages });
  } catch (error) {
    console.error("getPinnedMessages error:", error);
    return res.status(500).json({ error: "Failed to fetch pinned messages" });
  }
};
