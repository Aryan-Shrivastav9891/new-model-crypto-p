import * as tf from '@tensorflow/tfjs';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Tabs from '../components/Tabs';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown, FiInfo, FiAlertCircle, FiCheckCircle, FiBarChart2 } from 'react-icons/fi';

ChartJS.register(LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend, Filler);

// Define Math.std and Math.mean at the top of the file to ensure they are available before usage
Math.std = function(array) {
  const mean = Math.mean(array);
  return Math.sqrt(array.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / array.length);
};

Math.mean = function(array) {
  return array.reduce((a, b) => a + b) / array.length;
};

export default function FuturePrediction({ coins }) {
  const [darkMode, setDarkMode] = useState(false);
  const [search, setSearch] = useState('');
  const [model, setModel] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [isTraining, setIsTraining] = useState(false);
  const [news, setNews] = useState({});
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [trainProgress, setTrainProgress] = useState(0);
  const [sentiment, setSentiment] = useState({});

  // Create a hybrid LSTM-GRU model for better prediction accuracy
  useEffect(() => {
    const createModel = () => {
      const inputShape = [7, 1]; // 7 days of data, 1 feature (price)
      
      const model = tf.sequential();
      model.add(tf.layers.lstm({ 
        units: 64, 
        returnSequences: true, 
        inputShape,
        activation: 'tanh',
        recurrentActivation: 'sigmoid'
      }));
      model.add(tf.layers.dropout(0.2));
      model.add(tf.layers.gru({ 
        units: 32, 
        activation: 'tanh',
        recurrentActivation: 'sigmoid'
      }));
      model.add(tf.layers.dense({ units: 1 }));
      
      model.compile({ 
        optimizer: tf.train.adam(0.001), 
        loss: 'meanSquaredError',
        metrics: ['accuracy']
      });
      
      return model;
    };
    
    setModel(createModel());
  }, []);

  // Train model with advanced techniques and predict future prices
  useEffect(() => {
    if (model && !isTraining) {
      const trainModel = async () => {
        setIsTraining(true);
        setTrainProgress(0);
        
        // Prepare data - normalize for better training
        const trainingData = coins.map((coin) => coin.sparkline_in_7d.price.slice(-7));
        const labels = coins.map((coin) => coin.current_price);
        
        // Find min and max for normalization
        const allPrices = trainingData.flat();
        const minPrice = Math.min(...allPrices);
        const maxPrice = Math.max(...allPrices);
        const range = maxPrice - minPrice;
        
        // Normalize data
        const normalizedData = trainingData.map(prices => 
          prices.map(price => (price - minPrice) / range)
        );
        const normalizedLabels = labels.map(price => (price - minPrice) / range);
        
        const xs = tf.tensor3d(normalizedData.map((data) => data.map((price) => [price])));
        const ys = tf.tensor2d(normalizedLabels.map((price) => [price]));
        
        // Train with callbacks to track progress
        await model.fit(xs, ys, {
          epochs: 100,
          batchSize: 8,
          shuffle: true,
          callbacks: {
            onEpochEnd: (epoch) => {
              setTrainProgress(Math.round((epoch + 1) / 100 * 100));
            }
          }
        });
        
        // Predict future prices
        const predictions = normalizedData.map((data) => {
          const reshapedData = data.map((price) => [price]); // Ensure data is reshaped to match tensor3d requirements
          const inputTensor = tf.tensor3d([reshapedData]);
          const prediction = model.predict(inputTensor).dataSync()[0];
          // Denormalize
          return prediction * range + minPrice;
        });
        
        setPredictions(predictions);
        setIsTraining(false);
      };
      
      trainModel();
    }
  }, [model, coins, isTraining]);

  // Fetch news and social media sentiment for each coin
  useEffect(() => {
    const fetchNewsAndSentiment = async () => {
      try {
        const newsData = {};
        const sentimentData = {};
        
        for (const coin of coins) {
          // Fetch news
          try {
            const res = await axios.get(
              `https://min-api.cryptocompare.com/data/v2/news/?categories=${coin.symbol}`
            );
            newsData[coin.id] = res.data.Data || [];
            
            // Calculate sentiment score (mock data - would use real sentiment analysis API)
            const sentiment = Math.random() * 2 - 1; // Value between -1 and 1
            sentimentData[coin.id] = sentiment;
          } catch (error) {
            console.error(`Error fetching data for ${coin.name}:`, error);
            newsData[coin.id] = [];
            sentimentData[coin.id] = 0;
          }
        }
        
        setNews(newsData);
        setSentiment(sentimentData);
      } catch (error) {
        console.error('Error fetching news and sentiment data:', error);
      }
    };
    
    fetchNewsAndSentiment();
  }, [coins]);

  // Calculate metrics for each coin
  const coinsWithPredictions = coins.map((coin, index) => {
    const currentPrice = coin.current_price || 0;
    const predictedPrice = predictions[index] || 0;
    const percentChange = currentPrice > 0 
      ? ((predictedPrice - currentPrice) / currentPrice) * 100
      : 0;
    
    // Generate confidence score based on model metrics and sentiment
    const priceTrend = coin.sparkline_in_7d?.price || [];
    const priceVolatility = priceTrend.length > 1 
      ? Math.std(priceTrend.slice(-5)) / Math.mean(priceTrend.slice(-5)) * 100 
      : 50;
    
    // Combine sentiment and technical indicators
    const sentimentScore = sentiment[coin.id] || 0;
    const technicalScore = percentChange > 0 ? 0.6 : -0.6;
    const combinedScore = (sentimentScore * 0.4) + (technicalScore * 0.6);
    
    const confidenceScore = Math.min(Math.max(Math.abs(combinedScore * 100), 0), 100);
    
    return {
      ...coin,
      predicted_price: predictedPrice,
      percent_change: percentChange,
      confidence: confidenceScore,
      recommendation: getRecommendation(percentChange, confidenceScore),
      sentiment: sentimentScore
    };
  });

  // Filter coins based on search and sort by prediction
  const filteredCoins = coinsWithPredictions
    .filter((coin) => 
      coin.name.toLowerCase().includes(search.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => b.percent_change - a.percent_change);

  // Get investment recommendation
  function getRecommendation(percentChange, confidence) {
    if (percentChange > 15 && confidence > 70) return 'Strong Buy';
    if (percentChange > 5 && confidence > 60) return 'Buy';
    if (percentChange > 0) return 'Hold';
    if (percentChange > -10) return 'Watch';
    return 'Sell';
  }

  // Get color based on recommendation
  function getRecommendationColor(recommendation) {
    switch(recommendation) {
      case 'Strong Buy': return 'text-green-600';
      case 'Buy': return 'text-green-500';
      case 'Hold': return 'text-blue-500';
      case 'Watch': return 'text-yellow-500';
      case 'Sell': return 'text-red-500';
      default: return 'text-gray-500';
    }
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'} transition-colors duration-300`}>
      <Header darkMode={darkMode} setDarkMode={setDarkMode} search={search} setSearch={setSearch} />
      
      <Tabs selectedTab="future" setSelectedTab={() => {}} darkMode={darkMode} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-center md:text-left"
          >
            AI-Powered Future Prediction
          </motion.h1>
          
          {isTraining && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 md:mt-0 flex items-center"
            >
              <div className="w-48 bg-gray-300 rounded-full h-2.5 mr-2">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${trainProgress}%` }}
                ></div>
              </div>
              <span className="text-sm">Training: {trainProgress}%</span>
            </motion.div>
          )}
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredCoins.map((coin) => (
            <motion.div
              key={coin.id}
              whileHover={{ scale: 1.02 }}
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden`}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <img src={coin.image} alt={coin.name} className="w-10 h-10 rounded-full mr-3" />
                    <div>
                      <h2 className="text-xl font-bold">{coin.name}</h2>
                      <p className="text-sm opacity-70">{coin.symbol.toUpperCase()}</p>
                    </div>
                  </div>
                  <div className={`${coin.percent_change >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} px-2 py-1 rounded-full text-xs font-medium`}>
                    {coin.percent_change >= 0 ? <FiTrendingUp className="inline mr-1" /> : <FiTrendingDown className="inline mr-1" />}
                    {Math.abs(coin.percent_change).toFixed(2)}%
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-3 rounded-lg`}>
                    <p className="text-xs opacity-70">Current Price</p>
                    <p className="font-bold">₹{coin.current_price.toLocaleString()}</p>
                  </div>
                  <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-3 rounded-lg`}>
                    <p className="text-xs opacity-70">Predicted Price</p>
                    <p className="font-bold">₹{parseFloat(coin.predicted_price).toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs">Confidence</span>
                    <span className="text-xs font-medium">{coin.confidence.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full ${
                        coin.confidence > 70 ? 'bg-green-500' : 
                        coin.confidence > 50 ? 'bg-blue-500' : 
                        coin.confidence > 30 ? 'bg-yellow-500' : 'bg-red-500'
                      }`} 
                      style={{ width: `${coin.confidence}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <FiBarChart2 className="mr-2" />
                    <p className="text-sm">Market Cap Rank: <span className="font-medium">#{coin.market_cap_rank}</span></p>
                  </div>
                  <p className={`text-sm font-bold ${getRecommendationColor(coin.recommendation)}`}>
                    {coin.recommendation}
                  </p>
                </div>
                
                <button
                  onClick={() => setSelectedCoin(coin)}
                  className={`w-full py-2 px-4 rounded-lg ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white font-medium transition-colors`}
                >
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        {selectedCoin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`fixed inset-0 z-50 overflow-y-auto ${darkMode ? 'bg-opacity-75 bg-gray-900' : 'bg-opacity-75 bg-gray-800'}`}
          >
            <div className="flex items-center justify-center min-h-screen px-4">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} max-w-4xl w-full rounded-2xl shadow-2xl overflow-hidden`}
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                      <img src={selectedCoin.image} alt={selectedCoin.name} className="w-12 h-12 rounded-full mr-4" />
                      <div>
                        <h2 className="text-2xl font-bold">{selectedCoin.name} ({selectedCoin.symbol.toUpperCase()})</h2>
                        <p className={`${selectedCoin.percent_change >= 0 ? 'text-green-500' : 'text-red-500'} font-medium`}>
                          {selectedCoin.percent_change >= 0 ? '+' : ''}{selectedCoin.percent_change.toFixed(2)}% Predicted Change
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedCoin(null)}
                      className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} p-2 rounded-full`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-4`}>
                      <h3 className="text-lg font-semibold mb-4">Price Forecast</h3>
                      <Line
                        data={{
                          labels: ['7 Days Ago', '6 Days Ago', '5 Days Ago', '4 Days Ago', '3 Days Ago', '2 Days Ago', 'Yesterday', 'Today', 'Prediction'],
                          datasets: [
                            {
                              label: 'Price (₹)',
                              data: [...selectedCoin.sparkline_in_7d.price, selectedCoin.predicted_price],
                              borderColor: selectedCoin.percent_change >= 0 ? 'rgba(52, 211, 153, 1)' : 'rgba(239, 68, 68, 1)',
                              backgroundColor: selectedCoin.percent_change >= 0 ? 'rgba(52, 211, 153, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                              fill: true,
                              tension: 0.4,
                              pointRadius: (ctx) => ctx.dataIndex === 8 ? 5 : 2,
                              pointBackgroundColor: (ctx) => ctx.dataIndex === 8 ? (selectedCoin.percent_change >= 0 ? 'rgba(52, 211, 153, 1)' : 'rgba(239, 68, 68, 1)') : 'transparent',
                              pointBorderColor: (ctx) => ctx.dataIndex === 8 ? (selectedCoin.percent_change >= 0 ? 'rgba(52, 211, 153, 1)' : 'rgba(239, 68, 68, 1)') : 'transparent',
                            }
                          ]
                        }}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: {
                              display: false,
                            },
                            tooltip: {
                              callbacks: {
                                label: (context) => `₹${context.raw.toLocaleString(undefined, {maximumFractionDigits: 2})}`
                              }
                            }
                          },
                          scales: {
                            y: {
                              ticks: {
                                callback: (value) => `₹${value.toLocaleString()}`
                              }
                            }
                          }
                        }}
                      />
                    </div>
                    
                    <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-4`}>
                      <h3 className="text-lg font-semibold mb-4">Investment Analysis</h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className={`${selectedCoin.recommendation === 'Strong Buy' || selectedCoin.recommendation === 'Buy' ? 'bg-green-100 text-green-700' : selectedCoin.recommendation === 'Sell' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'} p-2 rounded-full mr-3`}>
                            {selectedCoin.recommendation === 'Strong Buy' || selectedCoin.recommendation === 'Buy' ? (
                              <FiCheckCircle size={24} />
                            ) : selectedCoin.recommendation === 'Sell' ? (
                              <FiAlertCircle size={24} />
                            ) : (
                              <FiInfo size={24} />
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold">Recommendation</h4>
                            <p className={`${getRecommendationColor(selectedCoin.recommendation)} font-bold`}>{selectedCoin.recommendation}</p>
                            <p className="text-sm opacity-70 mt-1">Based on AI prediction model and market analysis</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>       
                            <p className="text-sm opacity-70">Current Price</p>
                            <p className="font-bold">₹{selectedCoin.current_price.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm opacity-70">Predicted Price</p>
                            <p className="font-bold">₹{parseFloat(selectedCoin.predicted_price).toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                          </div>
                          <div>
                            <p className="text-sm opacity-70">Market Cap</p>
                            <p className="font-bold">₹{(selectedCoin.market_cap || 0).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm opacity-70">24h Volume</p>
                            <p className="font-bold">₹{(selectedCoin.total_volume || 0).toLocaleString()}</p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm opacity-70 mb-1">Confidence Level</p>
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                              <div
                                className={`h-2.5 rounded-full ${
                                  selectedCoin.confidence > 70 ? 'bg-green-500' : 
                                  selectedCoin.confidence > 50 ? 'bg-blue-500' : 
                                  selectedCoin.confidence > 30 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${selectedCoin.confidence}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{selectedCoin.confidence.toFixed(0)}%</span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium mt-2">AI Analysis Summary:</p>
                          <p className="text-sm mt-1">
                            {selectedCoin.percent_change > 15 ? (
                              `${selectedCoin.name} shows strong growth potential with projected gains of ${selectedCoin.percent_change.toFixed(2)}%. The model suggests a high probability of continued uptrend.`
                            ) : selectedCoin.percent_change > 0 ? (
                              `${selectedCoin.name} is showing moderate growth potential with a projected ${selectedCoin.percent_change.toFixed(2)}% increase.`
                            ) : (
                              `${selectedCoin.name} may face downward pressure in the short term. Consider watching for a better entry point.`
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-4 mb-6`}>
                    <h3 className="text-lg font-semibold mb-4">Latest News</h3>
                    {news[selectedCoin.id] && news[selectedCoin.id].length > 0 ? (
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {news[selectedCoin.id].slice(0, 5).map((article, idx) => (
                          <a key={idx} href={article.url} target="_blank" rel="noopener noreferrer" 
                             className={`block p-3 rounded-lg ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}>
                            <div className="flex items-start">
                              {article.imageurl && (
                                <img src={article.imageurl} alt="News" className="w-16 h-12 object-cover rounded mr-3" />
                              )}
                              <div>
                                <h4 className="font-medium">{article.title}</h4>
                                <p className="text-xs opacity-70 mt-1">{new Date(article.published_on * 1000).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm">No recent news available for {selectedCoin.name}.</p>
                    )}
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={() => setSelectedCoin(null)}
                      className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} px-5 py-2 rounded-lg mr-3`}
                    >
                      Close
                    </button>
                    <a
                      href={`https://www.coingecko.com/en/coins/${selectedCoin.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg"
                    >
                      View on CoinGecko
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </main>
      
      <Footer darkMode={darkMode} />
    </div>
  );
}

export async function getServerSideProps() {
  try {
    const res = await axios.get(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=inr&order=market_cap_desc&per_page=20&page=1&sparkline=true'
    );
    
    return { props: { coins: res.data } };
  } catch (error) {
    console.error('Error fetching data:', error);
    return { props: { coins: [] } };
  }
}