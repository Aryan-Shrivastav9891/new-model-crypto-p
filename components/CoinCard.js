import { BiUpArrowAlt, BiDownArrowAlt } from 'react-icons/bi';
import { motion } from 'framer-motion';
import { FaStar } from 'react-icons/fa';
import { useState } from 'react';

export default function CoinCard({ coin, onClick, darkMode }) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Determine when to sell
  const sellAdvice =
    coin.price_change_percentage_24h < -10
      ? 'Consider selling as the price has dropped significantly in the last 24 hours.'
      : coin.price_change_percentage_24h > 20
      ? 'Consider selling to lock in profits as the price has risen significantly.'
      : 'No immediate sell signal. Monitor the market for changes.';
      
  // Determine class based on price change
  const getPriceChangeClass = () => {
    if (coin.price_change_percentage_24h > 0) {
      return darkMode 
        ? 'bg-green-900/30 text-green-400' 
        : 'bg-green-100 text-green-800';
    }
    return darkMode 
      ? 'bg-red-900/30 text-red-400'
      : 'bg-red-100 text-red-800';
  };

  return (
    <motion.div
      whileHover={{ 
        scale: 1.03,
        boxShadow: darkMode ? '0 8px 25px rgba(0, 0, 0, 0.4)' : '0 8px 25px rgba(0, 0, 0, 0.1)',
      }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      transition={{ type: 'spring', stiffness: 300 }}
      className={`cursor-pointer rounded-xl overflow-hidden shadow-lg ${
        darkMode 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white border border-gray-100'
      }`}
    >
      <div className={`p-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b border-opacity-50 flex items-center space-x-3`}>
        <div className="relative">
          <motion.img 
            src={coin.image} 
            alt={coin.name} 
            className="w-10 h-10 rounded-full"
            whileHover={{ rotate: 10 }}
            transition={{ duration: 0.2 }}
          />
          {coin.market_cap_rank <= 10 && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 bg-yellow-500 rounded-full w-4 h-4 flex items-center justify-center"
            >
              <FaStar className="text-xs text-white" />
            </motion.div>
          )}
        </div>
        <div>
          <h2 className="font-semibold">{coin.name}</h2>
          <p className="uppercase text-xs text-opacity-70">{coin.symbol}</p>
        </div>
        <div className="ml-auto">
          <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            Rank #{coin.market_cap_rank || 'N/A'}
          </span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            ₹{coin.current_price?.toLocaleString('en-IN') || 'N/A'}
          </span>
          <motion.span
            whileHover={{ scale: 1.1 }}
            className={`flex items-center px-3 py-1 rounded-lg text-xs font-medium ${getPriceChangeClass()}`}
          >
            {coin.price_change_percentage_24h > 0 ? (
              <BiUpArrowAlt className="mr-1" size={16} />
            ) : (
              <BiDownArrowAlt className="mr-1" size={16} />
            )}
            {Math.abs(coin.price_change_percentage_24h?.toFixed(2) || 0)}%
          </motion.span>
        </div>
        
        <div className="h-16 overflow-hidden">
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {coin.description.substring(0, 100)}
            {coin.description.length > 100 ? '...' : ''}
          </p>
        </div>
        
        <div className={`mt-4 p-3 rounded-lg text-sm ${
          coin.price_change_percentage_24h < -10 
            ? darkMode ? 'bg-red-900/20 text-red-300' : 'bg-red-50 text-red-700' 
            : coin.price_change_percentage_24h > 20 
              ? darkMode ? 'bg-yellow-900/20 text-yellow-300' : 'bg-yellow-50 text-yellow-700'
              : darkMode ? 'bg-blue-900/20 text-blue-300' : 'bg-blue-50 text-blue-700'
        }`}>
          <p className="font-medium">
            {coin.price_change_percentage_24h < -10 
              ? '⚠️ Sell Alert' 
              : coin.price_change_percentage_24h > 20 
                ? '💰 Profit Opportunity'
                : '📈 Market Insight'}
          </p>
          <p className="text-xs mt-1">{sellAdvice}</p>
        </div>
        
        <motion.div 
          className="mt-3 w-full h-1 bg-gray-200 rounded-full overflow-hidden"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isHovered ? 1 : 0.7 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            className={`h-full ${coin.price_change_percentage_24h > 0 ? 'bg-green-500' : 'bg-red-500'}`}
            style={{ width: `${Math.min(Math.abs(coin.price_change_percentage_24h || 1) * 2, 100)}%` }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
