// Input validation utilities

export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validateUsername = (username) => {
    // Username: 3-20 characters, alphanumeric and underscore only
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
};

export const validatePassword = (password) => {
    // Password: minimum 6 characters
    return password && password.length >= 6;
};

export const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    // Remove potential XSS characters
    return input.trim().replace(/[<>]/g, '');
};

export const validateObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
};
