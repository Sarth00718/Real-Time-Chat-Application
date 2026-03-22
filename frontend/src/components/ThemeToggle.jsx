import { motion } from 'framer-motion';
import { BsSun, BsMoon } from 'react-icons/bs';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-7 bg-gray-600 rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label="Toggle theme"
    >
      <motion.div
        className="w-5 h-5 bg-white rounded-full flex items-center justify-center"
        animate={{
          x: isDarkMode ? 0 : 28
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {isDarkMode ? (
          <BsMoon className="w-3 h-3 text-gray-800" />
        ) : (
          <BsSun className="w-3 h-3 text-yellow-500" />
        )}
      </motion.div>
    </button>
  );
};

export default ThemeToggle;
