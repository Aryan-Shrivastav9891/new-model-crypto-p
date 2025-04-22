"use client"
import axios from 'axios';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as tf from '@tensorflow/tfjs';
import Header from '../components/Header';
import Tabs from '../components/Tabs';
import CoinCard from '../components/CoinCard';
import CoinDetails from '../components/CoinDetails';
import MarketOverview from '../components/MarketOverview';
import Footer from '../components/Footer';

export async function getServerSideProps() {
  const res = await axios.get(
    'https://api.coingecko.com/api/v3/coins/markets?vs_currency=inr&order=market_cap_desc&per_page=1000&page=1&sparkline=true'
  );

  const coins = res.data.map((coin) => ({
    id: coin.id,
    name: coin.name,
    symbol: coin.symbol,
    image: coin.image,
    current_price: coin.current_price,
    market_cap: coin.market_cap,
    total_volume: coin.total_volume,
    price_change_percentage_24h: coin.price_change_percentage_24h,
    market_cap_rank: coin.market_cap_rank,
    sparkline_in_7d: coin.sparkline_in_7d,
  }));

  

  return { props: { coins } };
}

export default function Home({ coins }) {
  const [search, setSearch] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [model, setModel] = useState(null);
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    const createHybridModel = () => {
      const inputShape = [30, 1]; // 30 days of data, 1 feature (price)
      const model = tf.sequential();
      model.add(tf.layers.lstm({ units: 64, returnSequences: true, inputShape }));
      model.add(tf.layers.gru({ units: 64 }));
      model.add(tf.layers.dense({ units: 1 }));
      model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });
      return model;
    };

    setModel(createHybridModel());

    // Ensure WebGL backend is used for better performance
    tf.setBackend('webgl');
  }, []);

  useEffect(() => {
    if (model) {
      const trainAndPredict = async () => {
        const trainingData = coins.map((coin) => coin.sparkline_in_7d.price.slice(-30));
        const labels = coins.map((coin) => coin.current_price);

        const xs = tf.tensor3d(trainingData.map((data) => data.map((price) => [price])));
        const ys = tf.tensor2d(labels.map((price) => [price]));

        if (model.isTraining) return;
        model.isTraining = true;

        // Reduce epochs to 5 and add batch size of 32
        await model.fit(xs, ys, { epochs: 5, batchSize: 32 });
        model.isTraining = false;

        const predictions = xs.arraySync().map((data) => {
          const inputTensor = tf.tensor3d([data]);
          const prediction = model.predict(inputTensor).arraySync()[0][0];
          return prediction;
        });

        setPredictions(predictions);
      };

      trainAndPredict();
    }
  }, [model]);

  // Add predictions and descriptions for each coin
  const coinsWithPredictions = coins.map((coin, index) => {
    // Calculate future profitability based on 7-day sparkline data
    const sparkline = coin.sparkline_in_7d?.price || [];
    const futureProfitability =
      sparkline.length > 1
        ? ((sparkline[sparkline.length - 1] - sparkline[0]) / sparkline[0]) * 100
        : Math.random() * 0.3; // Fallback for missing data

    // Add a description for why to buy the coin
    const description =
      futureProfitability > 20
        ? `This coin has shown strong growth potential with a projected profitability of ${futureProfitability.toFixed(
            2
          )}%. It is a great option for short-term gains.`
        : `This coin has steady performance and is a safer option for gradual profits.`;

    return {
      ...coin,
      predicted_profitability: coin.predicted_profitability || Math.random() * 0.2, // Placeholder for predicted profitability
      future_profitability: futureProfitability,
      description,
      predicted_price: predictions[index] ? predictions[index].toFixed(2) : 'Loading...',
    };
  });

  const filteredCoins = coinsWithPredictions.filter((coin) => {
    const matchesSearch =
      coin.name.toLowerCase().includes(search.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(search.toLowerCase());

    if (selectedTab === 'profitable') {
      // Show coins with 10% to 20% price change in the last 24 hours
      return (
        matchesSearch &&
        coin.price_change_percentage_24h >= 10 &&
        coin.price_change_percentage_24h <= 20
      );
    } else if (selectedTab === 'predicted') {
      // Show coins with predicted profitability > 15%
      return matchesSearch && coin.predicted_profitability > 0.15;
    } else if (selectedTab === 'future') {
      // Show coins with future profitability > 20%
      return matchesSearch && coin.future_profitability > 20;
    }

    // Default: Show all coins
    return matchesSearch;
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  useEffect(() => {
    console.log('Coins with Predictions:', coinsWithPredictions);
  }, [coinsWithPredictions]);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'} transition-colors duration-300`}>
      <Header darkMode={darkMode} setDarkMode={setDarkMode} search={search} setSearch={setSearch} />
      
      <MarketOverview coins={coinsWithPredictions.slice(0, 5)} darkMode={darkMode} />
      
      <Tabs selectedTab={selectedTab} setSelectedTab={setSelectedTab} darkMode={darkMode} />
      
      <main className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {!selectedCoin ? (
            <motion.div 
              key="coins-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredCoins.length > 0 ? (
                filteredCoins.map((coin) => (
                  <CoinCard key={coin.id} coin={coin} onClick={() => setSelectedCoin(coin)} darkMode={darkMode} />
                ))
              ) : (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full text-center py-10 text-xl"
                >
                  No coins match your criteria. Try adjusting your search.
                </motion.p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="coin-details"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CoinDetails coin={selectedCoin} onBack={() => setSelectedCoin(null)} darkMode={darkMode} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      <Footer darkMode={darkMode} />
    </div>
  );
}
