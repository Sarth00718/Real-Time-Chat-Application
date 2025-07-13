import React from 'react';
import OtherUser from './OtherUser.jsx';
import { useSelector } from 'react-redux';
import useGetOtherUsers from '../hook/useGetOtherUsers.jsx';

const OtherUsers = () => {
    useGetOtherUsers(); // Keeps Redux data fresh

    const { otherUsers } = useSelector(store => store.user);
    if (!otherUsers) return;

    return (
        <div className='p-1 space-y-1'>
            {otherUsers.map(user => (
                <OtherUser key={user._id} user={user} />
            ))}
        </div>
    );
};

export default OtherUsers
