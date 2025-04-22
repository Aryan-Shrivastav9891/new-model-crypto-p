import { motion } from 'framer-motion';
import { FiGrid, FiTrendingUp, FiStar, FiBarChart2, FiClock, FiActivity } from 'react-icons/fi';
import Link from 'next/link';

export default function Tabs({ selectedTab, setSelectedTab, darkMode }) {
  const tabs = [
    { id: 'all', label: 'All', icon: <FiGrid />, path: '/' },
    { id: 'altcoins', label: 'Altcoins', icon: <FiStar />, path: '/altcoins' },
    { id: 'memecoins', label: 'Memecoins', icon: <FiActivity />, path: '/memecoins' },
    { id: 'profitable', label: 'Profitable', icon: <FiBarChart2 />, path: '/profitable' },
    { id: 'predicted', label: 'AI Predicted', icon: <FiTrendingUp />, path: '/predicted' },
    { id: 'future', label: 'Future Gains', icon: <FiClock />, path: '/future' },
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
          <Link key={tab.id} href={tab.path} passHref>
            <motion.button
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
          </Link>
        ))}
      </motion.div>
    </div>
  );
}
