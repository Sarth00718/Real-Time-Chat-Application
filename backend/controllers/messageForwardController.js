import { Message } from "../models/messagemodel.js";
import { Conversation } from "../models/conversationmodel.js";
import { Group } from "../models/groupmodel.js";
import { validateObjectId } from "../utils/validation.js";
import { io, getRecieverSocketId } from "../socket/socket.js";

// Forward message to users or groups
export const forwardMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { recipientIds, groupIds } = req.body;
    const senderId = req.id;

    if (!validateObjectId(messageId)) {
      return res.status(400).json({ error: "Invalid message ID" });
    }

    const originalMessage = await Message.findById(messageId);
    if (!originalMessage) {
      return res.status(404).json({ error: "Message not found" });
    }

    const forwardedMessages = [];

    // Forward to individual users
    if (recipientIds && recipientIds.length > 0) {
      for (const recipientId of recipientIds) {
        if (!validateObjectId(recipientId)) continue;

        // Create forwarded message
        const forwardedMessage = await Message.create({
          senderId,
          receiverId: recipientId,
          message: originalMessage.message,
          messageType: 'forwarded',
          files: originalMessage.files,
          voiceMessage: originalMessage.voiceMessage,
          forwardedFrom: {
            originalMessageId: originalMessage._id,
            originalSenderId: originalMessage.senderId,
            forwardCount: (originalMessage.forwardedFrom?.forwardCount || 0) + 1
          }
        });

        // Add to conversation
        let conversation = await Conversation.findOne({
          participants: { $all: [senderId, recipientId] }
        });

        if (!conversation) {
          conversation = await Conversation.create({
            participants: [senderId, recipientId],
            messages: [forwardedMessage._id]
          });
        } else {
          conversation.messages.push(forwardedMessage._id);
          await conversation.save();
        }

        const populatedMessage = await Message.findById(forwardedMessage._id)
          .populate('senderId', 'fullName username profilePhoto')
          .populate('forwardedFrom.originalSenderId', 'fullName username');

        forwardedMessages.push(populatedMessage);

        // Emit socket event
        const receiverSocketId = getRecieverSocketId(recipientId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('newMessage', populatedMessage);
        }
      }
    }

    // Forward to groups
    if (groupIds && groupIds.length > 0) {
      for (const groupId of groupIds) {
        if (!validateObjectId(groupId)) continue;

        const group = await Group.findById(groupId);
        if (!group) continue;

        // Check if sender is a member
        const isMember = group.members.some(m => m.userId.toString() === senderId);
        if (!isMember) continue;

        // Create forwarded message for group
        const forwardedMessage = await Message.create({
          senderId,
          groupId,
          message: originalMessage.message,
          messageType: 'forwarded',
          files: originalMessage.files,
          voiceMessage: originalMessage.voiceMessage,
          forwardedFrom: {
            originalMessageId: originalMessage._id,
            originalSenderId: originalMessage.senderId,
            forwardCount: (originalMessage.forwardedFrom?.forwardCount || 0) + 1
          }
        });

        group.messages.push(forwardedMessage._id);
        await group.save();

        const populatedMessage = await Message.findById(forwardedMessage._id)
          .populate('senderId', 'fullName username profilePhoto')
          .populate('forwardedFrom.originalSenderId', 'fullName username');

        forwardedMessages.push(populatedMessage);

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
      }
    }

    return res.status(200).json({ 
      message: "Message forwarded successfully",
      forwardedMessages 
    });
  } catch (error) {
    console.error("forwardMessage error:", error);
    return res.status(500).json({ error: "Failed to forward message" });
  }
};
