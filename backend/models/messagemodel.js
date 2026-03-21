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
    required: true,
    index: true
  },
  message: {
    type: String,
    default: ""
  },
  files: [String], 
  read: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Compound index for faster message queries
messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ createdAt: -1 });

export const Message = mongoose.model("Message", messageSchema);
