import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaBitcoin, FaEthereum, FaArrowUp, FaCopy, FaMoneyBillWave, 
  FaUniversity, FaQrcode, FaSpinner, FaCoins
} from 'react-icons/fa';
import { SiBinance, SiTether } from 'react-icons/si';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { walletService } from '../services/walletService';
import { adminWalletService } from '../services/adminWalletService';
import { useAuth } from '../auth/userAuth';

const Deposit = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [depositAddress, setDepositAddress] = useState('');
  const [adminWallets, setAdminWallets] = useState([]);
  const [fetchingWallets, setFetchingWallets] = useState(true);
  const [depositReference, setDepositReference] = useState('');

  useEffect(() => {
    fetchAdminWallets();
  }, []);

  const fetchAdminWallets = async () => {
    try {
      setFetchingWallets(true);
      const wallets = await adminWalletService.getWallets();
      setAdminWallets(wallets);
      if (wallets.length > 0) {
        setSelectedWallet(wallets[0]);
      }
    } catch (error) {
      console.error('Error fetching admin wallets:', error);
      toast.error('Failed to load payment methods');
    } finally {
      setFetchingWallets(false);
    }
  };

  const getWalletIcon = (wallet) => {
    const currency = wallet.currency?.toLowerCase();
    const type = wallet.type;
    if (type === 'pix') return FaQrcode;
    if (type === 'bank') return FaUniversity;
    if (currency === 'btc') return FaBitcoin;
    if (currency === 'eth') return FaEthereum;
    if (currency === 'usdt') return SiTether;
    if (currency === 'bnb') return SiBinance;
    if (currency === 'trx') return FaBitcoin; // Fallback for TRX
    return FaMoneyBillWave;
  };

  const getWalletColor = (wallet) => {
    const currency = wallet.currency?.toLowerCase();
    if (currency === 'btc') return 'text-orange-500';
    if (currency === 'eth') return 'text-purple-500';
    if (currency === 'usdt') return 'text-green-500';
    if (currency === 'bnb') return 'text-yellow-500';
    if (currency === 'trx') return 'text-red-500';
    if (wallet.type === 'pix') return 'text-emerald-500';
    if (wallet.type === 'bank') return 'text-blue-400';
    return 'text-slate-400';
  };

  const handleWalletSelect = (wallet) => {
    setSelectedWallet(wallet);
    setDepositAddress('');
    setDepositReference('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) < 10) {
      toast.error('Minimum deposit is $10');
      return;
    }
    if (!selectedWallet) {
      toast.error('Please select a payment method');
      return;
    }

    setLoading(true);
    try {
      const depositData = {
        amount: parseFloat(amount),
        cryptoCurrency: selectedWallet.currency,
        walletAddress: selectedWallet.address,
        walletId: selectedWallet._id,
        currency: selectedWallet.currency,
      };
      const data = await walletService.createDeposit(depositData);
      setDepositAddress(selectedWallet.address);
      setDepositReference(data.reference || '');
      toast.success('Deposit request created! Please send funds to the address below.');
    } catch (error) {
      console.error('Deposit creation error:', error);
      toast.error(error.response?.data?.message || 'Failed to create deposit');
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = () => {
    if (depositAddress) {
      navigator.clipboard.writeText(depositAddress);
      toast.success('Address copied!');
    }
  };

  if (fetchingWallets) {
    return (
      <div className="min-h-screen bg-slate-900 pt-16 lg:pl-64 pb-20 lg:pb-0">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <FaSpinner className="w-12 h-12 text-blue-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (adminWallets.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 pt-16 lg:pl-64 pb-20 lg:pb-0">
        <Navbar />
        <div className="p-4 sm:p-6 max-w-2xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 text-center border border-slate-700">
            <FaMoneyBillWave className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">No Payment Methods Available</h2>
            <p className="text-slate-400">Please contact support.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 pt-16 lg:pl-64 pb-20 lg:pb-0">
      <Navbar />
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Deposit Funds</h1>
          <p className="text-slate-400 mt-1">Add funds to your wallet</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Select Payment Method</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {adminWallets.map((wallet) => {
                  const Icon = getWalletIcon(wallet);
                  const color = getWalletColor(wallet);
                  const isSelected = selectedWallet?._id === wallet._id;
                  return (
                    <button
                      key={wallet._id}
                      type="button"
                      onClick={() => handleWalletSelect(wallet)}
                      className={`p-3 rounded-lg border transition ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      <Icon className={`w-6 h-6 mx-auto ${color}`} />
                      <span className="text-xs text-slate-400 mt-1 block truncate">
                        {wallet.name}
                      </span>
                      <span className="text-[10px] text-slate-500 block">{wallet.currency}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedWallet && (
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <p className="text-slate-300 text-sm font-medium mb-1">Selected: {selectedWallet.name}</p>
                {selectedWallet.type === 'pix' && (
                  <div className="space-y-1 text-sm">
                    <p><span className="text-slate-400">PIX Key:</span> <span className="text-white">{selectedWallet.address}</span></p>
                    {selectedWallet.details?.name && (
                      <p><span className="text-slate-400">Name:</span> <span className="text-white">{selectedWallet.details.name}</span></p>
                    )}
                    {selectedWallet.details?.bank && (
                      <p><span className="text-slate-400">Bank:</span> <span className="text-white">{selectedWallet.details.bank}</span></p>
                    )}
                  </div>
                )}
                {selectedWallet.type === 'bank' && (
                  <div className="space-y-1 text-sm">
                    <p><span className="text-slate-400">Bank:</span> <span className="text-white">{selectedWallet.details?.bankName || 'N/A'}</span></p>
                    <p><span className="text-slate-400">Account Name:</span> <span className="text-white">{selectedWallet.details?.accountName || 'N/A'}</span></p>
                    <p><span className="text-slate-400">Account Number:</span> <span className="text-white">{selectedWallet.address}</span></p>
                    {selectedWallet.details?.routingNumber && (
                      <p><span className="text-slate-400">Routing:</span> <span className="text-white">{selectedWallet.details.routingNumber}</span></p>
                    )}
                  </div>
                )}
                {selectedWallet.type === 'crypto' && (
                  <div className="space-y-1 text-sm">
                    <p><span className="text-slate-400">Network:</span> <span className="text-white">{selectedWallet.details?.network || 'N/A'}</span></p>
                    <p><span className="text-slate-400">Address:</span> <span className="text-white break-all">{selectedWallet.address}</span></p>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="100.00"
                  min="10"
                  step="0.01"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
              <p className="text-slate-400 text-xs mt-1">Minimum deposit: $10.00</p>
            </div>

            <button
              type="submit"
              disabled={loading || !selectedWallet}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <>
                  <FaArrowUp className="text-sm" /> Generate Deposit Instructions
                </>
              )}
            </button>
          </form>

          {depositAddress && depositReference && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 pt-6 border-t border-slate-700"
            >
              <p className="text-slate-300 text-sm font-medium mb-2">Deposit Instructions:</p>
              <div className="bg-slate-900 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-xs">Reference:</span>
                  <code className="text-xs text-white">{depositReference}</code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-xs">Amount:</span>
                  <span className="text-xs text-white">${amount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-xs">Payment Method:</span>
                  <span className="text-xs text-white">{selectedWallet?.name}</span>
                </div>
                {selectedWallet?.type === 'crypto' && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-xs">Address:</span>
                      <code className="text-xs text-white break-all">{depositAddress}</code>
                    </div>
                    <button onClick={copyAddress} className="w-full py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition flex items-center justify-center gap-2 text-white text-sm">
                      <FaCopy /> Copy Address
                    </button>
                  </>
                )}
                {selectedWallet?.type === 'pix' && (
                  <>
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-center">
                      <p className="text-emerald-400 text-sm font-medium">PIX Key</p>
                      <p className="text-white text-sm break-all">{depositAddress}</p>
                    </div>
                    <button onClick={copyAddress} className="w-full py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition flex items-center justify-center gap-2 text-white text-sm">
                      <FaCopy /> Copy PIX Key
                    </button>
                  </>
                )}
                {selectedWallet?.type === 'bank' && (
                  <div className="text-xs text-slate-400 space-y-1">
                    <p>Bank Transfer Details:</p>
                    <div className="bg-slate-800 rounded p-2">
                      <p><span className="text-slate-500">Bank:</span> {selectedWallet.details?.bankName}</p>
                      <p><span className="text-slate-500">Account Name:</span> {selectedWallet.details?.accountName}</p>
                      <p><span className="text-slate-500">Account Number:</span> {selectedWallet.address}</p>
                      {selectedWallet.details?.routingNumber && (
                        <p><span className="text-slate-500">Routing Number:</span> {selectedWallet.details.routingNumber}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <p className="text-yellow-500 text-xs mt-2">
                ⚠️ Send the exact amount as shown above. Deposits are subject to verification.
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Deposit;