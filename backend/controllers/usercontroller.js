import { User } from '../models/usermodel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {

    try {
        const { fullName, username, password, confirmPassword, gender } = req.body;
        //alls fields are required
        if (!fullName || !username || !password || !confirmPassword || !gender) {
            return res.status(400).json({ message: "All fields are required" });
        }
        //password and confirm password must match
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }
        //check if user already exists
        const user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }
        //hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        //profile photo 
        // Base paths
        const BOY_AVATAR_PATH = '/images/boy/';
        const GIRL_AVATAR_PATH = '/images/girl/';

        // Random avatar filenames
        const boyAvatar = `AV${Math.floor(Math.random() * 50) + 1}.png`;      // AV1 to AV50
        const girlAvatar = `AV${Math.floor(Math.random() * 50) + 51}.png`;    // AV51 to AV100

        // Final image URLs
        const maleProfilePhoto = `${BOY_AVATAR_PATH}${boyAvatar}`;
        const femaleProfilePhoto = `${GIRL_AVATAR_PATH}${girlAvatar}`;


        await User.create({
            fullName,
            username,
            password: hashedPassword,
            profilePhoto: gender === "male" ? maleProfilePhoto : femaleProfilePhoto,
            gender
        })
        return res.status(201).json({
            message: "User registered successfully",
            success: true,
        });

    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
}

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        //all fields are required
        if (!username || !password) {
            return res.status(400).json({ message: "All fields are required", success: false });
        }

        //check if user exists
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: "User does not exist", success: false });
        }

        //compare password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: "Invalid password", success: false });
        }

        const tokenData = {
            userId: user._id
        };

        const token = await jwt.sign(tokenData, process.env.JWT_SECRET, { expiresIn: '1d' });

        return res.status(200).cookie("token", token, {
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: true, 
            sameSite: 'None' 
        }).json({
            _id: user._id,
            username: user.username,
            fullName: user.fullName,
            profilePhoto: user.profilePhoto,
            token
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
}

export const logout = async (req, res) => {
    try {
        // Clear the cookie by setting it to empty and expiring it
        return res.status(200)
            .cookie("token", "", {
                maxAge: 0,
                httpOnly: true,
                secure: true,
                sameSite: 'None',
                path: '/'
            })
            .json({
                message: "User logged out successfully",
                success: true
            });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}

export const getOtherUsers = async (req, res) => {
    try {
        const loggedInUserId = req.id;
        const otherUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

        // Debug logging
        console.log('Other users:', otherUsers);
        console.log('First user profilePhoto:', otherUsers[0]?.profilePhoto);

        return res.status(200).json(otherUsers);
    } catch (error) {
        console.log(error);
    }
}