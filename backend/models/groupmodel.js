import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: "",
    trim: true
  },
  groupPhoto: {
    type: String,
    default: ""
  },
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  messages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message"
  }],
  pinnedMessages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message"
  }]
}, { timestamps: true });

groupSchema.index({ members: 1 });
groupSchema.index({ createdBy: 1 });

export const Group = mongoose.model("Group", groupSchema);
