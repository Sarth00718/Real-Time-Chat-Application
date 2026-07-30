import axios from 'axios';
import { BASE_URL, API_ENDPOINTS } from '../config/constants';

/**
 * API Service - Centralized API calls
 */
class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add request interceptor to include token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor to handle 401 errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('authUser');
          
          // Redirect to login if not already there
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials) {
    const response = await this.client.post(API_ENDPOINTS.LOGIN, credentials);
    return response.data;
  }

  async register(userData) {
    const response = await this.client.post(API_ENDPOINTS.REGISTER, userData);
    return response.data;
  }

  async logout() {
    const response = await this.client.get(API_ENDPOINTS.LOGOUT);
    return response.data;
  }

  // User endpoints
  async getUsers() {
    const response = await this.client.get(API_ENDPOINTS.GET_USERS);
    return response.data;
  }

  // Message endpoints
  async getMessages(userId) {
    const response = await this.client.get(API_ENDPOINTS.GET_MESSAGES(userId));
    return response.data;
  }

  async sendMessage(userId, messageData, files = [], replyToId = null) {
    const formData = new FormData();
    
    if (messageData?.trim()) {
      formData.append('message', messageData);
    }
    
    if (replyToId) {
      formData.append('replyToId', replyToId);
    }
    
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await this.client.post(
      API_ENDPOINTS.SEND_MESSAGE(userId),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    return response.data;
  }

  async markMessagesAsRead(senderId) {
    const response = await this.client.put(`/api/v1/message/read/${senderId}`);
    return response.data;
  }

  async getUnreadCount() {
    const response = await this.client.get('/api/v1/message/unread/count');
    return response.data;
  }

  async getUnreadCountPerUser() {
    const response = await this.client.get('/api/v1/message/unread/per-user');
    return response.data;
  }

  async deleteMessageForMe(messageId) {
    const response = await this.client.delete(`/api/v1/message/delete/${messageId}`);
    return response.data;
  }

  async deleteMessageForEveryone(messageId) {
    const response = await this.client.delete(`/api/v1/message/delete-for-everyone/${messageId}`);
    return response.data;
  }

  // Reaction endpoints
  async addReaction(messageId, emoji) {
    const response = await this.client.post(`/api/v1/message/react/${messageId}`, { emoji });
    return response.data;
  }

  async removeReaction(messageId) {
    const response = await this.client.delete(`/api/v1/message/react/${messageId}`);
    return response.data;
  }

  // Edit message
  async editMessage(messageId, message) {
    const response = await this.client.put(`/api/v1/message/edit/${messageId}`, { message });
    return response.data;
  }

  // Pin message
  async pinMessage(messageId) {
    const response = await this.client.post(`/api/v1/message/${messageId}/pin`);
    return response.data;
  }

  async unpinMessage(messageId) {
    const response = await this.client.delete(`/api/v1/message/${messageId}/pin`);
    return response.data;
  }

  // Profile photo upload
  async uploadProfilePhoto(formData) {
    const response = await this.client.post('/api/v1/profile/upload-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  // Update profile (name, about)
  async updateProfile(data) {
    const response = await this.client.put('/api/v1/profile/update', data);
    return response.data;
  }

  // AI Chat endpoints
  async chatWithAI(message, conversationHistory = []) {
    const response = await this.client.post('/api/v1/ai/chat', {
      message,
      conversationHistory
    });
    return response.data;
  }

  async streamChatWithAI(message, conversationHistory = []) {
    const response = await this.client.post('/api/v1/ai/stream', {
      message,
      conversationHistory
    }, {
      responseType: 'stream'
    });
    return response.data;
  }

  // Group endpoints
  async createGroup(groupData) {
    const response = await this.client.post('/api/v1/group/create', groupData);
    return response.data;
  }

  async getUserGroups() {
    const response = await this.client.get('/api/v1/group');
    return response.data.groups || [];
  }

  async getGroupDetails(groupId) {
    const response = await this.client.get(`/api/v1/group/${groupId}`);
    return response.data.group;
  }

  async addGroupMembers(groupId, memberIds) {
    const response = await this.client.post(`/api/v1/group/${groupId}/members`, { memberIds });
    return response.data;
  }

  async removeGroupMember(groupId, memberId) {
    const response = await this.client.delete(`/api/v1/group/${groupId}/members/${memberId}`);
    return response.data;
  }

  async leaveGroup(groupId) {
    const response = await this.client.post(`/api/v1/group/${groupId}/leave`);
    return response.data;
  }

  async updateGroup(groupId, groupData) {
    const response = await this.client.put(`/api/v1/group/${groupId}`, groupData);
    return response.data;
  }

  async uploadGroupPhoto(groupId, formData) {
    const response = await this.client.post(`/api/v1/group/${groupId}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  // Group message endpoints
  async getGroupMessages(groupId) {
    const response = await this.client.get(`/api/v1/group/message/${groupId}`);
    return response.data;
  }

  async sendGroupMessage(groupId, messageData, files = [], replyToId = null) {
    const formData = new FormData();
    
    if (messageData?.trim()) {
      formData.append('message', messageData);
    }
    
    if (replyToId) {
      formData.append('replyToId', replyToId);
    }
    
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await this.client.post(
      `/api/v1/group/message/${groupId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
