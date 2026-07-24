import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Star, TrendingUp, TrendingDown } from 'lucide-react';
import Navbar from '../components/Navbar';
import { FaBitcoin, FaEthereum } from 'react-icons/fa';
import { SiBinance, SiSolana, SiCardano, SiDogecoin, SiRipple, SiTether } from 'react-icons/si';
import MarketTicker from '../components/MarketTicker';

// Mock market data – no API calls
const MOCK_COINS = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', price: 43250, change: 2.5, marketCap: 845000000000, volume: 28000000000, icon: FaBitcoin },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', price: 2250, change: -1.2, marketCap: 270000000000, volume: 15000000000, icon: FaEthereum },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB', price: 310, change: 0.8, marketCap: 48000000000, volume: 8000000000, icon: SiBinance },
  { id: 'solana', symbol: 'SOL', name: 'Solana', price: 98, change: 5.6, marketCap: 42000000000, volume: 3000000000, icon: SiSolana },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano', price: 0.62, change: -0.5, marketCap: 22000000000, volume: 1000000000, icon: SiCardano },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', price: 0.08, change: 3.2, marketCap: 11000000000, volume: 800000000, icon: SiDogecoin },
  { id: 'ripple', symbol: 'XRP', name: 'XRP', price: 0.52, change: -0.3, marketCap: 28000000000, volume: 1500000000, icon: SiRipple },
  { id: 'tron', symbol: 'TRX', name: 'Tron', price: 0.12, change: 1.5, marketCap: 10500000000, volume: 500000000, icon: SiTether },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', price: 14.50, change: -2.1, marketCap: 8500000000, volume: 600000000, icon: SiTether },
  { id: 'toncoin', symbol: 'TON', name: 'Toncoin', price: 2.15, change: 4.8, marketCap: 7500000000, volume: 300000000, icon: SiTether },
];

const Market = () => {
  const [coins, setCoins] = useState(MOCK_COINS);
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  // No API call – just use mock data
  useEffect(() => {
    setCoins(MOCK_COINS);
  }, []);

  const toggleFavorite = (coinId) => {
    setFavorites(prev =>
      prev.includes(coinId)
        ? prev.filter(id => id !== coinId)
        : [...prev, coinId]
    );
  };

  const formatMarketCap = (value) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toFixed(2)}`;
  };

  const filteredCoins = coins.filter(coin =>
    coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-900 pt-16 lg:pl-64 pb-20 lg:pb-0">
      <Navbar />
      
      <main className="p-4 sm:p-6">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Market</h1>
              <p className="text-slate-400 mt-1">Live cryptocurrency prices (mock data)</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search coins..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Market Ticker */}
        <div className="mb-6">
          <MarketTicker />
        </div>

        {/* Coin List */}
        <div className="bg-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr className="text-left text-xs text-slate-400 uppercase tracking-wider">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-right">24h Change</th>
                  <th className="px-4 py-3 text-right hidden md:table-cell">Market Cap</th>
                  <th className="px-4 py-3 text-right hidden lg:table-cell">Volume</th>
                  <th className="px-4 py-3 text-right">Favorite</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredCoins.map((coin, index) => (
                  <motion.tr
                    key={coin.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="hover:bg-slate-700/30 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 text-slate-400 text-sm">{index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                          <coin.icon className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{coin.name}</p>
                          <p className="text-xs text-slate-400">{coin.symbol}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-white font-medium">
                      ${coin.price.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className={`inline-flex items-center gap-1 text-sm font-medium ${coin.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {coin.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        <span>{coin.change >= 0 ? '+' : ''}{coin.change}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right hidden md:table-cell text-slate-400">
                      {formatMarketCap(coin.marketCap)}
                    </td>
                    <td className="px-4 py-3 text-right hidden lg:table-cell text-slate-400">
                      {formatMarketCap(coin.volume)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => toggleFavorite(coin.id)}
                        className="p-1 rounded-lg hover:bg-slate-600 transition-colors"
                      >
                        <Star className={`w-4 h-4 ${favorites.includes(coin.id) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-400'}`} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredCoins.length === 0 && (
            <div className="p-8 text-center text-slate-400">No coins found</div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Market;