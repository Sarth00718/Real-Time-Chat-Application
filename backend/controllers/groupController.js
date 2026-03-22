import { Group } from "../models/groupmodel.js";
import { Message } from "../models/messagemodel.js";
import { User } from "../models/usermodel.js";
import { validateObjectId, sanitizeInput } from "../utils/validation.js";
import { io, getRecieverSocketId } from "../socket/socket.js";
import cloudinary from "../config/cloudinary.js";

// Create a new group
export const createGroup = async (req, res) => {
  try {
    const { name, description, memberIds } = req.body;
    const creatorId = req.id;

    if (!name || !memberIds || memberIds.length === 0) {
      return res.status(400).json({ error: "Group name and members are required" });
    }

    // Validate member IDs
    for (const memberId of memberIds) {
      if (!validateObjectId(memberId)) {
        return res.status(400).json({ error: "Invalid member ID" });
      }
    }

    // Create members array with creator as admin
    const members = [
      { userId: creatorId, role: 'admin' },
      ...memberIds.map(id => ({ userId: id, role: 'member' }))
    ];

    const group = await Group.create({
      name: sanitizeInput(name),
      description: description ? sanitizeInput(description) : "",
      members,
      createdBy: creatorId
    });

    const populatedGroup = await Group.findById(group._id)
      .populate('members.userId', 'fullName username profilePhoto')
      .populate('createdBy', 'fullName username profilePhoto');

    // Notify all members
    memberIds.forEach(memberId => {
      const socketId = getRecieverSocketId(memberId);
      if (socketId) {
        io.to(socketId).emit('addedToGroup', populatedGroup);
      }
    });

    return res.status(201).json({ group: populatedGroup });
  } catch (error) {
    console.error("createGroup error:", error);
    return res.status(500).json({ error: "Failed to create group" });
  }
};

// Get user's groups
export const getUserGroups = async (req, res) => {
  try {
    const userId = req.id;

    const groups = await Group.find({ 'members.userId': userId })
      .populate('members.userId', 'fullName username profilePhoto isOnline lastSeen')
      .populate('createdBy', 'fullName username profilePhoto')
      .sort({ updatedAt: -1 });

    return res.status(200).json({ groups });
  } catch (error) {
    console.error("getUserGroups error:", error);
    return res.status(500).json({ error: "Failed to fetch groups" });
  }
};

// Get group details
export const getGroupDetails = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.id;

    if (!validateObjectId(groupId)) {
      return res.status(400).json({ error: "Invalid group ID" });
    }

    const group = await Group.findById(groupId)
      .populate('members.userId', 'fullName username profilePhoto isOnline lastSeen')
      .populate('createdBy', 'fullName username profilePhoto');

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if user is a member
    const isMember = group.members.some(m => m.userId._id.toString() === userId);
    if (!isMember) {
      return res.status(403).json({ error: "You are not a member of this group" });
    }

    return res.status(200).json({ group });
  } catch (error) {
    console.error("getGroupDetails error:", error);
    return res.status(500).json({ error: "Failed to fetch group details" });
  }
};

// Add members to group
export const addGroupMembers = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { memberIds } = req.body;
    const userId = req.id;

    if (!validateObjectId(groupId)) {
      return res.status(400).json({ error: "Invalid group ID" });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if user is admin
    const userMember = group.members.find(m => m.userId.toString() === userId);
    if (!userMember || userMember.role !== 'admin') {
      return res.status(403).json({ error: "Only admins can add members" });
    }

    // Add new members
    const newMembers = memberIds.filter(id => 
      !group.members.some(m => m.userId.toString() === id)
    ).map(id => ({ userId: id, role: 'member' }));

    group.members.push(...newMembers);
    await group.save();

    const updatedGroup = await Group.findById(groupId)
      .populate('members.userId', 'fullName username profilePhoto isOnline lastSeen')
      .populate('createdBy', 'fullName username profilePhoto');

    // Notify new members and existing members
    [...memberIds, ...group.members.map(m => m.userId.toString())].forEach(memberId => {
      const socketId = getRecieverSocketId(memberId);
      if (socketId) {
        io.to(socketId).emit('groupUpdated', updatedGroup);
      }
    });

    return res.status(200).json({ group: updatedGroup });
  } catch (error) {
    console.error("addGroupMembers error:", error);
    return res.status(500).json({ error: "Failed to add members" });
  }
};

