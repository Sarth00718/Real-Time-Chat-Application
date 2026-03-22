import mongoose from "mongoose";


const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    index: true
  },
  message: {
    type: String,
    default: ""
  },
  messageType: {
    type: String,
    enum: ['text', 'file', 'voice', 'forwarded'],
    default: 'text'
  },
  files: [String], 
  voiceMessage: {
    url: String,
    duration: Number,
    waveform: [Number]
  },
  forwardedFrom: {
    originalMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message"
    },
    originalSenderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    forwardCount: {
      type: Number,
      default: 0
    }
  },
  replyTo: {
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message"
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    message: String,
    messageType: String
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  pinnedAt: Date,
  pinnedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  read: {
    type: Boolean,
    default: false
  },
  delivered: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  deletedFor: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  deletedForEveryone: {
    type: Boolean,
    default: false
  },
  reactions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    emoji: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: Date
}, { timestamps: true });

// Compound index for faster message queries
messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ createdAt: -1 });

export const Message = mongoose.model("Message", messageSchema);
