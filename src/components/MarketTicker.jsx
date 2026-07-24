import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Mock data – static prices (no API calls)
const MOCK_MARKET_DATA = [
  { pair: 'BTC/USD', price: '43,250.00', change: 2.5, spread: '0.02%' },
  { pair: 'ETH/USD', price: '2,250.00', change: -1.2, spread: '0.05%' },
  { pair: 'BNB/USD', price: '310.00', change: 0.8, spread: '0.03%' },
  { pair: 'SOL/USD', price: '98.00', change: 5.6, spread: '0.04%' },
  { pair: 'ADA/USD', price: '0.62', change: -0.5, spread: '0.06%' },
  { pair: 'DOGE/USD', price: '0.08', change: 3.2, spread: '0.08%' },
  { pair: 'XRP/USD', price: '0.52', change: -0.3, spread: '0.07%' },
  { pair: 'TON/USD', price: '2.15', change: 4.8, spread: '0.05%' },
  { pair: 'TRX/USD', price: '0.12', change: 1.5, spread: '0.04%' },
  { pair: 'LINK/USD', price: '14.50', change: -2.1, spread: '0.06%' },
];

const MarketTicker = () => {
  const [items, setItems] = useState(MOCK_MARKET_DATA);
  const [loading, setLoading] = useState(false);

  // No API call – just use mock data
  useEffect(() => {
    setItems(MOCK_MARKET_DATA);
  }, []);

  return (
    <div className="bg-slate-800 rounded-xl p-4 overflow-hidden">
      <div className="flex items-center gap-4 overflow-x-auto pb-2">
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex-shrink-0 min-w-[140px] bg-slate-700/50 rounded-lg p-3"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-white">{item.pair}</span>
              <span className={`text-sm ${item.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {item.change >= 0 ? '+' : ''}{item.change}%
              </span>
            </div>
            <div className="text-lg font-bold text-white">{item.price}</div>
            <div className="text-xs text-slate-400 mt-1">Spread: {item.spread}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MarketTicker;