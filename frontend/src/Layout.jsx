import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import OfflineAlert from './components/OfflineAlert';

function Layout() {
  const location = useLocation();

  return (
    <div
      className="min-h-screen w-full bg-blue-900/40"
      style={{
        backgroundImage: `url('/bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundBlendMode: 'overlay',
      }}
    >
      <OfflineAlert />
      <div className="w-full min-h-screen">
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;
