import { motion, AnimatePresence } from 'framer-motion';
import { BiWifi, BiWifiOff } from 'react-icons/bi';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useState, useEffect } from 'react';

const OfflineAlert = () => {
  const isOnline = useOnlineStatus();
  const [showOnline, setShowOnline] = useState(false);

  useEffect(() => {
    if (isOnline) {
      setShowOnline(true);
      const timer = setTimeout(() => {
        setShowOnline(false);
      }, 3000); // Hide after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          className="fixed top-4 right-4 z-50 max-w-xs rounded-2xl border border-white/10 bg-rose-600/95 text-white shadow-2xl backdrop-blur-sm px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <BiWifiOff className="w-5 h-5 animate-pulse" />
            <div>
              <p className="text-sm font-semibold">You are offline</p>
              <p className="text-xs text-white/80">Check your internet connection.</p>
            </div>
          </div>
        </motion.div>
      )}

      {showOnline && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          className="fixed top-4 right-4 z-50 max-w-xs rounded-2xl border border-white/10 bg-emerald-600/95 text-white shadow-2xl backdrop-blur-sm px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <BiWifi className="w-5 h-5" />
            <div>
              <p className="text-sm font-semibold">Back online</p>
              <p className="text-xs text-white/80">Your connection has been restored.</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineAlert;
