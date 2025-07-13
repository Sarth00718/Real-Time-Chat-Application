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
        // profilePhoto
        const maleProfilePhoto = `https://avatar.iran.liara.run/public/boy?username=${username}`;
        const femaleProfilePhoto = `https://avatar.iran.liara.run/public/girl?username=${username}`;

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

        return res.status(200).cookie("token", token, { maxAge: 1 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'None', secure:true }).json({
            _id: user._id,
            username: user.username,
            fullName: user.fullName,
            profilePhoto: user.profilePhoto
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
        return res.status(200).cookie("token", "", {
            maxAge: 0
        }).json({
            message: "User logged out successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

//getotherusers
export const getOtherUsers = async (req, res) => {
    try {
        const loggedInUserId = req.id;
        const otherUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
        return res.status(200).json(otherUsers);
    } catch (error) {
        console.log(error);
    }
}
