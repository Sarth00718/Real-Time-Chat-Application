import React, { useState, useEffect } from 'react';
import { BiSearchAlt2 } from 'react-icons/bi';
import { FiLogOut } from 'react-icons/fi';
import { MdClear } from 'react-icons/md';
import OtherUsers from './OtherUsers.jsx';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setAuthUser, setOtherUsers, setSelectedUser } from '../redux/userSlice';
import { setMessages } from '../redux/messageSlice';
import { BASE_URL } from '../main';

const Sidebar = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [originalUsers, setOriginalUsers] = useState([]);
    const { otherUsers, authUser } = useSelector(store => store.user);
    const dispatch = useDispatch();

    // Store original users list when component mounts or otherUsers changes
    useEffect(() => {
        if (otherUsers && otherUsers.length > 0 && originalUsers.length === 0) {
            setOriginalUsers(otherUsers);
        }
    }, [otherUsers, originalUsers.length]);

    // Real-time search as user types
    useEffect(() => {
        if (search.trim() === '') {
            // If search is empty, restore original users
            if (originalUsers.length > 0) {
                dispatch(setOtherUsers(originalUsers));
            }
        } else {
            // Filter users based on search term
            const filteredUsers = originalUsers.filter(user =>
                user.fullName.toLowerCase().includes(search.toLowerCase()) ||
                user.username.toLowerCase().includes(search.toLowerCase())
            );
            dispatch(setOtherUsers(filteredUsers));
        }
    }, [search, originalUsers, dispatch]);

    // Fix the image URL to include backend server
    const getImageUrl = (profilePhoto) => {
        return `${BASE_URL}${profilePhoto}`;
    };

    const logoutHandler = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/v1/user/logout`);
            navigate('/login');
            toast.success(res.data.message);
            dispatch(setAuthUser(null));
            dispatch(setMessages(null));
            dispatch(setOtherUsers(null));
            dispatch(setSelectedUser(null));
        } catch (error) {
            console.error("Logout failed:", error);
            toast.error(error.response?.data?.message || "Logout failed!");
        }
    };

    // Handle search form submission (optional - mainly for accessibility)
    const searchSubmitHandler = (e) => {
        e.preventDefault();
        // Form submission is handled by useEffect above
        // This is kept for accessibility (Enter key functionality)
    };

    // Clear search function
    const clearSearch = () => {
        setSearch('');
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    return (
        <div className='h-full bg-blue-400/40 backdrop-blur-md flex flex-col p-4'>
            {/* User profile section */}
            <div className="flex items-center gap-3 mb-4 p-3 bg-white/10 rounded-lg">
                <div className="avatar online">
                    <div className="w-12 h-12 rounded-full">
                        <img 
                            src={getImageUrl(authUser?.profilePhoto, authUser)} 
                            alt="Your profile"
                            className="w-full h-full object-cover rounded-full"
                        />
                    </div>
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-white truncate">{authUser?.fullName}</h3>
                    <p className="text-xs text-gray-600 truncate">{authUser?.username}</p>
                </div>
            </div>
            
            {/* Search section */}
            <form onSubmit={searchSubmitHandler} className='flex items-center gap-2 mb-4'>
                <div className="relative flex-1">
                    <input
                        value={search}
                        onChange={handleSearchChange}
                        className='input input-bordered bg-white/20 text-white placeholder-gray-300 w-full pr-10 focus:ring-2 focus:ring-blue-400 focus:border-transparent'
                        type="text"
                        placeholder='Search users...'
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={clearSearch}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white transition-colors"
                        >
                            <MdClear className='w-5 h-5' />
                        </button>
                    )}
                </div>
                <button type='submit' className='btn bg-blue-900 hover:bg-blue-700 border-none text-white'>
                    <BiSearchAlt2 className='w-5 h-5' />
                </button>
            </form>

            {/* Search results indicator */}
            {search && (
                <div className="text-sm text-gray-300 mb-2">
                    {otherUsers?.length === 0 ? (
                        <span className="text-red-300">No users found for "{search}"</span>
                    ) : (
                        <span>
                            {otherUsers?.length} user{otherUsers?.length !== 1 ? 's' : ''} found
                        </span>
                    )}
                </div>
            )}

            <div className="divider before:bg-white/30 after:bg-white/30 text-white/70">
                {search ? 'Search Results' : 'Contacts'}
            </div>

            {/* Users list - Scrollable */}
            <div className="flex-1 flex flex-col min-h-0">
                <div className="overflow-y-auto flex-1 pr-1"
                    style={{ 
                        scrollbarWidth: 'thin', 
                        msOverflowStyle: 'none'
                    }}
                >
                    {otherUsers?.length === 0 && search ? (
                        <div className="text-center text-gray-400 py-8">
                            <BiSearchAlt2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No users found matching "{search}"</p>
                            <button 
                                onClick={clearSearch}
                                className="text-blue-400 hover:text-blue-300 mt-2 text-sm"
                            >
                                Clear search
                            </button>
                        </div>
                    ) : (
                        <OtherUsers />
                    )}
                </div>
            </div>

            {/* Logout button */}
            <button 
                className='btn btn-sm bg-blue-900 hover:bg-blue-600 text-white border-none mt-3 w-full flex items-center justify-center gap-2'
                onClick={logoutHandler}
            >
                <FiLogOut /> Logout
            </button>
        </div>
    );
};

export default Sidebar;