// Remove member from group
export const removeGroupMember = async (req, res) => {
  try {
    const { groupId, memberId } = req.params;
    const userId = req.id;

    if (!validateObjectId(groupId) || !validateObjectId(memberId)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if user is admin
    const userMember = group.members.find(m => m.userId.toString() === userId);
    if (!userMember || userMember.role !== 'admin') {
      return res.status(403).json({ error: "Only admins can remove members" });
    }

    group.members = group.members.filter(m => m.userId.toString() !== memberId);
    await group.save();

    const updatedGroup = await Group.findById(groupId)
      .populate('members.userId', 'fullName username profilePhoto isOnline lastSeen')
      .populate('createdBy', 'fullName username profilePhoto');

    // Notify removed member and remaining members
    const removedSocketId = getRecieverSocketId(memberId);
    if (removedSocketId) {
      io.to(removedSocketId).emit('removedFromGroup', { groupId });
    }

    group.members.forEach(m => {
      const socketId = getRecieverSocketId(m.userId.toString());
      if (socketId) {
        io.to(socketId).emit('groupUpdated', updatedGroup);
      }
    });

    return res.status(200).json({ group: updatedGroup });
  } catch (error) {
    console.error("removeGroupMember error:", error);
    return res.status(500).json({ error: "Failed to remove member" });
  }
};

// Leave group
export const leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.id;

    if (!validateObjectId(groupId)) {
      return res.status(400).json({ error: "Invalid group ID" });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const userMember = group.members.find(m => m.userId.toString() === userId);
    if (!userMember) {
      return res.status(404).json({ error: "You are not a member of this group" });
    }

    // If user is the only admin, transfer admin to another member or prevent leaving
    const admins = group.members.filter(m => m.role === 'admin');
    if (admins.length === 1 && userMember.role === 'admin' && group.members.length > 1) {
      // Transfer admin to the next member
      group.members[1].role = 'admin';
    }

    group.members = group.members.filter(m => m.userId.toString() !== userId);
    
    if (group.members.length === 0) {
      // Delete group if no members left
      await Group.findByIdAndDelete(groupId);
      return res.status(200).json({ message: "Group deleted" });
    }

    await group.save();

    const updatedGroup = await Group.findById(groupId)
      .populate('members.userId', 'fullName username profilePhoto isOnline lastSeen')
      .populate('createdBy', 'fullName username profilePhoto');

    // Notify remaining members
    group.members.forEach(m => {
      const socketId = getRecieverSocketId(m.userId.toString());
      if (socketId) {
        io.to(socketId).emit('groupUpdated', updatedGroup);
      }
    });

    return res.status(200).json({ message: "Left group successfully" });
  } catch (error) {
    console.error("leaveGroup error:", error);
    return res.status(500).json({ error: "Failed to leave group" });
  }
};

// Update group details
export const updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, description } = req.body;
    const userId = req.id;

    if (!validateObjectId(groupId)) {
      return res.status(400).json({ error: "Invalid group ID" });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if user is admin
    const userMember = group.members.find(m => m.userId.toString() === userId);
    if (!userMember || userMember.role !== 'admin') {
      return res.status(403).json({ error: "Only admins can update group" });
    }

    if (name) group.name = sanitizeInput(name);
    if (description !== undefined) group.description = sanitizeInput(description);

    await group.save();

    const updatedGroup = await Group.findById(groupId)
      .populate('members.userId', 'fullName username profilePhoto isOnline lastSeen')
      .populate('createdBy', 'fullName username profilePhoto');

    // Notify all members
    group.members.forEach(m => {
      const socketId = getRecieverSocketId(m.userId.toString());
      if (socketId) {
        io.to(socketId).emit('groupUpdated', updatedGroup);
      }
    });

    return res.status(200).json({ group: updatedGroup });
  } catch (error) {
    console.error("updateGroup error:", error);
    return res.status(500).json({ error: "Failed to update group" });
  }
};

// Upload group photo
export const uploadGroupPhoto = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.id;

    if (!validateObjectId(groupId)) {
      return res.status(400).json({ error: "Invalid group ID" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if user is admin
    const userMember = group.members.find(m => m.userId.toString() === userId);
    if (!userMember || userMember.role !== 'admin') {
      return res.status(403).json({ error: "Only admins can update group photo" });
    }

    // Upload to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'group_photos',
      transformation: [{ width: 400, height: 400, crop: 'fill' }]
    });

    group.groupPhoto = result.secure_url;
    await group.save();

    const updatedGroup = await Group.findById(groupId)
      .populate('members.userId', 'fullName username profilePhoto isOnline lastSeen')
      .populate('createdBy', 'fullName username profilePhoto');

    // Notify all members
    group.members.forEach(m => {
      const socketId = getRecieverSocketId(m.userId.toString());
      if (socketId) {
        io.to(socketId).emit('groupUpdated', updatedGroup);
      }
    });

    return res.status(200).json({ group: updatedGroup });
  } catch (error) {
    console.error("uploadGroupPhoto error:", error);
    return res.status(500).json({ error: "Failed to upload group photo" });
  }
};
