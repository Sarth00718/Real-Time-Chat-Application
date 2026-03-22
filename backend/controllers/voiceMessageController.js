import { Message } from "../models/messagemodel.js";
import { Conversation } from "../models/conversationmodel.js";
import { Group } from "../models/groupmodel.js";
import { validateObjectId } from "../utils/validation.js";
import { io, getRecieverSocketId } from "../socket/socket.js";
import cloudinary from "../config/cloudinary.js";

// Send voice message
export const sendVoiceMessage = async (req, res) => {
  try {
    const { receiverId, groupId } = req.body;
    const { duration, waveform } = req.body;
    const senderId = req.id;

    if (!req.file) {
      return res.status(400).json({ error: "No audio file uploaded" });
    }

    if (!receiverId && !groupId) {
      return res.status(400).json({ error: "Receiver or group ID is required" });
    }

    // Upload audio to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'video', // Cloudinary uses 'video' for audio files
      folder: 'voice_messages',
      format: 'mp3'
    });

    const voiceMessageData = {
      url: result.secure_url,
      duration: duration ? parseInt(duration) : 0,
      waveform: waveform ? JSON.parse(waveform) : []
    };

    let newMessage;

    if (groupId) {
      // Send to group
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

      newMessage = await Message.create({
        senderId,
        groupId,
        messageType: 'voice',
        voiceMessage: voiceMessageData
      });

      group.messages.push(newMessage._id);
      await group.save();

      const populatedMessage = await Message.findById(newMessage._id)
        .populate('senderId', 'fullName username profilePhoto');

      // Emit to all group members
      group.members.forEach(member => {
        const socketId = getRecieverSocketId(member.userId.toString());
        if (socketId && member.userId.toString() !== senderId) {
          io.to(socketId).emit('newGroupMessage', {
            groupId,
            message: populatedMessage
          });
        }
      });

      return res.status(200).json({ message: populatedMessage });
    } else {
      // Send to individual user
      if (!validateObjectId(receiverId)) {
        return res.status(400).json({ error: "Invalid receiver ID" });
      }

      newMessage = await Message.create({
        senderId,
        receiverId,
        messageType: 'voice',
        voiceMessage: voiceMessageData
      });

      // Add to conversation
      let conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId] }
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [senderId, receiverId],
          messages: [newMessage._id]
        });
      } else {
        conversation.messages.push(newMessage._id);
        await conversation.save();
      }

      const populatedMessage = await Message.findById(newMessage._id)
        .populate('senderId', 'fullName username profilePhoto');

      // Emit socket event
      const receiverSocketId = getRecieverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('newMessage', populatedMessage);
      }

      return res.status(200).json({ message: populatedMessage });
    }
  } catch (error) {
    console.error("sendVoiceMessage error:", error);
    return res.status(500).json({ error: "Failed to send voice message" });
  }
};
