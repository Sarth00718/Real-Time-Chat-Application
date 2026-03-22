import { Message } from '../models/messagemodel.js';
import { validateObjectId } from '../utils/validation.js';
import { getRecieverSocketId, io } from '../socket/socket.js';

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (req, res) => {
    try {
        const userId = req.id; // Current user (receiver)
        const senderId = req.params.senderId; // Sender whose messages to mark as read

        // Validate sender ID
        if (!validateObjectId(senderId)) {
            return res.status(400).json({ error: 'Invalid sender ID' });
        }

        // Mark all unread messages from sender to current user as read
        const result = await Message.updateMany(
            {
                senderId: senderId,
                receiverId: userId,
                read: false
            },
            {
                $set: { read: true }
            }
        );

        // Emit socket event to sender to update their UI
        const senderSocketId = getRecieverSocketId(senderId);
        if (senderSocketId) {
            io.to(senderSocketId).emit('messagesRead', {
                readBy: userId,
                count: result.modifiedCount
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Messages marked as read',
            count: result.modifiedCount
        });
    } catch (error) {
        console.error('markMessagesAsRead error:', error);
        return res.status(500).json({ error: 'Failed to mark messages as read' });
    }
};

/**
 * Get unread message count
 */
export const getUnreadCount = async (req, res) => {
    try {
        const userId = req.id;

        // Count unread messages for current user
        const unreadCount = await Message.countDocuments({
            receiverId: userId,
            read: false
        });

        return res.status(200).json({
            success: true,
            unreadCount
        });
    } catch (error) {
        console.error('getUnreadCount error:', error);
        return res.status(500).json({ error: 'Failed to get unread count' });
    }
};

/**
 * Get unread count per conversation
 */
export const getUnreadCountPerUser = async (req, res) => {
    try {
        const userId = req.id;

        // Aggregate unread messages by sender
        const unreadCounts = await Message.aggregate([
            {
                $match: {
                    receiverId: userId,
                    read: false
                }
            },
            {
                $group: {
                    _id: '$senderId',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Convert to object format { senderId: count }
        const unreadMap = {};
        unreadCounts.forEach(item => {
            unreadMap[item._id.toString()] = item.count;
        });

        return res.status(200).json({
            success: true,
            unreadCounts: unreadMap
        });
    } catch (error) {
        console.error('getUnreadCountPerUser error:', error);
        return res.status(500).json({ error: 'Failed to get unread counts' });
    }
};
