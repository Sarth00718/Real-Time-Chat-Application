import OtherUser from './OtherUser.jsx';

const OtherUsers = ({ users }) => {
  if (!users || users.length === 0) return null;

  return (
    <div className='p-1 space-y-1'>
      {users.map(user => (
        <OtherUser key={user._id} user={user} />
      ))}
    </div>
  );
};

export default OtherUsers;
