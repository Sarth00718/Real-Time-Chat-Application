import { User } from '../models/usermodel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * Auth Service - Handles authentication business logic
 */
class AuthService {
  /**
   * Generate JWT token
   */
  generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1d' });
  }

  /**
   * Get cookie options based on environment
   */
  getCookieOptions() {
    const isProduction = process.env.NODE_ENV === 'production';
    return {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'None' : 'Lax',
      path: '/'
    };
  }

  /**
   * Generate random avatar path
   */
  generateAvatarPath(gender) {
    const BOY_AVATAR_PATH = '/images/boy/';
    const GIRL_AVATAR_PATH = '/images/girl/';
    
    if (gender === 'male') {
      const avatarNum = Math.floor(Math.random() * 50) + 1;
      return `${BOY_AVATAR_PATH}AV${avatarNum}.png`;
    } else {
      const avatarNum = Math.floor(Math.random() * 50) + 51;
      return `${GIRL_AVATAR_PATH}AV${avatarNum}.png`;
    }
  }

  /**
   * Hash password
   */
  async hashPassword(password) {
    return bcrypt.hash(password, 10);
  }

  /**
   * Compare password
   */
  async comparePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Create user
   */
  async createUser(userData) {
    const { fullName, username, password, gender } = userData;
    
    const hashedPassword = await this.hashPassword(password);
    const profilePhoto = this.generateAvatarPath(gender);

    return User.create({
      fullName,
      username,
      password: hashedPassword,
      profilePhoto,
      gender
    });
  }

  /**
   * Find user by username
   */
  async findUserByUsername(username) {
    return User.findOne({ username });
  }

  /**
   * Format user response (exclude password)
   */
  formatUserResponse(user, token) {
    return {
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      profilePhoto: user.profilePhoto,
      token
    };
  }
}

export default new AuthService();
