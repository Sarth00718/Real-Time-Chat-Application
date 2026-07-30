import { useEffect } from 'react';
import MessageContainor from './MessageContainor.jsx';
import Sidebar from './Sidebar.jsx';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

function Homepage() {
  const { authUser } = useAuth();
  const { selectedUser, selectedGroup } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authUser) {
      navigate('/login');
    }
  }, [authUser, navigate]);

  const hasSelectedChat = !!(selectedUser || selectedGroup);

  return (
    <div className='min-h-screen w-full flex items-center justify-center p-0 md:p-3 sm:p-5'>
      <div 
        className='flex flex-col md:flex-row h-[100dvh] md:h-[95vh] w-full max-w-7xl md:rounded-xl overflow-hidden 
          bg-white/10 backdrop-blur-md md:shadow-2xl md:border border-white/20'
      >
        {/* Sidebar - Shows full width on mobile if NO chat is selected, but takes 1/3 width on desktop always */}
        <div className={`${hasSelectedChat ? 'hidden md:block' : 'block'} w-full md:w-1/3 lg:w-1/4 h-full`}>
          <Sidebar />
        </div>
        
        {/* Message Container - Shows full width on mobile if a chat IS selected, but takes remaining width on desktop always */}
        <div className={`${hasSelectedChat ? 'block' : 'hidden md:flex'} flex-1 h-full`}>
          <MessageContainor />
        </div>
      </div>
    </div>
  );
}

export default Homepage;
