import { validateUsername, validatePassword, sanitizeInput } from '../utils/validation.js';
import authService from '../services/authService.js';
import userService from '../services/userService.js';

export const register = async (req, res) => {
    try {
        let { fullName, username, password, confirmPassword, gender } = req.body;
        
        // Sanitize inputs
        fullName = sanitizeInput(fullName);
        username = sanitizeInput(username);
        
        // Validate all fields are present
        if (!fullName || !username || !password || !confirmPassword || !gender) {
            return res.status(400).json({ message: "All fields are required" });
        }
        
        // Validate username format
        if (!validateUsername(username)) {
            return res.status(400).json({ 
                message: "Username must be 3-20 characters and contain only letters, numbers, and underscores" 
            });
        }
        
        // Validate password strength
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return res.status(400).json({ 
                message: passwordValidation.message
            });
        }
        
        // Check password match
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }
        
        // Check if user already exists
        if (await userService.userExists(username)) {
            return res.status(400).json({ message: "User already exists" });
        }
        
        // Create user
        const newUser = await authService.createUser({ fullName, username, password, gender });
        
        // Generate token
        const token = authService.generateToken(newUser._id);
        
        // Format response
        const userResponse = authService.formatUserResponse(newUser, token);

        return res.status(201)
            .cookie("token", token, authService.getCookieOptions())
            .json({
                message: "User registered successfully",
                success: true,
                ...userResponse
            });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
}

export const login = async (req, res) => {
    try {
        let { username, password } = req.body;
        
        // Sanitize input
        username = sanitizeInput(username);

        // Validate required fields
        if (!username || !password) {
            return res.status(400).json({ message: "All fields are required", success: false });
        }

        // Find user
        const user = await authService.findUserByUsername(username);
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials", success: false });
        }

        // Verify password
        const isValidPassword = await authService.comparePassword(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: "Invalid credentials", success: false });
        }

        // Generate token
        const token = authService.generateToken(user._id);
        
        // Format response
        const userResponse = authService.formatUserResponse(user, token);

        return res.status(200)
            .cookie("token", token, authService.getCookieOptions())
            .json(userResponse);
            
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
}

export const logout = async (req, res) => {
    try {
        return res.status(200)
            .cookie("token", "", { ...authService.getCookieOptions(), maxAge: 0 })
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
        const otherUsers = await userService.getOtherUsers(loggedInUserId);

        return res.status(200).json(otherUsers);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}