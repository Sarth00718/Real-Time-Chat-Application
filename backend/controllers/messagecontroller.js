import cloudinary from "../config/cloudinary.js";
import { Conversation } from "../models/conversationmodel.js";
import { Message } from "../models/messagemodel.js";
import { getRecieverSocketId, io } from "../socket/socket.js"
import { validateObjectId, sanitizeInput } from "../utils/validation.js";
import fs from "fs";

export const sendMessage = async (req, res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;
        let { message } = req.body;
        
        // Validate ObjectIds
        if (!validateObjectId(receiverId)) {
            return res.status(400).json({ error: "Invalid receiver ID" });
        }
        
        // Sanitize message
        if (message) {
            message = sanitizeInput(message);
        }

        // Create or fetch conversation
        let gotConversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
        });

        if (!gotConversation) {
            gotConversation = await Conversation.create({
                participants: [senderId, receiverId],
            });
        }

        // Upload files to Cloudinary
        let files = [];
        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map(async (file) => {
                try {
                    const result = await cloudinary.uploader.upload(file.path, {
                        resource_type: "auto",
                        folder: "chat-app",
                    });
                    fs.unlinkSync(file.path); // delete temp file
                    return result.secure_url;
                } catch (error) {
                    console.error("File upload error:", error);
                    if (fs.existsSync(file.path)) {
                        fs.unlinkSync(file.path);
                    }
                    return null;
                }
            });

            files = (await Promise.all(uploadPromises)).filter(url => url !== null);
        }

        // Store in DB
        const newMessage = await Message.create({
            senderId,
            receiverId,
            message: message || '',
            files
        });

        gotConversation.messages.push(newMessage._id);
        await Promise.all([gotConversation.save(), newMessage.save()]);

        const recieverSocketId = getRecieverSocketId(receiverId);
        if (recieverSocketId) {
            io.to(recieverSocketId).emit('newMessage', newMessage);
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
        
        // Validate ObjectId
        if (!validateObjectId(receiverId)) {
            return res.status(400).json({ error: "Invalid receiver ID" });
        }
        
        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        }).populate("messages");
        return res.status(200).json(conversation?.messages || []);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}