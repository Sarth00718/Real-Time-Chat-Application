import React, { useState } from 'react';
import Messages from './Messages.jsx';
import SendInput from './SendInput.jsx';
import { useSelector, useDispatch } from 'react-redux';
import { BiArrowBack, BiMenu } from 'react-icons/bi';
import { setSelectedUser } from '../redux/userSlice.js';
import Sidebar from './Sidebar.jsx';

function MessageContainor() {
  const { selectedUser, authUser, onlineUsers } = useSelector(store => store.user);
  const dispatch = useDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Guard against null or undefined onlineUsers
  const isOnline = onlineUsers?.includes(selectedUser?._id) ?? false;

  const handleBack = () => {
    dispatch(setSelectedUser(null));
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={toggleSidebar}></div>
          <div className="absolute top-0 left-0 h-full w-4/5 max-w-xs">
            <Sidebar />
            <button 
              onClick={toggleSidebar}
              className="absolute top-4 right-4 bg-white/20 rounded-full p-2 text-white"
            >
              <BiArrowBack size={20} />
            </button>
          </div>
        </div>
      )}
    
      <div className="flex flex-col h-full w-full bg-blue-500/40">
        {selectedUser !== null ? (
          <>
            <div className="flex gap-2 items-center bg-blue-900/40 p-3 border-b border-white/20">
              {/* Mobile menu button */}
              <button 
                className="md:hidden mr-2 text-white" 
                onClick={toggleSidebar}
              >
                <BiMenu size={24} />
              </button>
              
              <div className={`avatar ${isOnline ? 'online' : 'offline'}`}>
                <div className="w-12 rounded-full ring ring-white/30 ring-offset-base-100 ring-offset-2">
                  <img src={selectedUser?.profilePhoto} alt="user-profile" />
                </div>
              </div>
              
              <div className="flex flex-col flex-1">
                <p className="font-semibold text-white">{selectedUser?.fullName}</p>
                <p className="text-xs text-gray-300">
                  {isOnline ? 'Online now' : 'Offline'}
                </p>
              </div>
              
              {/* Mobile back button */}
              <button 
                className="md:hidden ml-2 bg-white/20 rounded-full p-2 text-white" 
                onClick={handleBack}
              >
                <BiArrowBack size={16} />
              </button>
            </div>
            
            {/* Message area with proper overflow handling */}
            <div className="flex-1 flex flex-col overflow-hidden max-h-[calc(100vh-80px)] md:max-h-none bg-blue-950/40">
              <Messages />
              <SendInput />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full w-full p-6 text-center">
            {/* Mobile menu button when no chat is selected */}
            <button 
              className="md:hidden absolute top-4 left-4 text-white p-2 rounded-full bg-indigo-600/50" 
              onClick={toggleSidebar}
            >
              <BiMenu size={24} />
            </button>
            
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl max-w-md">
              <h1 className="text-white text-2xl font-bold mb-2">Welcome, {authUser?.fullName}!</h1>
              <p className="text-gray-300 mb-6">Select a user from the sidebar to start chatting</p>
              
              {/* Show sidebar button on mobile */}
              <button 
                onClick={toggleSidebar} 
                className="btn bg-blue-600 hover:bg-blue-700 text-white border-none md:hidden"
              >
                View Contacts
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default MessageContainor;