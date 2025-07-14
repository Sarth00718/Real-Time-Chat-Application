import React, { useState, useRef } from 'react';
import { IoSend, IoAttach, IoClose, IoDocument, IoImage } from 'react-icons/io5';
import { BsEmojiSmile } from 'react-icons/bs';
import EmojiPicker from 'emoji-picker-react';
import { useSelector, useDispatch } from 'react-redux';
import { setMessages } from '../redux/messageSlice.js';
import axios from 'axios';
import { BASE_URL } from '../main';

function SendInput() {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const { selectedUser } = useSelector(store => store.user);
  const { messages } = useSelector(store => store.message);
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage && selectedFiles.length === 0) return;
    if (!selectedUser?._id) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      
      // Add text message if exists
      if (trimmedMessage) {
        formData.append('message', trimmedMessage);
      }
      
      // Add files if selected
      selectedFiles.forEach((file, index) => {
        formData.append('files', file);
      });

      const res = await axios.post(
        `${BASE_URL}/api/v1/message/send/${selectedUser._id}`,
        formData,
        {
          withCredentials: true,
        }
      );

      dispatch(setMessages([...messages, res.data?.newMessage]));
      setMessage('');
      setSelectedFiles([]);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      // Limit file size to 10MB
      const maxSize = 1000 * 1024 * 1024;
      return file.size <= maxSize;
    });

    if (validFiles.length !== files.length) {
      alert('Some files were too large (max 1000MB) and were not added.');
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) {
      return <IoImage className="w-4 h-4 text-blue-400" />;
    }
    return <IoDocument className="w-4 h-4 text-gray-400" />;
  };

  const isDisabled = !message.trim() && selectedFiles.length === 0;

  const onEmojiClick = (emojiData) => {
    setMessage(prev => prev + emojiData.emoji);
  };

  return (
    <div className="relative py-4 md:pb-3 border-t border-white/10 bg-blue-900/40 backdrop-blur-md p-4">
      {/* File Preview Section */}
      {selectedFiles.length > 0 && (
        <div className="mb-3 space-y-2">
          <div className="text-sm text-gray-300 mb-2">
            {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected:
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-white/10 rounded-lg p-2 text-sm text-white max-w-xs"
              >
                {getFileIcon(file.type)}
                <div className="flex-1 min-w-0">
                  <div className="truncate font-medium">{file.name}</div>
                  <div className="text-xs text-gray-400">
                    {formatFileSize(file.size)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                  aria-label="Remove file"
                >
                  <IoClose className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        {/* File attachment button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-white text-xl p-2 rounded-full hover:bg-white/20 transition"
          aria-label="Attach Files"
          disabled={isUploading}
        >
          <IoAttach />
        </button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar"
        />

        {/* Emoji button */}
        <button
          type="button"
          onClick={() => setShowEmojiPicker(prev => !prev)}
          className="text-white text-xl p-2 rounded-full hover:bg-white/20 transition"
          aria-label="Toggle Emoji Picker"
          disabled={isUploading}
        >
          <BsEmojiSmile />
        </button>

        {/* Input + send */}
        <div className="relative w-full">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="w-full py-3 px-5 rounded-full bg-white/10 border border-white/20
                       placeholder-gray-300 text-white focus:outline-none focus:ring-2
                       focus:ring-blue-500/50 focus:border-transparent shadow-inner text-base"
            autoComplete="off"
            disabled={isUploading}
          />

          <button
            type="submit"
            disabled={isDisabled || isUploading}
            className={`absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center
                       rounded-full transition-all ${
                         isDisabled || isUploading
                           ? 'bg-gray-500/50 cursor-not-allowed opacity-50'
                           : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:scale-105'
                       } text-white`}
            aria-label={isUploading ? 'Uploading...' : 'Send message'}
          >
            {isUploading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <IoSend className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>

      {/* Emoji Picker Dropdown */}
      {showEmojiPicker && (
        <div className="absolute bottom-[90px] left-4 z-50">
          <EmojiPicker
            onEmojiClick={onEmojiClick}
            height={350}
            width={280}
          />
        </div>
      )}
    </div>
  );
}

export default SendInput;