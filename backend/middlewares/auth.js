import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
    try {
        // Get token from Authorization header (for localStorage) or cookies
        const token = req.headers.authorization?.split(" ")[1] || req.cookies.token;
        
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: "User not authenticated. Please login." 
            });
        }
        
        // Verify token with proper error handling
        const decode = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ['HS256'],
            maxAge: process.env.JWT_EXPIRES_IN || '7d'
        });
        
        if (!decode || !decode.userId) {
            return res.status(401).json({ 
                success: false,
                message: "Invalid token" 
            });
        }
        
        // Attach user ID to request
        req.id = decode.userId;
        req.tokenIat = decode.iat;
        
        next();
    } catch (error) {
        console.error('Authentication error:', error.message);
        
        // Handle specific JWT errors
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                message: "Token expired. Please login again.",
                code: 'TOKEN_EXPIRED'
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false,
                message: "Invalid token. Please login again.",
                code: 'INVALID_TOKEN'
            });
        }
        
        return res.status(401).json({ 
            success: false,
            message: "Authentication failed" 
        });
    }
};

export { isAuthenticated };
export default isAuthenticated;
