import { motion } from 'framer-motion';
import { FiGrid, FiTrendingUp, FiStar, FiBarChart2, FiClock, FiActivity } from 'react-icons/fi';

export default function Tabs({ selectedTab, setSelectedTab, darkMode }) {
  const tabs = [
    { id: 'all', label: 'All', icon: <FiGrid /> },
    { id: 'altcoins', label: 'Altcoins', icon: <FiStar /> },
    { id: 'memecoins', label: 'Memecoins', icon: <FiActivity /> },
    { id: 'profitable', label: 'Profitable', icon: <FiBarChart2 /> },
    { id: 'predicted', label: 'AI Predicted', icon: <FiTrendingUp /> },
    { id: 'future', label: 'Future Gains', icon: <FiClock /> },
  ];

  return (
    <div className="container mx-auto px-4 py-4">
      <motion.div 
        className={`flex flex-wrap justify-center gap-2 md:gap-3 p-1 rounded-xl ${
          darkMode ? 'bg-gray-800/50' : 'bg-gray-100/80'
        }`}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium flex items-center text-sm md:text-base transition-colors ${
              selectedTab === tab.id
                ? darkMode
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-600 text-white'
                : darkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-white text-gray-700 hover:bg-gray-200'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
