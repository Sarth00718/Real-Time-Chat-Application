import Joi from 'joi';

/**
 * Validation Schemas using Joi
 */

// User Registration Validation
export const registerSchema = Joi.object({
    fullName: Joi.string()
        .min(2)
        .max(50)
        .trim()
        .required()
        .pattern(/^[a-zA-Z\s]+$/)
        .messages({
            'string.pattern.base': 'Full name can only contain letters and spaces',
            'string.min': 'Full name must be at least 2 characters',
            'string.max': 'Full name cannot exceed 50 characters',
            'any.required': 'Full name is required'
        }),
    
    username: Joi.string()
        .min(3)
        .max(30)
        .trim()
        .required()
        .pattern(/^[a-zA-Z0-9_]+$/)
        .messages({
            'string.pattern.base': 'Username can only contain letters, numbers, and underscores',
            'string.min': 'Username must be at least 3 characters',
            'string.max': 'Username cannot exceed 30 characters',
            'any.required': 'Username is required'
        }),
    
    password: Joi.string()
        .min(8)
        .max(128)
        .required()
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .messages({
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
            'string.min': 'Password must be at least 8 characters',
            'string.max': 'Password cannot exceed 128 characters',
            'any.required': 'Password is required'
        }),
    
    confirmPassword: Joi.string()
        .valid(Joi.ref('password'))
        .required()
        .messages({
            'any.only': 'Passwords do not match',
            'any.required': 'Confirm password is required'
        }),
    
    gender: Joi.string()
        .valid('male', 'female')
        .required()
        .messages({
            'any.only': 'Gender must be either male or female',
            'any.required': 'Gender is required'
        })
});

// User Login Validation
export const loginSchema = Joi.object({
    username: Joi.string()
        .trim()
        .required()
        .messages({
            'any.required': 'Username is required'
        }),
    
    password: Joi.string()
        .required()
        .messages({
            'any.required': 'Password is required'
        })
});

// Message Validation
export const messageSchema = Joi.object({
    message: Joi.string()
        .max(5000)
        .trim()
        .allow('')
        .messages({
            'string.max': 'Message cannot exceed 5000 characters'
        }),
    
    receiverId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.pattern.base': 'Invalid receiver ID',
            'any.required': 'Receiver ID is required'
        })
});

// Profile Update Validation
export const profileUpdateSchema = Joi.object({
    fullName: Joi.string()
        .min(2)
        .max(50)
        .trim()
        .pattern(/^[a-zA-Z\s]+$/)
        .messages({
            'string.pattern.base': 'Full name can only contain letters and spaces',
            'string.min': 'Full name must be at least 2 characters',
            'string.max': 'Full name cannot exceed 50 characters'
        }),
    
    username: Joi.string()
        .min(3)
        .max(100)
        .trim()
        .messages({
            'string.min': 'About must be at least 3 characters',
            'string.max': 'About cannot exceed 100 characters'
        })
}).min(1);

// AI Chat Validation
export const aiChatSchema = Joi.object({
    message: Joi.string()
        .min(1)
        .max(2000)
        .trim()
        .required()
        .messages({
            'string.min': 'Message cannot be empty',
            'string.max': 'Message cannot exceed 2000 characters',
            'any.required': 'Message is required'
        }),
    
    conversationHistory: Joi.array()
        .items(
            Joi.object({
                role: Joi.string().valid('user', 'assistant').required(),
                content: Joi.string().required()
            })
        )
        .max(20)
        .default([])
        .messages({
            'array.max': 'Conversation history too long'
        })
});

// Message Reaction Validation
export const reactionSchema = Joi.object({
    emoji: Joi.string()
        .valid('👍', '❤️', '😂', '😮', '😢', '🙏')
        .required()
        .messages({
            'any.only': 'Invalid emoji reaction',
            'any.required': 'Emoji is required'
        })
});

// Message Edit Validation
export const messageEditSchema = Joi.object({
    message: Joi.string()
        .min(1)
        .max(5000)
        .trim()
        .required()
        .messages({
            'string.min': 'Message cannot be empty',
            'string.max': 'Message cannot exceed 5000 characters',
            'any.required': 'Message is required'
        })
});

/**
 * Validation Middleware
 */
export const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        // Replace req.body with validated and sanitized data
        req.body = value;
        next();
    };
};

/**
 * MongoDB ObjectId Validation
 */
export const validateObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Sanitize user input to prevent XSS
 */
export const sanitizeInput = (input) => {
    if (typeof input === 'string') {
        return input
            .replace(/[<>]/g, '') // Remove < and >
            .trim();
    }
    return input;
};

/**
 * Validate username format
 */
export const validateUsername = (username) => {
    if (!username || typeof username !== 'string') return false;
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
};

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
    if (!password || typeof password !== 'string') {
        return { valid: false, message: 'Password is required' };
    }
    
    if (password.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters long' };
    }
    
    if (password.length > 128) {
        return { valid: false, message: 'Password cannot exceed 128 characters' };
    }
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[@$!%*?&]/.test(password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
        return { 
            valid: false, 
            message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)' 
        };
    }
    
    return { valid: true };
};
