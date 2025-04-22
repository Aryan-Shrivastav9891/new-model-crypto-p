import { FiArrowLeft } from 'react-icons/fi';
import { Line } from 'react-chartjs-2';
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
import styles from './CoinDetails.module.css'; // Import the CSS Module

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

export default function CoinDetails({ coin, onBack }) {
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
        borderColor: 'rgba(52, 211, 153, 1)',
        backgroundColor: 'rgba(52, 211, 153, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function (context) {
            return `Price: ₹${context.raw.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
      },
      y: {
        grid: { color: 'rgba(0, 0, 0, 0.1)' },
        ticks: {
          callback: function (value) {
            return '₹' + value.toLocaleString();
          },
        },
      },
    },
  };

  return (
    <div className={styles.coinDetailsContainer}>
      <div className={styles.coinDetailsHeader}>
        <button onClick={onBack} className={styles.backButton}>
          <FiArrowLeft size={20} />
        </button>
        <img src={coin.image} alt={coin.name} className={styles.coinImage} />
        <div className={styles.coinInfo}>
          <h2 className={styles.coinTitle}>{coin.name} ({coin.symbol.toUpperCase()})</h2>
          <p className={styles.coinRank}>Rank #{coin.market_cap_rank || 'N/A'}</p>
        </div>
      </div>
      <div className={styles.coinDetailsGrid}>
        <div className={styles.marketData}>
          <h3 className={styles.sectionTitle}>Market Data</h3>
          <p><span className={styles.label}>Current Price:</span> ₹{coin.current_price?.toLocaleString('en-IN') || 'N/A'}</p>
          <p><span className={styles.label}>Market Cap:</span> ₹{coin.market_cap?.toLocaleString('en-IN') || 'N/A'}</p>
          <p><span className={styles.label}>Total Volume:</span> ₹{coin.total_volume?.toLocaleString('en-IN') || 'N/A'}</p>
          <p><span className={styles.label}>24h High:</span> ₹{coin.high_24h?.toLocaleString('en-IN') || 'N/A'}</p>
          <p><span className={styles.label}>24h Low:</span> ₹{coin.low_24h?.toLocaleString('en-IN') || 'N/A'}</p>
        </div>
        <div className={styles.additionalData}>
          <h3 className={styles.sectionTitle}>Additional Data</h3>
          <p><span className={styles.label}>Circulating Supply:</span> {coin.circulating_supply?.toLocaleString('en-IN') || 'N/A'}</p>
          <p><span className={styles.label}>Total Supply:</span> {coin.total_supply?.toLocaleString('en-IN') || 'N/A'}</p>
          <p><span className={styles.label}>Max Supply:</span> {coin.max_supply?.toLocaleString('en-IN') || 'N/A'}</p>
          <p><span className={styles.label}>All-Time High:</span> ₹{coin.ath?.toLocaleString('en-IN') || 'N/A'}</p>
          <p><span className={styles.label}>ATH Change:</span> {coin.ath_change_percentage?.toFixed(2) || 'N/A'}%</p>
          <p><span className={styles.label}>All-Time Low:</span> ₹{coin.atl?.toLocaleString('en-IN') || 'N/A'}</p>
          <p><span className={styles.label}>ATL Change:</span> {coin.atl_change_percentage?.toFixed(2) || 'N/A'}%</p>
        </div>
        <div className={styles.chartContainer}>
          <h3 className={styles.sectionTitle}>7-Day Price Trend</h3>
          <div className={styles.chartWrapper}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
        <div className={styles.whyBuy}>
          <h3 className={styles.sectionTitle}>Why Buy?</h3>
          <p>{coin.description}</p>
        </div>
      </div>
    </div>
  );
}
