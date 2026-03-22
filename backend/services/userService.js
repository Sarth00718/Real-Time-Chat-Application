import { User } from '../models/usermodel.js';

/**
 * User Service - Handles user-related business logic
 */
class UserService {
  /**
   * Get all users except the specified user
   */
  async getOtherUsers(userId) {
    return User.find({ _id: { $ne: userId } }).select('-password');
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    return User.findById(userId).select('-password');
  }

  /**
   * Check if user exists
   */
  async userExists(username) {
    const user = await User.findOne({ username });
    return !!user;
  }
}

export default new UserService();
