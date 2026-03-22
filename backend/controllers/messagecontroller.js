import { getRecieverSocketId, io } from "../socket/socket.js";
import { validateObjectId, sanitizeInput } from "../utils/validation.js";
import messageService from "../services/messageService.js";

export const sendMessage = async (req, res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;
        let { message, replyToId } = req.body;
        
        // Validate receiver ID
        if (!validateObjectId(receiverId)) {
            return res.status(400).json({ error: "Invalid receiver ID" });
        }
        
        // Sanitize message
        if (message) {
            message = sanitizeInput(message);
        }

        // Get or create conversation
        const conversation = await messageService.getOrCreateConversation(senderId, receiverId);

        // Upload files to Cloudinary
        const fileUrls = await messageService.uploadFiles(req.files);

        // Handle reply
        let replyTo = null;
        if (replyToId && validateObjectId(replyToId)) {
            const { Message } = await import("../models/messagemodel.js");
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

        // Create message with reply
        const newMessage = await messageService.createMessage(senderId, receiverId, message, fileUrls, replyTo);

        // Add message to conversation
        await messageService.addMessageToConversation(conversation._id, newMessage._id);

        // Emit socket event to receiver
        const receiverSocketId = getRecieverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('newMessage', newMessage);
        }

        return res.status(200).json({ newMessage });
    } catch (error) {
        console.error("sendMessage error:", error);
        return res.status(500).json({ error: "Failed to send message" });
    }
};

export const getMessage = async (req, res) => {
    try {
        const receiverId = req.params.id;
        const senderId = req.id;
        
        // Validate receiver ID
        if (!validateObjectId(receiverId)) {
            return res.status(400).json({ error: "Invalid receiver ID" });
        }
        
        // Get messages
        const messages = await messageService.getMessages(senderId, receiverId);
        
        return res.status(200).json(messages);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}