import { FiMoon, FiSun, FiSearch, FiBell, FiMenu } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function Header({ darkMode, setDarkMode, search, setSearch }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <header className={`py-4 px-4 sm:px-6 sticky top-0 z-20 backdrop-blur-md ${
      darkMode ? 'bg-gray-900/90 shadow-lg shadow-black/20' : 'bg-white/90 shadow-lg'
    } transition-all duration-300`}>
      <div className="container mx-auto flex justify-between items-center">
        <motion.h1 
          className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          CryptoTracker Pro
        </motion.h1>

        
        <div className="hidden md:flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1, rotate: darkMode ? -10 : 10 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-full ${
              darkMode 
                ? 'bg-gray-800 text-yellow-300 hover:bg-gray-700' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } transition-colors`}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
          </motion.button>
          
          <motion.div 
            className={`relative rounded-full ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
            initial={{ width: "200px" }}
            whileFocus={{ width: "280px" }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
            <input
              type="text"
              placeholder="Search coins..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`pl-10 pr-4 py-2 w-full sm:w-80 rounded-full focus:outline-none focus:ring-2 ${
                darkMode 
                  ? 'bg-gray-800 text-white focus:ring-purple-500' 
                  : 'bg-gray-100 text-gray-800 focus:ring-purple-400'
              } transition-all`}
            />
          </motion.div>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`p-2 rounded-full relative ${
              darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-700'
            }`}
            aria-label="Notifications"
          >
            <FiBell size={20} />
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
          </motion.button>
        </div>
        
        {/* Mobile Menu Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="md:hidden p-2 rounded-lg"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <FiMenu size={24} />
        </motion.button>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div 
          className="md:hidden mt-4 pb-2"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className={`p-3 rounded-lg mb-3 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <div className="flex items-center">
              <FiSearch className={`h-5 w-5 mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder="Search coins..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full p-2 rounded-md focus:outline-none ${
                  darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'
                }`}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`flex items-center px-4 py-2 rounded-lg ${
                darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
              }`}
            >
              {darkMode ? <FiSun size={18} className="mr-2" /> : <FiMoon size={18} className="mr-2" />}
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
            
            <button
              className={`flex items-center px-4 py-2 rounded-lg ${
                darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
              }`}
            >
              <FiBell size={18} className="mr-2" />
              Notifications
            </button>
          </div>
        </motion.div>
      )}
    </header>
  );
}
