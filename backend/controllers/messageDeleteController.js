import { Message } from '../models/messagemodel.js';
import { validateObjectId } from '../utils/validation.js';
import { getRecieverSocketId, io } from '../socket/socket.js';

/**
 * Delete message for me
 */
export const deleteMessageForMe = async (req, res) => {
    try {
        const userId = req.id;
        const messageId = req.params.messageId;

        // Validate message ID
        if (!validateObjectId(messageId)) {
            return res.status(400).json({ error: 'Invalid message ID' });
        }

        // Find message
        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        // Check if user is sender, receiver, or if it's a group message
        const isSender = message.senderId.toString() === userId;
        const isReceiver = message.receiverId && message.receiverId.toString() === userId;
        const isGroupMessage = !!message.groupId;

        if (!isSender && !isReceiver && !isGroupMessage) {
            return res.status(403).json({ error: 'Unauthorized to delete this message' });
        }

        // Add user to deletedFor array
        if (!message.deletedFor.includes(userId)) {
            message.deletedFor.push(userId);
            await message.save();
        }

        return res.status(200).json({
            success: true,
            message: 'Message deleted for you'
        });
    } catch (error) {
        console.error('deleteMessageForMe error:', error);
        return res.status(500).json({ error: 'Failed to delete message' });
    }
};

/**
 * Delete message for everyone
 */
export const deleteMessageForEveryone = async (req, res) => {
    try {
        const userId = req.id;
        const messageId = req.params.messageId;

        // Validate message ID
        if (!validateObjectId(messageId)) {
            return res.status(400).json({ error: 'Invalid message ID' });
        }

        // Find message
        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        // Only sender can delete for everyone
        if (message.senderId.toString() !== userId) {
            return res.status(403).json({ error: 'Only sender can delete message for everyone' });
        }


        // Mark as deleted for everyone
        message.deletedForEveryone = true;
        message.message = 'This message was deleted';
        message.files = [];
        await message.save();

        // Emit socket event to receiver or group
        if (message.receiverId) {
            const receiverSocketId = getRecieverSocketId(message.receiverId.toString());
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('messageDeletedForEveryone', {
                    messageId: message._id
                });
            }
        } else if (message.groupId) {
            io.to(message.groupId.toString()).emit('messageDeletedForEveryone', {
                messageId: message._id
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Message deleted for everyone'
        });
    } catch (error) {
        console.error('deleteMessageForEveryone error:', error);
        return res.status(500).json({ error: 'Failed to delete message' });
    }
};
