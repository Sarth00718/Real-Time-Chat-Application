import rateLimit from 'express-rate-limit';

// Rate limiter for authentication endpoints (login/register)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    message: {
        message: 'Too many authentication attempts from this IP, please try again after 15 minutes',
        success: false
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skipSuccessfulRequests: false, // Count successful requests
    skipFailedRequests: false, // Count failed requests
});

// Rate limiter for message sending
export const messageLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // Limit each IP to 30 messages per minute
    message: {
        message: 'Too many messages sent, please slow down',
        success: false
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// General API rate limiter
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        message: 'Too many requests from this IP, please try again later',
        success: false
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Create custom rate limiter
export const createRateLimiter = (maxRequests, windowMinutes) => {
    return rateLimit({
        windowMs: windowMinutes * 60 * 1000,
        max: maxRequests,
        message: {
            message: 'Too many requests, please try again later',
            success: false
        },
        standardHeaders: true,
        legacyHeaders: false,
    });
};
