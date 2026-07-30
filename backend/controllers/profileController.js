import { User } from '../models/usermodel.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

/**
 * Upload profile photo
 */
export const uploadProfilePhoto = async (req, res) => {
    try {
        const userId = req.id;

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            resource_type: 'image',
            folder: 'chat-app/profiles',
            transformation: [
                { width: 400, height: 400, crop: 'fill', gravity: 'face' },
                { quality: 'auto' }
            ]
        });

        // Delete temp file
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        // Update user profile photo
        const user = await User.findByIdAndUpdate(
            userId,
            { profilePhoto: result.secure_url },
            { new: true }
        ).select('-password');

        return res.status(200).json({
            success: true,
            profilePhoto: result.secure_url,
            user
        });
    } catch (error) {
        console.error('uploadProfilePhoto error:', error);

        // Clean up temp file on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        return res.status(500).json({ error: 'Failed to upload profile photo' });
    }
};

/**
 * Update profile (name and about)
 */
export const updateProfile = async (req, res) => {
    try {
        const userId = req.id;
        const { fullName, username } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update fields if provided
        if (fullName !== undefined) {
            if (!fullName.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Name cannot be empty'
                });
            }
            user.fullName = fullName.trim();
        }

        if (username !== undefined) {
            if (!username.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'About cannot be empty'
                });
            }
            user.username = username.trim();
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                _id: user._id,
                fullName: user.fullName,
                username: user.username,
                profilePhoto: user.profilePhoto
            }
        });

    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update profile'
        });
    }
};
