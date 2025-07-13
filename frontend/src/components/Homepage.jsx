import React from 'react'
import MessageContainor from './MessageContainor.jsx'
import Sidebar from './Sidebar.jsx'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

function Homepage() {
  const { authUser } = useSelector(store => store.user);
  const navigate = useNavigate();
  useEffect(() => {
    if (!authUser) {
      navigate("/login");
    }
  }, []);
  return (
    <div className='min-h-screen w-full flex items-center justify-center p-3 sm:p-5'>
      <div 
        className='flex flex-col md:flex-row h-[95vh] w-full max-w-7xl rounded-xl overflow-hidden 
          bg-white/10 backdrop-blur-md shadow-2xl border border-white/20'
      >
        {/* Sidebar - hidden on mobile by default, toggled via button in MessageContainer */}
        <div className="hidden md:block md:w-1/3 lg:w-1/4">
          <Sidebar />
        </div>
        
        {/* Message Container - full width on mobile */}
        <div className="flex-1">
          <MessageContainor />
        </div>
      </div>
    </div>
  )
}

export default Homepage
