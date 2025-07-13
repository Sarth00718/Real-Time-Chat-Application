import React, { useState } from 'react';
import { BiSearchAlt2 } from 'react-icons/bi';
import { FiLogOut } from 'react-icons/fi';
import OtherUsers from './OtherUsers.jsx';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setAuthUser,setOtherUsers, setSelectedUser} from '../redux/userSlice';
import { setMessages } from '../redux/messageSlice';
import { BASE_URL } from '../main';

const Sidebar = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const { otherUsers, authUser  } = useSelector(store => store.user);
    const dispatch = useDispatch();

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

    // Live filter users
    const searchSubmitHandler = (e) => {
        e.preventDefault();
        const conversationUser = otherUsers?.find((user)=> user.fullName.toLowerCase().includes(search.toLowerCase()));
        if(conversationUser){
            dispatch(setOtherUsers([conversationUser]));
        }else{
            toast.error("User not found!");
        }
    }

    return (
        <div className='h-full bg-blue-900/40 backdrop-blur-md flex flex-col p-4'>
            {/* User profile section */}
            <div className="flex items-center gap-3 mb-4 p-3 bg-white/10 rounded-lg">
                <div className="avatar online">
                    <div className="w-12 h-12 rounded-full">
                        <img src={authUser?.profilePhoto} alt="Your profile" />
                    </div>
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-white truncate">{authUser?.fullName}</h3>
                    <p className="text-xs text-gray-300 truncate">{authUser?.username}</p>
                </div>
            </div>
            
            {/* Search section */}
            <form onSubmit={searchSubmitHandler} className='flex items-center gap-2 mb-4'>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className='input input-bordered bg-white/20 text-white placeholder-gray-300 w-full focus:ring-2 focus:ring-blue-400 focus:border-transparent'
                    type="text"
                    placeholder='Search users...'
                />
                <button type='submit' className='btn bg-blue-900 hover:bg-blue-700 border-none text-white'>
                    <BiSearchAlt2 className='w-5 h-5' />
                </button>
            </form>

            <div className="divider before:bg-white/30 after:bg-white/30 text-white/70">Contacts</div>

            {/* Users list - Scrollable */}
            <div className="flex-1 flex flex-col min-h-0">
                <div className="overflow-y-auto flex-1 pr-1"
                    style={{ 
                        scrollbarWidth: 'thin', 
                        msOverflowStyle: 'none'
                    }}
                >
                    <OtherUsers />
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
