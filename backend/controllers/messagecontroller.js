import { Conversation } from "../models/conversationmodel.js";
import { Message } from "../models/messagemodel.js";
import { getRecieverSocketId, io } from "../socket/socket.js";

export const sendMessage = async (req, res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;
        const { message } = req.body;

        // Create or fetch conversation
        let gotConversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
        });

        if (!gotConversation) {
            gotConversation = await Conversation.create({
                participants: [senderId, receiverId],
            });
        }

        // Add in sendMessage controller
        const files = req.files?.map(file => `/uploads/${file.filename}`);

        // Store in DB
        const newMessage = await Message.create({
            senderId,
            receiverId,
            message: message || '',
            files
        });

        // Link message to conversation
        gotConversation.messages.push(newMessage._id);
        await Promise.all([gotConversation.save(), newMessage.save()]);

        // Real-time socket update
        const recieverSocketId = getRecieverSocketId(receiverId);
        if (recieverSocketId) {
            io.to(recieverSocketId).emit('newMessage', newMessage);
        }

        return res.status(200).json({ newMessage });
    } catch (error) {
        console.error("sendMessage error:", error);
        return res.status(500).json({ error: error.message });
    }
};

export const getMessage = async (req, res) => {
    try {
        const receiverId = req.params.id;
        const senderId = req.id;
        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        }).populate("messages");
        return res.status(200).json(conversation?.messages);
    } catch (error) {
        console.log(error);
    }
}