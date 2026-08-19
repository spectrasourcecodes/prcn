import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSpinner, FaCopy, FaCheck, FaTimes, FaArrowRight } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import PlanCard from '../components/PlanCard';
import { investmentService } from '../services/investmentService';
import { adminWalletService } from '../services/adminWalletService';
import { useAuth } from '../auth/userAuth';
import API from '../utils/axios'; // Import API for transaction creation

const InvestmentPlans = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [investing, setInvesting] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchPlans();
    fetchWallets();
  }, []);

  const fetchPlans = async () => {
    try {
      const data = await investmentService.getPlans();
      setPlans(data);
    } catch (error) {
      toast.error('Failed to load investment plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchWallets = async () => {
    try {
      const data = await adminWalletService.getWallets();
      setWallets(data);
      if (data.length > 0) setSelectedWallet(data[0]);
    } catch (error) {
      console.error('Failed to load wallets:', error);
    }
  };

  const handleInvestClick = (plan) => {
    if (!user) {
      toast.error('Please login first');
      navigate('/login');
      return;
    }
    setSelectedPlan(plan);
    setAmount(plan.minimumInvestment.toString());
    setShowWalletModal(true);
  };

  const handleAmountChange = (e) => {
    const val = parseFloat(e.target.value);
    if (selectedPlan) {
      if (val < selectedPlan.minimumInvestment) {
        toast.error(`Minimum investment is $${selectedPlan.minimumInvestment}`);
      } else if (val > selectedPlan.maximumInvestment) {
        toast.error(`Maximum investment is $${selectedPlan.maximumInvestment}`);
      }
    }
    setAmount(e.target.value);
  };

  const handleConfirmPayment = async () => {
    if (!selectedWallet) {
      toast.error('Please select a payment method');
      return;
    }
    const investAmount = parseFloat(amount);
    if (!investAmount || investAmount < selectedPlan.minimumInvestment) {
      toast.error(`Minimum investment is $${selectedPlan.minimumInvestment}`);
      return;
    }
    if (investAmount > selectedPlan.maximumInvestment) {
      toast.error(`Maximum investment is $${selectedPlan.maximumInvestment}`);
      return;
    }

    setCreating(true);
    try {
      // 1. Create investment
      const response = await investmentService.createInvestment({
        planId: selectedPlan._id,
        amount: investAmount,
        walletId: selectedWallet._id,
        walletAddress: selectedWallet.address,
      });

      // 2. Create transaction record
      await API.post('/transactions', {
        type: 'investment',
        amount: investAmount,
        currency: 'USD',
        description: `Investment in ${selectedPlan.name} plan`,
        metadata: {
          planId: selectedPlan._id,
          planName: selectedPlan.name,
          dailyROI: selectedPlan.dailyROI,
          duration: selectedPlan.duration,
          expectedProfit: selectedPlan.expectedProfit,
          walletId: selectedWallet._id,
          walletAddress: selectedWallet.address,
          walletCurrency: selectedWallet.currency,
        },
        investmentId: response.investment._id,
        status: 'pending',
      });

      toast.success('Investment created! Please upload payment proof.');
      setShowWalletModal(false);
      navigate('/payment-proof', {
        state: {
          investmentId: response.investment._id,
          amount: investAmount,
          planName: selectedPlan.name,
        },
      });
    } catch (error) {
      console.error('Investment creation error:', error);
      toast.error(error.response?.data?.message || 'Failed to create investment');
    } finally {
      setCreating(false);
    }
  };

  const getWalletIcon = (wallet) => {
    const currency = wallet.currency?.toLowerCase();
    if (currency === 'btc') return '₿';
    if (currency === 'eth') return '⟠';
    if (currency === 'usdt') return '₮';
    if (currency === 'bnb') return '◆';
    if (currency === 'trx') return '₮';
    if (wallet.type === 'pix') return '💳';
    if (wallet.type === 'bank') return '🏦';
    return '💰';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 pt-16 lg:pl-64 pb-20 lg:pb-0 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 pt-16 lg:pl-64 pb-20 lg:pb-0">
      <Navbar />
      <div className="p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Investment Plans</h1>
          <p className="text-slate-400 mt-1">Choose a plan that fits your goals</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <PlanCard
              key={plan._id}
              plan={{
                id: plan._id,
                name: plan.name,
                minAmount: plan.minimumInvestment,
                maxAmount: plan.maximumInvestment,
                roi: plan.dailyROI,
                duration: plan.duration,
                bonus: plan.expectedProfit,
                bgClass: 'from-slate-800 to-slate-900',
                borderClass: 'border-slate-700',
                colorClass: 'text-blue-400',
              }}
              onSelect={() => handleInvestClick(plan)}
              disabled={investing}
            />
          ))}
        </div>

        {plans.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            No investment plans available at the moment.
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showWalletModal && selectedPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-800/95 backdrop-blur-xl rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-700 shadow-2xl"
            >
              {/* Header */}
              <div className="sticky top-0 bg-slate-800/95 backdrop-blur-sm border-b border-slate-700 px-6 py-4 flex justify-between items-center rounded-t-2xl">
                <h2 className="text-xl font-bold text-white">Invest in {selectedPlan.name}</h2>
                <button
                  onClick={() => setShowWalletModal(false)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition"
                >
                  <FaTimes className="text-slate-400" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Plan Summary */}
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Plan</span>
                    <span className="text-white font-medium">{selectedPlan.name}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-slate-400">Daily ROI</span>
                    <span className="text-green-400">{selectedPlan.dailyROI}%</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-slate-400">Duration</span>
                    <span className="text-white">{selectedPlan.duration} days</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-slate-400">Expected Profit</span>
                    <span className="text-blue-400">{selectedPlan.expectedProfit}%</span>
                  </div>
                </div>

                {/* Amount Input */}
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Investment Amount (USD)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">$</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={handleAmountChange}
                      min={selectedPlan.minimumInvestment}
                      max={selectedPlan.maximumInvestment}
                      step="1"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>Min: ${selectedPlan.minimumInvestment}</span>
                    <span>Max: ${selectedPlan.maximumInvestment}</span>
                  </div>
                </div>

                {/* Select Wallet */}
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Select Payment Method</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {wallets.map((wallet) => {
                      const isSelected = selectedWallet?._id === wallet._id;
                      const icon = getWalletIcon(wallet);
                      const color = getWalletColor(wallet);
                      return (
                        <button
                          key={wallet._id}
                          type="button"
                          onClick={() => setSelectedWallet(wallet)}
                          className={`p-3 rounded-lg border transition ${
                            isSelected
                              ? 'border-blue-500 bg-blue-500/10'
                              : 'border-slate-700 hover:border-slate-500'
                          }`}
                        >
                          <div className={`text-2xl ${color}`}>{icon}</div>
                          <span className="text-xs text-slate-400 mt-1 block truncate">{wallet.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Wallet Details (if selected) */}
                {selectedWallet && (
                  <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                    <p className="text-slate-300 text-sm font-medium">Payment Details</p>
                    <div className="mt-2 space-y-1 text-sm">
                      <p><span className="text-slate-400">Currency:</span> <span className="text-white">{selectedWallet.currency}</span></p>
                      {selectedWallet.type === 'crypto' && (
                        <p><span className="text-slate-400">Network:</span> <span className="text-white">{selectedWallet.details?.network || 'N/A'}</span></p>
                      )}
                      <div>
                        <span className="text-slate-400">Address:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-xs text-white break-all flex-1 bg-slate-800 p-2 rounded">{selectedWallet.address}</code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(selectedWallet.address);
                              toast.success('Address copied!');
                            }}
                            className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition"
                          >
                            <FaCopy className="text-white text-sm" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowWalletModal(false)}
                    className="flex-1 py-3 rounded-lg bg-slate-700 text-white font-semibold hover:bg-slate-600 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmPayment}
                    disabled={creating}
                    className="flex-1 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {creating ? (
                      <>
                        <FaSpinner className="animate-spin" /> Processing...
                      </>
                    ) : (
                      <>
                        I Have Made Payment <FaArrowRight />
                      </>
                    )}
                  </button>
                </div>

                <p className="text-yellow-500 text-xs text-center">
                  ⚠️ After payment, you will be redirected to upload your transaction proof.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InvestmentPlans;