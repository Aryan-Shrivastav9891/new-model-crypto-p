import { FiArrowLeft, FiExternalLink, FiTrendingUp, FiTrendingDown, FiInfo } from 'react-icons/fi';
import { Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register required components for Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function CoinDetails({ coin, onBack, darkMode }) {
  // Prepare data for the chart
  const chartData = {
    labels: coin.sparkline_in_7d?.price.map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      return date.toLocaleDateString();
    }) || [],
    datasets: [
      {
        label: `${coin.name} Price (INR)`,
        data: coin.sparkline_in_7d?.price || [],
        borderColor: coin.price_change_percentage_24h >= 0 ? 'rgba(52, 211, 153, 1)' : 'rgba(239, 68, 68, 1)',
        backgroundColor: coin.price_change_percentage_24h >= 0 ? 'rgba(52, 211, 153, 0.2)' : 'rgba(239, 68, 68, 0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHitRadius: 30,
        pointHoverBackgroundColor: 'rgba(255, 255, 255, 1)',
        pointHoverBorderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function (context) {
            return `₹${context.raw.toLocaleString()}`;
          },
        },
        backgroundColor: darkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        titleColor: darkMode ? '#fff' : '#000',
        bodyColor: darkMode ? '#fff' : '#000',
        borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: darkMode ? '#9ca3af' : '#4b5563',
        },
      },
      y: {
        grid: { color: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' },
        ticks: {
          callback: function (value) {
            return '₹' + value.toLocaleString();
          },
          color: darkMode ? '#9ca3af' : '#4b5563',
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      className={`max-w-5xl mx-auto rounded-xl overflow-hidden ${
        darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
      } shadow-xl`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="p-6 flex flex-col sm:flex-row sm:items-center gap-4 border-b border-opacity-20"
        variants={itemVariants}
      >
        <motion.button 
          onClick={onBack}
          className={`p-2 rounded-full self-start ${
            darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Go back"
        >
          <FiArrowLeft size={24} />
        </motion.button>
        
        <div className="flex items-center">
          <motion.img 
            src={coin.image} 
            alt={coin.name} 
            className="w-14 h-14 rounded-full"
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ type: "spring", duration: 0.8 }}
          />
          <div className="ml-4">
            <div className="flex items-center">
              <h2 className="text-2xl md:text-3xl font-bold">
                {coin.name} 
                <span className="ml-2 uppercase text-base font-normal opacity-70">
                  {coin.symbol}
                </span>
              </h2>
            </div>
            <div className="flex mt-1 items-center">
              <span className={`text-xs px-2 py-1 rounded-full ${
                darkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                Rank #{coin.market_cap_rank || 'N/A'}
              </span>
              <div className={`ml-3 flex items-center ${
                coin.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {coin.price_change_percentage_24h >= 0 ? 
                  <FiTrendingUp className="mr-1" /> : 
                  <FiTrendingDown className="mr-1" />
                }
                <span className="font-medium">
                  {Math.abs(coin.price_change_percentage_24h?.toFixed(2) || 0)}%
                </span>
                <span className="text-xs opacity-70 ml-1">24h</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="ml-auto text-right">
          <div className="text-3xl font-bold">
            ₹{coin.current_price?.toLocaleString('en-IN') || 'N/A'}
          </div>
          <motion.a
            href={`https://www.coingecko.com/en/coins/${coin.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center text-xs mt-1 ${
              darkMode ? 'text-purple-400' : 'text-purple-600'
            }`}
            whileHover={{ scale: 1.05 }}
          >
            View on CoinGecko 
            <FiExternalLink size={12} className="ml-1" />
          </motion.a>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        <motion.div 
          variants={itemVariants}
          className={`rounded-lg p-5 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiInfo className="mr-2" /> Market Data
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Market Cap', value: coin.market_cap?.toLocaleString('en-IN'), prefix: '₹' },
              { label: 'Volume (24h)', value: coin.total_volume?.toLocaleString('en-IN'), prefix: '₹' },
              { label: 'Circulating Supply', value: coin.circulating_supply?.toLocaleString('en-IN') },
              { label: 'Max Supply', value: coin.max_supply?.toLocaleString('en-IN') || 'Unlimited' },
            ].map((item, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-sm opacity-70">{item.label}:</span>
                <span className="font-medium">
                  {item.prefix || ''}{item.value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className={`rounded-lg p-5 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
        >
          <h3 className="text-lg font-semibold mb-4">Price Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm opacity-70">24h High:</span>
              <span className="font-medium text-green-500">₹{coin.high_24h?.toLocaleString('en-IN') || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm opacity-70">24h Low:</span>
              <span className="font-medium text-red-500">₹{coin.low_24h?.toLocaleString('en-IN') || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm opacity-70">All-Time High:</span>
              <span className="font-medium">₹{coin.ath?.toLocaleString('en-IN') || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm opacity-70">All-Time Low:</span>
              <span className="font-medium">₹{coin.atl?.toLocaleString('en-IN') || 'N/A'}</span>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          variants={itemVariants}
          className={`rounded-lg p-5 md:col-span-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
        >
          <h3 className="text-lg font-semibold mb-4">7-Day Price Trend</h3>
          <div className="h-64">
            <Line data={chartData} options={chartOptions} />
          </div>
        </motion.div>
        
        <motion.div 
          variants={itemVariants}
          className={`rounded-lg p-5 md:col-span-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
        >
          <h3 className="text-lg font-semibold mb-3">
            {coin.future_profitability > 20 
              ? '💰 High Profit Potential' 
              : coin.price_change_percentage_24h >= 0 
                ? '📊 Market Analysis' 
                : '⚠️ Risk Assessment'}
          </h3>
          <p>{coin.description}</p>
          
          <div className="mt-4">
            <div className="w-full bg-gray-300 rounded-full h-1.5">
              <motion.div 
                className={`h-1.5 rounded-full ${
                  coin.future_profitability > 20 
                    ? 'bg-green-500' 
                    : coin.future_profitability > 5 
                      ? 'bg-yellow-500' 
                      : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(coin.future_profitability, 100)}%` }}
                initial={{ width: '0%' }}
                animate={{ width: `${Math.min(coin.future_profitability, 100)}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs opacity-70">
              <span>Low Potential</span>
              <span>High Potential</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
