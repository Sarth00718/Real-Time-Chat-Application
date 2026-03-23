// API Base URL
export const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/v1/user/login',
  REGISTER: '/api/v1/user/register',
  LOGOUT: '/api/v1/user/logout',
  
  // Users
  GET_USERS: '/api/v1/user',
  UPLOAD_PROFILE_PHOTO: '/api/v1/user/upload-profile-photo',
  
  // Messages
  GET_MESSAGES: (userId) => `/api/v1/message/${userId}`,
  SEND_MESSAGE: (userId) => `/api/v1/message/send/${userId}`,
  MARK_AS_READ: (senderId) => `/api/v1/message/read/${senderId}`,
  DELETE_MESSAGE: (messageId) => `/api/v1/message/delete/${messageId}`,
  DELETE_FOR_EVERYONE: (messageId) => `/api/v1/message/delete-for-everyone/${messageId}`,
  ADD_REACTION: (messageId) => `/api/v1/message/react/${messageId}`,
  REMOVE_REACTION: (messageId) => `/api/v1/message/react/${messageId}`,
  EDIT_MESSAGE: (messageId) => `/api/v1/message/edit/${messageId}`,
  PIN_MESSAGE: (messageId) => `/api/v1/message/${messageId}/pin`,
  UNPIN_MESSAGE: (messageId) => `/api/v1/message/${messageId}/pin`,
  FORWARD_MESSAGE: '/api/v1/message/forward',
  SEND_VOICE_MESSAGE: (userId) => `/api/v1/message/voice/${userId}`,
  UNREAD_COUNT: '/api/v1/message/unread/count',
  UNREAD_PER_USER: '/api/v1/message/unread/per-user',
  
  // Profile
  UPDATE_PROFILE: '/api/v1/profile/update',
  UPLOAD_PHOTO: '/api/v1/profile/upload-photo',
  
  // AI
  AI_CHAT: '/api/v1/ai/chat',
  AI_STREAM: '/api/v1/ai/stream',
  
  // Groups
  CREATE_GROUP: '/api/v1/group/create',
  GET_GROUPS: '/api/v1/group',
  GET_GROUP_DETAILS: (groupId) => `/api/v1/group/${groupId}`,
  ADD_GROUP_MEMBERS: (groupId) => `/api/v1/group/${groupId}/members`,
  REMOVE_GROUP_MEMBER: (groupId, memberId) => `/api/v1/group/${groupId}/members/${memberId}`,
  LEAVE_GROUP: (groupId) => `/api/v1/group/${groupId}/leave`,
  UPDATE_GROUP: (groupId) => `/api/v1/group/${groupId}`,
  UPLOAD_GROUP_PHOTO: (groupId) => `/api/v1/group/${groupId}/photo`,
  
  // Group Messages
  GET_GROUP_MESSAGES: (groupId) => `/api/v1/group/message/${groupId}`,
  SEND_GROUP_MESSAGE: (groupId) => `/api/v1/group/message/${groupId}`
};

// Socket Events
export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  RECONNECT: 'reconnect',
  RECONNECT_ATTEMPT: 'reconnect_attempt',
  RECONNECT_FAILED: 'reconnect_failed',
  
  // Users
  GET_ONLINE_USERS: 'getOnlineUsers',
  USER_ONLINE: 'userOnline',
  USER_OFFLINE: 'userOffline',
  
  // Messages
  NEW_MESSAGE: 'newMessage',
  MESSAGE_DELIVERED: 'messageDelivered',
  MESSAGE_STATUS_UPDATE: 'messageStatusUpdate',
  MESSAGE_DELETED_FOR_EVERYONE: 'messageDeletedForEveryone',
  MESSAGE_REACTION: 'messageReaction',
  MESSAGE_EDITED: 'messageEdited',
  
  // Typing
  TYPING: 'typing',
  STOP_TYPING: 'stopTyping',
  USER_TYPING: 'userTyping',
  GROUP_TYPING: 'groupTyping',
  USER_GROUP_TYPING: 'userGroupTyping',
  
  // Groups
  JOIN_GROUP: 'joinGroup',
  LEAVE_GROUP: 'leaveGroup'
};

// File Upload Limits
export const FILE_LIMITS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_COUNT: 5,
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'video/mp4',
    'video/avi',
    'video/mov',
    'video/quicktime',
    'application/zip',
    'application/x-rar-compressed'
  ]
};

// Message Types
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  FILE: 'file',
  VOICE: 'voice'
};

// Message Status
export const MESSAGE_STATUS = {
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read'
};
