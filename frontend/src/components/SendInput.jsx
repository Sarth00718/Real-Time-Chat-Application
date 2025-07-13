import React, { useState } from 'react';
import { IoSend } from 'react-icons/io5';
import { useSelector, useDispatch } from 'react-redux';
import { setMessages } from '../redux/messageSlice.js';
import axios from 'axios';
import { BASE_URL } from '../main';

function SendInput() {
  const [message, setMessage] = useState('');
  const { selectedUser, authUser } = useSelector(store => store.user);
  const { messages } = useSelector(store => store.message);
  const dispatch = useDispatch();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    try {
      if (!selectedUser?._id) {
        console.error("No valid recipient selected");
        return;
      }
      const res = await axios.post(`${BASE_URL}/api/v1/message/send/${selectedUser._id}`, {
        message: message.trim()  // Ensure we're sending trimmed message
      }, {
        withCredentials: true, 
        headers: {
          'Content-Type': 'application/json',
        }
      });
      dispatch(setMessages([...messages, res?.data?.newMessage]))
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="pb-[35px] md:pb-[12px] border-t border-white/10 bg-blue-900/40 backdrop-blur-sm p-4 shadow-lg">
      <form onSubmit={handleSubmit} className='flex items-center'>
        <div className='w-full relative rounded-full overflow-hidden'>
          <input
            value={message}
            onChange={(e)=>setMessage(e.target.value)}
            type="text"
            placeholder='Type your message...'
            className='border text-base rounded-full block w-full py-3 px-5 border-white/20 
              bg-white/10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 
              focus:ring-blue-500/50 focus:border-transparent shadow-inner'
          />
          
          <button 
            type="submit" 
            disabled={!message.trim()}
            className={`absolute flex items-center justify-center right-2 top-1/2 transform -translate-y-1/2 
              rounded-full w-10 h-10 text-white transition-all ${message.trim() ? 
              'bg-gradient-to-r from-blue-600 to-blue-500 opacity-100' : 
              'bg-gray-500/50 opacity-50 cursor-not-allowed'}`}
          >
            <IoSend />
          </button>
        </div>
      </form>
    </div>
  );
}

export default SendInput;
