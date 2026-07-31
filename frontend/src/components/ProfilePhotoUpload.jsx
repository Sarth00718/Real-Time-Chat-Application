import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoCamera, IoClose } from 'react-icons/io5';
import { toast } from 'react-hot-toast';
import apiService from '../services/apiService';
import LoadingSpinner from './LoadingSpinner';

const ProfilePhotoUpload = ({ currentPhoto, onPhotoUpdate, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('profilePhoto', selectedFile);

      const data = await apiService.uploadProfilePhoto(formData);
      
      toast.success('Profile photo updated successfully!');
      onPhotoUpdate(data.profilePhoto);
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.error || 'Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 max-w-md w-full mx-4"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Update Profile Photo</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <IoClose className="w-6 h-6" />
          </button>
        </div>

        {/* Preview */}
        <div className="flex justify-center mb-4">
          <div className="relative w-40 h-40">
            <img
              src={preview || currentPhoto}
              alt="Profile preview"
              className="w-full h-full rounded-full object-cover border-4 border-gray-700"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 transition-colors"
              disabled={isUploading}
            >
              <IoCamera className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Info text */}
        <p className="text-sm text-gray-400 text-center mb-4">
          Click the camera icon to select a new photo
          <br />
          <span className="text-xs">Max size: 5MB • Formats: JPG, PNG, WebP</span>
        </p>

        {/* Action buttons */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors"
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? (
              <>
                <LoadingSpinner size="sm" color="white" />
                Uploading...
              </>
            ) : (
              'Upload'
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePhotoUpload;
