import React, { useState } from 'react';
import { IoSend } from 'react-icons/io5';
import { BsEmojiSmile } from 'react-icons/bs';
import EmojiPicker from 'emoji-picker-react';
import { useSelector, useDispatch } from 'react-redux';
import { setMessages } from '../redux/messageSlice.js';
import axios from 'axios';
import { BASE_URL } from '../main';

function SendInput() {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const { selectedUser } = useSelector(store => store.user);
  const { messages } = useSelector(store => store.message);
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage || !selectedUser?._id) return;

    try {
      const res = await axios.post(
        `${BASE_URL}/api/v1/message/send/${selectedUser._id}`,
        { message: trimmedMessage },
        {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      dispatch(setMessages([...messages, res.data?.newMessage]));
      setMessage('');
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const isDisabled = !message.trim();

  const onEmojiClick = (emojiData) => {
    setMessage(prev => prev + emojiData.emoji);
  };

  return (
    <div className="relative py-4 md:pb-3 border-t border-white/10 bg-blue-900/40 backdrop-blur-md p-4">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        {/* Emoji button */}
        <button
          type="button"
          onClick={() => setShowEmojiPicker(prev => !prev)}
          className="text-white text-xl p-2 rounded-full hover:bg-white/20 transition"
          aria-label="Toggle Emoji Picker"
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
          />

          <button
            type="submit"
            disabled={isDisabled}
            className={`absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center 
                        rounded-full transition-all ${
                          isDisabled 
                            ? 'bg-gray-500/50 cursor-not-allowed opacity-50' 
                            : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:scale-105'
                        } text-white`}
            aria-label="Send message"
          >
            <IoSend className="w-5 h-5" />
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
