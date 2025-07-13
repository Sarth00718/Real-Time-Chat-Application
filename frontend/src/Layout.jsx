import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';

function Layout() {
  const location = useLocation();

  return (
    <div
      className="min-h-screen w-full bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700"
      style={{
        backgroundImage: `url('/bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundBlendMode: 'overlay',
      }}
    >
      <div className="w-full min-h-screen">
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;
