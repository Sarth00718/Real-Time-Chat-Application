import {Server} from "socket.io";
import http from "http";
import express from "express";
import { User } from "../models/usermodel.js";
import { Message } from "../models/messagemodel.js";

const app = express();

const server = http.createServer(app);

const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [
        'https://real-time-chat-application-eosin.vercel.app',
        'https://real-time-chat-application-two-smoky.vercel.app',
        process.env.FRONTEND_URL
      ].filter(Boolean)
    : ['http://localhost:5173', 'http://localhost:5174'];

const io = new Server(server, {
    cors:{
        origin: allowedOrigins,
        methods:['GET', 'POST'],
        credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
});

export const getRecieverSocketId = (receiverId)=>{
    return userSocketMap[receiverId];
}

const userSocketMap = {};

io.on('connection', async (socket)=>{
    const userId = socket.handshake.query.userId;
    
    if(userId !== undefined && userId !== 'undefined'){
        userSocketMap[userId] = socket.id;
        console.log(`User connected: ${userId}`);
        
        // Update user online status and last seen
        try {
            await User.findByIdAndUpdate(userId, {
                isOnline: true,
                lastSeen: new Date()
            });
        } catch (error) {
            console.error('Error updating user online status:', error);
        }
        
        // Emit online users list
        io.emit('getOnlineUsers', Object.keys(userSocketMap));
        
        // Emit user online status
        socket.broadcast.emit('userOnline', userId);
    }

    // Handle message delivered event
    socket.on('messageDelivered', async ({ messageId, receiverId }) => {
        try {
            await Message.findByIdAndUpdate(messageId, {
                delivered: true,
                status: 'delivered'
            });
            
            // Notify sender
            const senderSocketId = getRecieverSocketId(receiverId);
            if (senderSocketId) {
                io.to(senderSocketId).emit('messageStatusUpdate', {
                    messageId,
                    status: 'delivered'
                });
            }
        } catch (error) {
            console.error('Error updating message delivered status:', error);
        }
    });

    // Handle typing indicator
    socket.on('typing', ({ receiverId, isTyping }) => {
        const receiverSocketId = getRecieverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('userTyping', {
                userId,
                isTyping
            });
        }
    });

    // Handle group typing indicator
    socket.on('groupTyping', ({ groupId, isTyping }) => {
        socket.to(groupId).emit('userGroupTyping', {
            userId,
            groupId,
            isTyping
        });
    });

    // Join group room
    socket.on('joinGroup', ({ groupId }) => {
        socket.join(groupId);
        console.log(`User ${userId} joined group ${groupId}`);
    });

    // Leave group room
    socket.on('leaveGroup', ({ groupId }) => {
        socket.leave(groupId);
        console.log(`User ${userId} left group ${groupId}`);
    });

    socket.on('disconnect', async ()=>{
        console.log('User disconnected:', socket.id);
        
        if(userId !== undefined && userId !== 'undefined'){
            // Update user offline status and last seen
            try {
                await User.findByIdAndUpdate(userId, {
                    isOnline: false,
                    lastSeen: new Date()
                });
            } catch (error) {
                console.error('Error updating user offline status:', error);
            }
            
            delete userSocketMap[userId];
            
            // Emit updated online users list
            io.emit('getOnlineUsers', Object.keys(userSocketMap));
            
            // Emit user offline status
            socket.broadcast.emit('userOffline', userId);
        }
    });
    
    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });
})

export {app,server,io};
