import Tabs from '../components/Tabs';
import axios from 'axios';
import { useState, useEffect } from 'react';

export default function Profitable() {
  const [profitableCoins, setProfitableCoins] = useState([]);

  useEffect(() => {
    const fetchProfitableCoins = async () => {
      const res = await axios.get(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=inr&order=market_cap_desc&per_page=100&page=1'
      );
      const coins = res.data.filter((coin) => coin.price_change_percentage_24h > 10);
      setProfitableCoins(coins);
    };

    fetchProfitableCoins();
  }, []);

  return (
    <div>
      <Tabs selectedTab="profitable" setSelectedTab={() => {}} darkMode={false} />
      <h1>Profitable Coins</h1>
      <ul>
        {profitableCoins.map((coin) => (
          <li key={coin.id}>
            {coin.name} ({coin.symbol.toUpperCase()}) - 24h Change: {coin.price_change_percentage_24h}%
          </li>
        ))}
      </ul>
    </div>
  );
}