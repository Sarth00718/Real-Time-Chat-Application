import { BASE_URL } from '../config/constants';

/**
 * Get full image URL from relative path
 */
export const getImageUrl = (profilePhoto) => {
  if (!profilePhoto) return '';
  
  // If already a full URL, return as is
  if (profilePhoto.startsWith('http')) {
    return profilePhoto;
  }
  
  // Otherwise, prepend BASE_URL
  return `${BASE_URL}${profilePhoto}`;
};

/**
 * Format file size in human-readable format
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Check if file is an image
 */
export const isImageFile = (filename) => {
  return /\.(png|jpe?g|gif|webp)$/i.test(filename);
};
