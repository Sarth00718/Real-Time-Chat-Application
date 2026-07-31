import { Message } from '../models/messagemodel.js';
import { validateObjectId, sanitizeInput } from '../utils/validation.js';
import { getRecieverSocketId, io } from '../socket/socket.js';

/**
 * Edit a message
 */
export const editMessage = async (req, res) => {
    try {
        const userId = req.id;
        const { messageId } = req.params;
        let { message } = req.body;

        // Validate message ID
        if (!validateObjectId(messageId)) {
            return res.status(400).json({ error: 'Invalid message ID' });
        }

        if (!message || !message.trim()) {
            return res.status(400).json({ error: 'Message content is required' });
        }

        // Sanitize message
        message = sanitizeInput(message);

        // Find message
        const existingMessage = await Message.findById(messageId);
        if (!existingMessage) {
            return res.status(404).json({ error: 'Message not found' });
        }

        // Only sender can edit
        if (existingMessage.senderId.toString() !== userId) {
            return res.status(403).json({ error: 'Only sender can edit message' });
        }


        // Update message
        existingMessage.message = message;
        existingMessage.edited = true;
        existingMessage.editedAt = new Date();
        await existingMessage.save();

        // Emit socket event to receiver or group
        if (existingMessage.receiverId) {
            const receiverSocketId = getRecieverSocketId(existingMessage.receiverId.toString());
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('messageEdited', {
                    messageId: existingMessage._id,
                    message: existingMessage.message,
                    edited: true,
                    editedAt: existingMessage.editedAt
                });
            }
        } else if (existingMessage.groupId) {
            io.to(existingMessage.groupId.toString()).emit('messageEdited', {
                messageId: existingMessage._id,
                message: existingMessage.message,
                edited: true,
                editedAt: existingMessage.editedAt
            });
        }

        return res.status(200).json({
            success: true,
            message: existingMessage
        });
    } catch (error) {
        console.error('editMessage error:', error);
        return res.status(500).json({ error: 'Failed to edit message' });
    }
};
