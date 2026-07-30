import { useState } from 'react';
import Messages from './Messages.jsx';
import SendInput from './SendInput.jsx';
import { BiArrowBack, BiMenu } from 'react-icons/bi';
import { IoSparkles } from 'react-icons/io5';
import { HiUserGroup } from 'react-icons/hi';
import Sidebar from './Sidebar.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import AIChat from './AIChat.jsx';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { getImageUrl } from '../utils/imageUtils';

function MessageContainor() {
  const { authUser } = useAuth();
  const { selectedUser, setSelectedUser, selectedGroup, setSelectedGroup, onlineUsers } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);

  const isOnline = onlineUsers?.includes(selectedUser?._id) ?? false;
  const currentChat = selectedGroup || selectedUser;
  const isGroupChat = !!selectedGroup;

  const handleBack = () => {
    setSelectedUser(null);
    setSelectedGroup(null);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50" onClick={toggleSidebar}></div>
          {/* Sidebar Panel */}
          <div className="relative bg-blue-900 w-4/5 max-w-xs h-full z-50 shadow-lg overflow-y-auto">
            <Sidebar />
            <button
              onClick={toggleSidebar}
              className="absolute top-3 right-3 bg-white/10 hover:bg-white/20 rounded-full p-2 text-white"
            >
              <BiArrowBack size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Main Chat Section */}
      <div className="flex flex-col flex-1 h-full min-h-0 w-full bg-blue-500/40 md:rounded-none">
        {/* AI Chat Modal */}
        {showAIChat && (
          <AIChat onClose={() => setShowAIChat(false)} />
        )}

        {currentChat ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 bg-blue-900/40 p-3 border-b border-white/20">
              {/* Mobile Menu Button */}
              <button className="md:hidden text-white" onClick={toggleSidebar}>
                <BiMenu size={24} />
              </button>

              <div className="relative w-12 h-12">
                {isGroupChat ? (
                  currentChat?.groupPhoto ? (
                    <img
                      src={getImageUrl(currentChat?.groupPhoto)}
                      alt="group-profile"
                      className="rounded-full ring ring-white/30 ring-offset-base-100 ring-offset-2 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="rounded-full ring ring-white/30 ring-offset-base-100 ring-offset-2 w-full h-full bg-blue-500 flex items-center justify-center">
                      <HiUserGroup className="w-6 h-6 text-white" />
                    </div>
                  )
                ) : (
                  <>
                    <img
                      src={getImageUrl(currentChat?.profilePhoto)}
                      alt="chat-profile"
                      className="rounded-full ring ring-white/30 ring-offset-base-100 ring-offset-2 w-full h-full object-cover"
                    />
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white"></span>
                    )}
                  </>
                )}
              </div>

              <div className="flex-1">
                <p className="text-white font-semibold">
                  {isGroupChat ? currentChat?.name : currentChat?.fullName}
                </p>
                <p className="text-xs text-gray-300">
                  {isGroupChat 
                    ? `${currentChat?.members?.length || 0} members` 
                    : currentChat?.username
                  }
                </p>
              </div>

              {/* AI Assistant Button */}
              <button
                onClick={() => setShowAIChat(true)}
                className="p-2 hover:bg-blue-700 rounded-lg transition text-white"
                title="AI Assistant"
              >
                <IoSparkles className="w-6 h-6" />
              </button>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Back Button */}
              <button
                className="md:hidden bg-white/20 hover:bg-white/30 rounded-full p-2 text-white"
                onClick={handleBack}
              >
                <BiArrowBack size={16} />
              </button>
            </div>

            {/* Messages & Input */}
            <div className="flex-1 flex flex-col overflow-hidden h-full min-h-0">
              <Messages />
              <SendInput />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full w-full p-6 text-center relative">
            {/* Mobile Menu Button */}
            <button
              className="md:hidden absolute top-4 left-4 bg-indigo-600/50 text-white p-2 rounded-full"
              onClick={toggleSidebar}
            >
              <BiMenu size={24} />
            </button>

            {/* AI Assistant Button - Top Right */}
            <button
              onClick={() => setShowAIChat(true)}
              className="absolute top-4 right-4 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition flex items-center gap-2"
              title="AI Assistant"
            >
              <IoSparkles className="w-6 h-6" />
            </button>

            <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl max-w-md w-full">
              <h1 className="text-white text-2xl font-bold mb-2">Welcome, {authUser?.fullName}!</h1>
              <p className="text-gray-300 mb-6">Select a user from the sidebar to start chatting</p>

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
