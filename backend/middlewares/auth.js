
import jwt from "jsonwebtoken";
const isAuthenticated = async (req, res, next) => {
    try {
        // Get token from Authorization header (for localStorage) or cookies
        const token = req.headers.authorization?.split(" ")[1] || req.cookies.token;
        
        if (!token) {
            return res.status(401).json({ message: "User not authenticated." });
        }
        
        const decode = await jwt.verify(token, process.env.JWT_SECRET);
        if (!decode) {
            return res.status(401).json({ message: "Invalid token" });
        }
        
        req.id = decode.userId;
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: "Authentication failed" });
    }
};
export default isAuthenticated;

const req = {
    id: ""
}

req.id = "abcxyzoooooo"
