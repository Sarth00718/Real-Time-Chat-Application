import { Message } from '../models/messagemodel.js';
import { validateObjectId } from '../utils/validation.js';
import { getRecieverSocketId, io } from '../socket/socket.js';

/**
 * Add or update reaction to a message
 */
export const addReaction = async (req, res) => {
    try {
        const userId = req.id;
        const { messageId } = req.params;
        const { emoji } = req.body;

        // Validate message ID
        if (!validateObjectId(messageId)) {
            return res.status(400).json({ error: 'Invalid message ID' });
        }

        if (!emoji) {
            return res.status(400).json({ error: 'Emoji is required' });
        }

        // Find message
        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        // Check if user already reacted
        const existingReactionIndex = message.reactions.findIndex(
            r => r.userId.toString() === userId
        );

        if (existingReactionIndex !== -1) {
            // Update existing reaction
            message.reactions[existingReactionIndex].emoji = emoji;
            message.reactions[existingReactionIndex].createdAt = new Date();
        } else {
            // Add new reaction
            message.reactions.push({
                userId,
                emoji,
                createdAt: new Date()
            });
        }

        await message.save();

        // Emit socket event to both users
        const receiverSocketId = getRecieverSocketId(message.receiverId.toString());
        const senderSocketId = getRecieverSocketId(message.senderId.toString());

        const reactionData = {
            messageId: message._id,
            reactions: message.reactions
        };

        if (receiverSocketId) {
            io.to(receiverSocketId).emit('messageReaction', reactionData);
        }
        if (senderSocketId && senderSocketId !== receiverSocketId) {
            io.to(senderSocketId).emit('messageReaction', reactionData);
        }

        return res.status(200).json({
            success: true,
            reactions: message.reactions
        });
    } catch (error) {
        console.error('addReaction error:', error);
        return res.status(500).json({ error: 'Failed to add reaction' });
    }
};

/**
 * Remove reaction from a message
 */
export const removeReaction = async (req, res) => {
    try {
        const userId = req.id;
        const { messageId } = req.params;

        // Validate message ID
        if (!validateObjectId(messageId)) {
            return res.status(400).json({ error: 'Invalid message ID' });
        }

        // Find message
        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        // Remove user's reaction
        message.reactions = message.reactions.filter(
            r => r.userId.toString() !== userId
        );

        await message.save();

        // Emit socket event to both users
        const receiverSocketId = getRecieverSocketId(message.receiverId.toString());
        const senderSocketId = getRecieverSocketId(message.senderId.toString());

        const reactionData = {
            messageId: message._id,
            reactions: message.reactions
        };

        if (receiverSocketId) {
            io.to(receiverSocketId).emit('messageReaction', reactionData);
        }
        if (senderSocketId && senderSocketId !== receiverSocketId) {
            io.to(senderSocketId).emit('messageReaction', reactionData);
        }

        return res.status(200).json({
            success: true,
            reactions: message.reactions
        });
    } catch (error) {
        console.error('removeReaction error:', error);
        return res.status(500).json({ error: 'Failed to remove reaction' });
    }
};
