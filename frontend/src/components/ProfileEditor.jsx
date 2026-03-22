import { useState, useRef } from 'react';
import { IoClose, IoCheckmark, IoCamera, IoPencil } from 'react-icons/io5';
import { BiUser } from 'react-icons/bi';
import { MdInfo } from 'react-icons/md';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';
import { toast } from 'react-hot-toast';
import { getImageUrl } from '../utils/imageUtils';

function ProfileEditor({ onClose }) {
  const { authUser, updateUser } = useAuth();
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [fullName, setFullName] = useState(authUser?.fullName || '');
  const [about, setAbout] = useState(authUser?.username || '');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);

  const handleNameSave = async () => {
    if (!fullName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    try {
      const response = await apiService.updateProfile({ fullName: fullName.trim() });
      if (response.success) {
        updateUser({ ...authUser, fullName: fullName.trim() });
        toast.success('Name updated successfully');
        setIsEditingName(false);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update name');
    }
  };

  const handleAboutSave = async () => {
    if (!about.trim()) {
      toast.error('About cannot be empty');
      return;
    }

    try {
      const response = await apiService.updateProfile({ username: about.trim() });
      if (response.success) {
        updateUser({ ...authUser, username: about.trim() });
        toast.success('About updated successfully');
        setIsEditingAbout(false);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update about');
    }
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload photo
    handlePhotoUpload(file);
  };

  const handlePhotoUpload = async (file) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('profilePhoto', file);

      const response = await apiService.uploadProfilePhoto(formData);
      
      if (response.success) {
        updateUser({ ...authUser, profilePhoto: response.profilePhoto });
        toast.success('Profile photo updated successfully');
        setPreviewImage(null);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to upload photo');
      setPreviewImage(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
      <div className="h-full w-full max-w-md mx-auto bg-slate-800 flex flex-col">
        {/* Header */}
        <div className="bg-blue-900 p-4 flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-800 rounded-full transition"
          >
            <IoClose className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-xl font-semibold text-white">Profile</h1>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Profile Photo Section */}
          <div className="bg-slate-900 py-8 flex flex-col items-center">
            <div className="relative">
              <div className="w-48 h-48 rounded-full overflow-hidden bg-slate-700 border-4 border-blue-500">
                <img
                  src={previewImage || getImageUrl(authUser?.profilePhoto)}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute bottom-2 right-2 w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg transition disabled:opacity-50"
              >
                <IoCamera className="w-6 h-6 text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Name Section */}
          <div className="bg-slate-800 mt-6">
            <div className="px-4 py-2 bg-slate-900">
              <p className="text-sm text-blue-400">Your name</p>
            </div>
            <div className="px-4 py-4 flex items-center gap-4 border-b border-slate-700">
              <BiUser className="w-6 h-6 text-gray-400" />
              {isEditingName ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="flex-1 bg-transparent text-white text-lg outline-none border-b-2 border-blue-500 pb-1"
                    autoFocus
                    maxLength={50}
                  />
                  <button
                    onClick={handleNameSave}
                    className="p-2 text-blue-500 hover:bg-slate-700 rounded-full"
                  >
                    <IoCheckmark className="w-6 h-6" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    <p className="text-white text-lg">{authUser?.fullName}</p>
                  </div>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="p-2 text-gray-400 hover:bg-slate-700 rounded-full"
                  >
                    <IoPencil className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
            <div className="px-4 py-2">
              <p className="text-xs text-gray-400">
                This is not your username or PIN. This name will be visible to your contacts.
              </p>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-slate-800 mt-6">
            <div className="px-4 py-2 bg-slate-900">
              <p className="text-sm text-blue-400">About</p>
            </div>
            <div className="px-4 py-4 flex items-center gap-4 border-b border-slate-700">
              <MdInfo className="w-6 h-6 text-gray-400" />
              {isEditingAbout ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    className="flex-1 bg-transparent text-white text-lg outline-none border-b-2 border-blue-500 pb-1"
                    autoFocus
                    maxLength={100}
                  />
                  <button
                    onClick={handleAboutSave}
                    className="p-2 text-blue-500 hover:bg-slate-700 rounded-full"
                  >
                    <IoCheckmark className="w-6 h-6" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    <p className="text-white text-lg">{authUser?.username}</p>
                  </div>
                  <button
                    onClick={() => setIsEditingAbout(true)}
                    className="p-2 text-gray-400 hover:bg-slate-700 rounded-full"
                  >
                    <IoPencil className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileEditor;
