import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';

/**
 * Security Middleware Configuration
 */

// Helmet - Sets various HTTP headers for security
export const helmetConfig = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
});

// Prevent NoSQL injection
export const mongoSanitizeConfig = mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
        console.warn(`Sanitized key: ${key} in request`);
    }
});

// Prevent HTTP Parameter Pollution
export const hppConfig = hpp({
    whitelist: ['sort', 'fields', 'page', 'limit']
});

/**
 * Custom Security Middleware
 */

// Prevent brute force attacks - Track failed login attempts
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

export const bruteForceProtection = (req, res, next) => {
    const identifier = req.body.username || req.ip;
    const attempts = loginAttempts.get(identifier);

    if (attempts) {
        if (attempts.count >= MAX_ATTEMPTS) {
            const timeLeft = LOCKOUT_TIME - (Date.now() - attempts.firstAttempt);
            
            if (timeLeft > 0) {
                return res.status(429).json({
                    success: false,
                    message: `Too many login attempts. Please try again in ${Math.ceil(timeLeft / 60000)} minutes.`
                });
            } else {
                // Reset after lockout time
                loginAttempts.delete(identifier);
            }
        }
    }

    next();
};

export const recordFailedLogin = (identifier) => {
    const attempts = loginAttempts.get(identifier) || { count: 0, firstAttempt: Date.now() };
    attempts.count++;
    
    if (attempts.count === 1) {
        attempts.firstAttempt = Date.now();
    }
    
    loginAttempts.set(identifier, attempts);
};

export const clearFailedLogin = (identifier) => {
    loginAttempts.delete(identifier);
};

// Clean up old entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of loginAttempts.entries()) {
        if (now - value.firstAttempt > LOCKOUT_TIME) {
            loginAttempts.delete(key);
        }
    }
}, 60000); // Clean up every minute

/**
 * Request size limiter
 */
export const requestSizeLimiter = (req, res, next) => {
    const contentLength = req.headers['content-length'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (contentLength && parseInt(contentLength) > maxSize) {
        return res.status(413).json({
            success: false,
            message: 'Request entity too large'
        });
    }

    next();
};

/**
 * Secure headers middleware
 */
export const secureHeaders = (req, res, next) => {
    // Remove sensitive headers
    res.removeHeader('X-Powered-By');
    
    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    next();
};

/**
 * Input sanitization middleware
 */
export const sanitizeInputs = (req, res, next) => {
    // Sanitize body
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = req.body[key].trim();
            }
        });
    }

    // Sanitize query params
    if (req.query) {
        Object.keys(req.query).forEach(key => {
            if (typeof req.query[key] === 'string') {
                req.query[key] = req.query[key].trim();
            }
        });
    }

    next();
};
