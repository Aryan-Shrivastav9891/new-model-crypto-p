import { motion } from 'framer-motion';
import { FiArrowUp, FiArrowDown, FiActivity } from 'react-icons/fi';

export default function MarketOverview({ coins, darkMode }) {
  // Calculate market stats
  const totalMarketCap = coins.reduce((sum, coin) => sum + (coin.market_cap || 0), 0);
  const totalVolume = coins.reduce((sum, coin) => sum + (coin.total_volume || 0), 0);
  const averageChange = coins.reduce((sum, coin) => sum + (coin.price_change_percentage_24h || 0), 0) / coins.length;
  
  const isPositiveMarket = averageChange > 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`container mx-auto px-4 py-3 mt-2 rounded-xl ${
        darkMode ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-800'
      } shadow-sm`}
    >
      <div className="flex flex-wrap justify-between items-center">
        <div className="flex items-center px-4 py-2">
          <FiActivity className="mr-2 text-purple-500" />
          <div>
            <p className="text-sm opacity-70">Market Status</p>
            <p className={`font-semibold ${isPositiveMarket ? 'text-green-500' : 'text-red-500'}`}>
              {isPositiveMarket ? 'Bullish' : 'Bearish'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center px-4 py-2">
          <div className="text-right">
            <p className="text-sm opacity-70">24h Change</p>
            <p className={`font-semibold flex items-center ${isPositiveMarket ? 'text-green-500' : 'text-red-500'}`}>
              {isPositiveMarket ? <FiArrowUp className="mr-1" /> : <FiArrowDown className="mr-1" />}
              {Math.abs(averageChange).toFixed(2)}%
            </p>
          </div>
        </div>
        
        <div className="hidden md:block px-4 py-2">
          <p className="text-sm opacity-70">Total Market Cap</p>
          <p className="font-semibold">₹{(totalMarketCap/1000000000).toFixed(2)}B</p>
        </div>
        
        <div className="hidden md:block px-4 py-2">
          <p className="text-sm opacity-70">24h Volume</p>
          <p className="font-semibold">₹{(totalVolume/1000000000).toFixed(2)}B</p>
        </div>
        
        <div className="hidden lg:flex items-center space-x-2 px-4 py-2">
          <p className="text-sm opacity-70">Top Movers:</p>
          {coins
            .sort((a, b) => Math.abs(b.price_change_percentage_24h) - Math.abs(a.price_change_percentage_24h))
            .slice(0, 3)
            .map((coin) => (
              <div 
                key={coin.id} 
                className={`flex items-center text-xs p-1 px-2 rounded-full ${
                  coin.price_change_percentage_24h > 0 
                    ? darkMode ? 'bg-green-900/30 text-green-500' : 'bg-green-100 text-green-700'
                    : darkMode ? 'bg-red-900/30 text-red-500' : 'bg-red-100 text-red-700'
                }`}
              >
                <img src={coin.image} alt={coin.name} className="w-3 h-3 rounded-full mr-1" />
                <span>{coin.symbol.toUpperCase()}</span>
                <span className="ml-1">
                  {coin.price_change_percentage_24h > 0 ? '+' : ''}
                  {coin.price_change_percentage_24h.toFixed(1)}%
                </span>
              </div>
            ))}
        </div>
      </div>
    </motion.div>
  );
}
