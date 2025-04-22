import { BiUpArrowAlt, BiDownArrowAlt } from 'react-icons/bi';

export default function CoinCard({ coin, onClick }) {
  // Determine when to sell
  const sellAdvice =
    coin.price_change_percentage_24h < -10
      ? 'Consider selling as the price has dropped significantly in the last 24 hours.'
      : coin.price_change_percentage_24h > 20
      ? 'Consider selling to lock in profits as the price has risen significantly.'
      : 'No immediate sell signal. Monitor the market for changes.';

  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-xl overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-xl bg-white shadow-lg"
    >
      <div className="p-4 border-b border-opacity-20 flex items-center space-x-3">
        <img src={coin.image} alt={coin.name} className="w-10 h-10 rounded-full" />
        <div>
          <h2 className="font-semibold">{coin.name}</h2>
          <p className="uppercase text-xs text-gray-500">{coin.symbol}</p>
        </div>
        <div className="ml-auto">
          <span className="text-xs px-2 py-1 rounded-full bg-gray-200">Rank #{coin.market_cap_rank || 'N/A'}</span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-2xl font-bold">₹{coin.current_price?.toLocaleString('en-IN') || 'N/A'}</span>
          <span
            className={`flex items-center px-2 py-1 rounded-lg text-xs font-medium ${
              coin.price_change_percentage_24h > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {coin.price_change_percentage_24h > 0 ? <BiUpArrowAlt className="mr-1" size={16} /> : <BiDownArrowAlt className="mr-1" size={16} />}
            {coin.price_change_percentage_24h?.toFixed(2) || 'N/A'}%
          </span>
        </div>
        <p className="text-sm text-gray-600">{coin.description}</p>
        <p className="text-sm text-gray-800 mt-4 font-medium">Sell Advice:</p>
        <p className="text-sm text-gray-600">{sellAdvice}</p>
      </div>
    </div>
  );
}
