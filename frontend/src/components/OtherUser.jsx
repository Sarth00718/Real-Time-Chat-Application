import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedUser } from '../redux/userSlice.js';

const OtherUser = ({ user }) => {
    const dispatch = useDispatch();
    const { selectedUser, onlineUsers } = useSelector(store => store.user);

    // Safe check for .includes on possible null
    const isOnline = onlineUsers?.includes(user._id) ?? false;

    const selectedUserHandler = (user) => {
        dispatch(setSelectedUser(user));
    };

    const isSelected = selectedUser?._id === user?._id;

    return (
        <div
            onClick={() => selectedUserHandler(user)}
            className={`mb-2 p-3 rounded-xl cursor-pointer ${isSelected
                    ? 'bg-blue-400 shadow-md'
                    : 'hover:bg-white/10'
                }`}
        >
            <div className="flex items-center gap-3">
                <div className="relative w-12 h-12">
                    <img
                        src={user?.profilePhoto}
                        alt={`${user?.fullName}'s profile`}
                        className={`rounded-full ring ${isSelected ? 'ring-white' : 'ring-blue-400/30'} ring-offset-base-100 ring-offset-1 w-full h-full object-cover`}
                    />
                    {isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white"></span>
                    )}
                </div>

                <div className='flex-1 min-w-0'>
                    <div className='flex justify-between items-center'>
                        <h3 className={`font-medium truncate ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                            {user?.fullName}
                        </h3>
                    </div>

                    <div className="flex justify-between items-center mt-1">
                        <p className="text-sm truncate text-gray-600">
                            {user?.username}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OtherUser;