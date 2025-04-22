import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

export default function CoinDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [coin, setCoin] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('7d');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      setLoading(true);
      axios
        .get(`https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=true&market_data=true&community_data=true&developer_data=true&sparkline=true`)
        .then((response) => {
          setCoin(response.data);
          const prices = response.data.market_data.sparkline_7d.price;
          setChartData({
            labels: Array.from({ length: prices.length }, (_, i) => {
              const date = new Date();
              date.setDate(date.getDate() - (prices.length - i - 1));
              return date.toLocaleDateString();
            }),
            datasets: [
              {
                label: 'Price (₹)',
                data: prices,
                borderColor: response.data.market_data.price_change_percentage_24h >= 0 ? 'rgba(16, 185, 129, 1)' : 'rgba(239, 68, 68, 1)',
                backgroundColor: response.data.market_data.price_change_percentage_24h >= 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.4,
                fill: true,
              },
            ],
          });
          setLoading(false);
        })
        .catch((error) => {
          console.error(error);
          setError("Failed to load data. Please try again later.");
          setLoading(false);
        });
    }
  }, [id, timeframe]);

  const formatNumber = (num) => {
    if (num === null || num === undefined) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2,
      notation: num > 1000000 ? 'compact' : 'standard',
      compactDisplay: 'short'
    }).format(num);
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        ticks: {
          callback: function(value) {
            return '₹' + value.toLocaleString();
          }
        }
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
  };

  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-2">Error</h2>
        <p className="text-gray-700">{error}</p>
        <button 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => router.back()}
        >
          Go Back
        </button>
      </div>
    </div>
  );

  if (loading || !coin) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header Section with Price */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <img src={coin.image.large} alt={coin.name} className="w-16 h-16 mr-4" />
            <div>
              <h1 className="text-3xl font-bold">{coin.name} <span className="text-gray-500 text-2xl">({coin.symbol.toUpperCase()})</span></h1>
              <div className="flex items-center">
                <span className="bg-gray-200 text-gray-700 text-sm py-1 px-2 rounded mr-2">Rank #{coin.market_cap_rank}</span>
                {coin.links?.blockchain_site?.filter(Boolean)[0] && (
                  <a href={coin.links.blockchain_site.filter(Boolean)[0]} target="_blank" rel="noopener noreferrer" 
                    className="text-blue-500 text-sm hover:underline">
                    Explorer
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">₹{formatNumber(coin.market_data.current_price.inr)}</div>
            <div className={`text-lg font-medium ${coin.market_data.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {coin.market_data.price_change_percentage_24h >= 0 ? '↑' : '↓'} {Math.abs(coin.market_data.price_change_percentage_24h).toFixed(2)}%
              <span className="text-gray-500 text-sm ml-1">24h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Price Chart */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Price Chart</h2>
          <div className="flex space-x-2">
            <button 
              onClick={() => setTimeframe('1d')} 
              className={`px-3 py-1 rounded ${timeframe === '1d' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              1D
            </button>
            <button 
              onClick={() => setTimeframe('7d')} 
              className={`px-3 py-1 rounded ${timeframe === '7d' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              7D
            </button>
            <button 
              onClick={() => setTimeframe('30d')} 
              className={`px-3 py-1 rounded ${timeframe === '30d' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              30D
            </button>
          </div>
        </div>
        {chartData ? (
          <div className="h-[400px]">
            <Line data={chartData} options={chartOptions} />
          </div>
        ) : (
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500 border-solid"></div>
          </div>
        )}
      </div>
      
      {/* Market Data Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Market Cap</h3>
          <p className="text-2xl font-bold">₹{formatNumber(coin.market_data.market_cap.inr)}</p>
          <p className="text-sm text-gray-500 mt-1">${formatNumber(coin.market_data.market_cap.usd)}</p>
          <div className={`mt-2 text-sm ${coin.market_data.market_cap_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {coin.market_data.market_cap_change_percentage_24h >= 0 ? '↑' : '↓'} 
            {Math.abs(coin.market_data.market_cap_change_percentage_24h).toFixed(2)}% (24h)
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Trading Volume (24h)</h3>
          <p className="text-2xl font-bold">₹{formatNumber(coin.market_data.total_volume.inr)}</p>
          <p className="text-sm text-gray-500 mt-1">${formatNumber(coin.market_data.total_volume.usd)}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Supply Information</h3>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Circulating Supply:</span>
            <span className="font-medium">{formatNumber(coin.market_data.circulating_supply)} {coin.symbol.toUpperCase()}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Total Supply:</span>
            <span className="font-medium">{formatNumber(coin.market_data.total_supply)} {coin.symbol.toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Max Supply:</span>
            <span className="font-medium">{formatNumber(coin.market_data.max_supply)} {coin.symbol.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Price Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Price Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-500 mb-1">Price (INR)</h4>
              <p className="text-xl font-bold">₹{formatNumber(coin.market_data.current_price.inr)}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-500 mb-1">Price (USD)</h4>
              <p className="text-xl font-bold">${formatNumber(coin.market_data.current_price.usd)}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-500 mb-1">Price (EUR)</h4>
              <p className="text-xl font-bold">€{formatNumber(coin.market_data.current_price.eur)}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-500 mb-1">Price (BTC)</h4>
              <p className="text-xl font-bold">₿{coin.market_data.current_price.btc}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-500 mb-1">24h Change</h4>
              <p className={`text-xl font-bold ${coin.market_data.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {coin.market_data.price_change_percentage_24h >= 0 ? '+' : ''}{coin.market_data.price_change_percentage_24h.toFixed(2)}%
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-500 mb-1">7d Change</h4>
              <p className={`text-xl font-bold ${coin.market_data.price_change_percentage_7d >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {coin.market_data.price_change_percentage_7d >= 0 ? '+' : ''}{coin.market_data.price_change_percentage_7d.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">All-Time Stats</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium text-gray-500 mb-1">All-Time High (INR)</h4>
                <p className="text-xl font-bold">₹{formatNumber(coin.market_data.ath.inr)}</p>
                <p className="text-xs text-gray-500">{new Date(coin.market_data.ath_date.inr).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="text-red-500">
                  {coin.market_data.ath_change_percentage.inr.toFixed(2)}%
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium text-gray-500 mb-1">All-Time Low (INR)</h4>
                <p className="text-xl font-bold">₹{formatNumber(coin.market_data.atl.inr)}</p>
                <p className="text-xs text-gray-500">{new Date(coin.market_data.atl_date.inr).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="text-green-500">
                  +{formatNumber(coin.market_data.atl_change_percentage.inr)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Community Stats and Dev Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Community Stats</h3>
          {coin.community_data && (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Twitter Followers:</span>
                <span className="font-medium">{formatNumber(coin.community_data.twitter_followers)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reddit Subscribers:</span>
                <span className="font-medium">{formatNumber(coin.community_data.reddit_subscribers)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Telegram Users:</span>
                <span className="font-medium">{formatNumber(coin.community_data.telegram_channel_user_count)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reddit Active Accounts:</span>
                <span className="font-medium">{formatNumber(coin.community_data.reddit_active_accounts)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Facebook Likes:</span>
                <span className="font-medium">{formatNumber(coin.community_data.facebook_likes)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Developer Activity</h3>
          {coin.developer_data && (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">GitHub Stars:</span>
                <span className="font-medium">{formatNumber(coin.developer_data.stars)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">GitHub Forks:</span>
                <span className="font-medium">{formatNumber(coin.developer_data.forks)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">GitHub Subscribers:</span>
                <span className="font-medium">{formatNumber(coin.developer_data.subscribers)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">GitHub Issues:</span>
                <span className="font-medium">{formatNumber(coin.developer_data.total_issues)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Commits (4 weeks):</span>
                <span className="font-medium">{formatNumber(coin.developer_data.commit_count_4_weeks)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Links and Resources */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Links and Resources</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {coin.links?.homepage?.filter(Boolean)[0] && (
            <a href={coin.links.homepage.filter(Boolean)[0]} target="_blank" rel="noopener noreferrer" 
               className="flex items-center text-blue-500 hover:underline">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
              </svg>
              Website
            </a>
          )}
          {coin.links?.subreddit_url && (
            <a href={coin.links.subreddit_url} target="_blank" rel="noopener noreferrer" 
               className="flex items-center text-blue-500 hover:underline">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9H5a1 1 0 000 2h2v1a3 3 0 003 3h2a3 3 0 003-3v-1h2a1 1 0 100-2h-2V6a3 3 0 00-3-3h-2a3 3 0 00-3 3v3z" clipRule="evenodd" />
              </svg>
              Reddit
            </a>
          )}
          {coin.links?.twitter_screen_name && (
            <a href={`https://twitter.com/${coin.links.twitter_screen_name}`} target="_blank" rel="noopener noreferrer" 
               className="flex items-center text-blue-500 hover:underline">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.025 10.025 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63a9.936 9.936 0 002.46-2.548l-.047-.02z" />
              </svg>
              Twitter
            </a>
          )}
          {coin.links?.repos_url?.github?.length > 0 && (
            <a href={coin.links.repos_url.github[0]} target="_blank" rel="noopener noreferrer" 
               className="flex items-center text-blue-500 hover:underline">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
              GitHub
            </a>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">About {coin.name}</h3>
        {coin.description?.en ? (
          <div 
            className="text-gray-800 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: coin.description.en }}
          />
        ) : (
          <p className="text-gray-500 italic">No description available.</p>
        )}
      </div>

      <div className="mt-8 text-center">
        <button 
          onClick={() => router.back()} 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Back to List
        </button>
      </div>
    </div>
  );
}
