import { useState, useRef, useEffect } from 'react';
import { IoSend, IoAttach, IoClose, IoDocument, IoImage } from 'react-icons/io5';
import { BsEmojiSmile } from 'react-icons/bs';
import EmojiPicker from 'emoji-picker-react';
import { useChat } from '../contexts/ChatContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useTypingIndicator } from '../hooks/useTypingIndicator';
import FilePreview from './FilePreview';
import { toast } from 'react-hot-toast';

function SendInput({ replyToMessage, onCancelReply }) {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const isOnline = useOnlineStatus();
  const { sendTypingIndicator } = useTypingIndicator();

  const { sendMessage: sendMsg } = useChat();

  // Handle typing indicator
  useEffect(() => {
    if (message.trim()) {
      sendTypingIndicator(true);
    } else {
      sendTypingIndicator(false);
    }
  }, [message, sendTypingIndicator]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Stop typing indicator
    sendTypingIndicator(false);
    
    // Check online status
    if (!isOnline) {
      toast.error('You are offline. Please check your internet connection.');
      return;
    }
    
    const trimmedMessage = message.trim();
    if (!trimmedMessage && selectedFiles.length === 0) return;

    setIsUploading(true);

    const result = await sendMsg(trimmedMessage, selectedFiles, replyToMessage?._id);

    setIsUploading(false);

    if (result.success) {
      setMessage('');
      setSelectedFiles([]);
      if (onCancelReply) onCancelReply();
    } else {
      toast.error(result.error || 'Failed to send message');
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Check total file count
    if (selectedFiles.length + files.length > 5) {
      toast.error('Maximum 5 files allowed. Please remove some files first.');
      return;
    }
    
    // Validate each file
    const validFiles = [];
    const errors = [];
    
    files.forEach(file => {
      // Check file size (10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        errors.push(`${file.name} is too large (max 10MB)`);
        return;
      }
      
      // Check file type
      const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'video/mp4', 'video/avi', 'video/mov', 'video/quicktime',
        'application/zip', 'application/x-rar-compressed'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name} has invalid file type`);
        return;
      }
      
      validFiles.push(file);
    });

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles].slice(0, 5)); // Ensure max 5 files
      toast.success(`${validFiles.length} file(s) added`);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) {
      return <IoImage className="w-4 h-4 text-blue-400" />;
    }
    return <IoDocument className="w-4 h-4 text-gray-400" />;
  };

  const isDisabled = (!message.trim() && selectedFiles.length === 0) || !isOnline;

  const onEmojiClick = (emojiData) => {
    setMessage(prev => prev + emojiData.emoji);
  };

  return (
    <div className="relative py-4 md:pb-3 border-t border-white/10 bg-blue-900/40 backdrop-blur-md p-4">
      {/* Reply Preview Section */}
      {replyToMessage && (
        <div className="flex items-center justify-between bg-white/10 p-3 rounded-t-lg border-l-4 border-blue-500 mb-2">
          <div className="flex flex-col overflow-hidden">
            <span className="text-blue-300 text-sm font-semibold">
              Replying to {replyToMessage?.senderId?.fullName || 'User'}
            </span>
            <span className="text-white/80 text-sm truncate">
              {replyToMessage?.message || 'Attachment'}
            </span>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            className="text-white/60 hover:text-white p-1 rounded-full hover:bg-white/20 transition"
          >
            <IoClose size={20} />
          </button>
        </div>
      )}

      {/* File Preview Section */}
      <FilePreview files={selectedFiles} onRemove={removeFile} />

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        {/* File attachment button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-white text-xl p-2 rounded-full hover:bg-white/20 transition"
          aria-label="Attach Files"
          disabled={isUploading || selectedFiles.length >= 5}
          title={selectedFiles.length >= 5 ? 'Maximum 5 files allowed' : 'Attach files'}
        >
          <IoAttach />
        </button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          name='files'
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
            className="w-full py-3 pl-5 pr-14 rounded-full bg-white/10 border border-white/20
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
            aria-label={isUploading ? 'Uploading...' : !isOnline ? 'Offline' : 'Send message'}
            title={!isOnline ? 'You are offline' : ''}
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
