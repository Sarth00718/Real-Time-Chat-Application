import { Message } from '../models/messagemodel.js';
import { Conversation } from '../models/conversationmodel.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

/**
 * Message Service - Handles message-related business logic
 */
class MessageService {
  /**
   * Upload files to Cloudinary
   */
  async uploadFiles(files) {
    if (!files || files.length === 0) return [];

    const uploadPromises = files.map(async (file) => {
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          resource_type: 'auto',
          folder: 'chat-app',
        });
        
        // Delete temp file
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        
        return result.secure_url;
      } catch (error) {
        console.error('File upload error:', error);
        
        // Clean up temp file on error
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        
        return null;
      }
    });

    const uploadedUrls = await Promise.all(uploadPromises);
    return uploadedUrls.filter(url => url !== null);
  }

  /**
   * Get or create conversation
   */
  async getOrCreateConversation(senderId, receiverId) {
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    return conversation;
  }

  /**
   * Create and save message
   */
  async createMessage(senderId, receiverId, messageText, fileUrls, replyTo = null) {
    const message = await Message.create({
      senderId,
      receiverId,
      message: messageText || '',
      files: fileUrls,
      replyTo
    });

    return message;
  }

  /**
   * Add message to conversation
   */
  async addMessageToConversation(conversationId, messageId) {
    const conversation = await Conversation.findById(conversationId);
    conversation.messages.push(messageId);
    await conversation.save();
  }

  /**
   * Get messages between two users
   */
  async getMessages(senderId, receiverId) {
    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    }).populate({
      path: 'messages',
      match: {
        $and: [
          { deletedFor: { $ne: senderId } },
          { deletedForEveryone: false }
        ]
      }
    });

    return conversation?.messages || [];
  }
}

export default new MessageService();
