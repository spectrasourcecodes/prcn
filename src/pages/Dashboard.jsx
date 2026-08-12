import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaWallet, FaChartLine, FaMoneyBillWave, FaExchangeAlt, 
  FaArrowUp, FaArrowDown, FaEye, FaEyeSlash, FaCopy 
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import TransactionCard from '../components/TransactionCard';
import { useAuth } from '../auth/userAuth';
import API from '../utils/axios';
import { getCurrencySymbol } from '../utils/currency';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [activeInvestments, setActiveInvestments] = useState([]);
  const [showBalance, setShowBalance] = useState(true);
  const [loading, setLoading] = useState(true);

  // ✅ Get currency symbol
  const currencySymbol = getCurrencySymbol(user?.currency);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await API.get('/users/dashboard');
      if (response.data.success) {
        const data = response.data.data;
        const mappedWallet = {
          totalBalance: data.wallet?.balance || 0,
          totalProfit: data.wallet?.profitBalance || 0,
          totalDeposits: data.wallet?.totalDeposits || 0,
          totalWithdrawals: data.wallet?.totalWithdrawals || 0,
          walletAddress: data.wallet?.walletAddress || '0x...',
          userId: { name: user?.fullName || 'User' },
        };
        setWallet(mappedWallet);
        setActiveInvestments(data.investments || []);
        setRecentTransactions(data.transactions || []);
      } else {
        toast.error('Failed to load dashboard');
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      toast.error(error.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fallbackWallet = {
    totalBalance: 0,
    totalProfit: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    walletAddress: '0x...',
    userId: { name: user?.fullName || 'User' },
  };

  const walletData = wallet || fallbackWallet;

  const chartLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  const chartData = [12450, 15800, 14200, 18900];

  const copyAddress = () => {
    navigator.clipboard.writeText(walletData.walletAddress || '');
    toast.success('Wallet address copied!');
  };

  // ✅ Format currency with symbol
  const formatCurrency = (value) => {
    return `${currencySymbol}${value?.toLocaleString() || '0.00'}`;
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
      
      <main className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard</h1>
              <p className="text-slate-400 mt-1">Welcome back, {walletData.userId?.name || 'User'}!</p>
            </div>
            <button 
              onClick={() => setShowBalance(!showBalance)}
              className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition"
              aria-label={showBalance ? 'Hide balance' : 'Show balance'}
            >
              {showBalance ? (
                <FaEye className="text-slate-400 w-5 h-5" />
              ) : (
                <FaEyeSlash className="text-slate-400 w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard 
            title="Total Balance" 
            value={walletData.totalBalance || 0} 
            icon={FaWallet}
            bgGradient="from-blue-600/20 to-blue-800/20"
            hideValue={!showBalance}
            currencySymbol={currencySymbol}
          />
          <StatCard 
            title="Total Profit" 
            value={walletData.totalProfit || 0} 
            icon={FaChartLine}
            change={walletData.totalProfit > 0 ? 12.5 : 0}
            isPositive={walletData.totalProfit > 0}
            bgGradient="from-green-600/20 to-green-800/20"
            hideValue={!showBalance}
            currencySymbol={currencySymbol}
          />
          <StatCard 
            title="Total Deposits" 
            value={walletData.totalDeposits || 0} 
            icon={FaMoneyBillWave}
            bgGradient="from-purple-600/20 to-purple-800/20"
            hideValue={!showBalance}
            currencySymbol={currencySymbol}
          />
          <StatCard 
            title="Total Withdrawals" 
            value={walletData.totalWithdrawals || 0} 
            icon={FaExchangeAlt}
            bgGradient="from-orange-600/20 to-orange-800/20"
            hideValue={!showBalance}
            currencySymbol={currencySymbol}
          />
        </div>

        {/* Chart & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <ChartCard 
              title="Portfolio Growth" 
              data={chartData} 
              labels={chartLabels}
            />
          </div>
          
          <div className="bg-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button 
                onClick={() => navigate('/deposit')}
                className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 hover:scale-105"
              >
                <FaArrowUp className="mx-auto mb-2 text-white text-xl" />
                <span className="text-white font-semibold">Deposit</span>
              </button>
              <button 
                onClick={() => navigate('/withdraw')}
                className="p-4 bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all duration-200 hover:scale-105"
              >
                <FaArrowDown className="mx-auto mb-2 text-white text-xl" />
                <span className="text-white font-semibold">Withdraw</span>
              </button>
            </div>
            <div className="bg-slate-700/50 rounded-xl p-4">
              <p className="text-slate-400 text-sm mb-2">Your Wallet Address</p>
              <div className="flex items-center justify-between gap-2">
                <code className="text-xs text-white truncate font-mono">
                  {walletData.walletAddress || 'No address'}
                </code>
                <button 
                  onClick={copyAddress} 
                  className="p-2 bg-slate-600 rounded-lg hover:bg-slate-500 transition flex-shrink-0"
                  title="Copy address"
                >
                  <FaCopy className="text-white text-sm" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Active Investments */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Active Investments</h2>
          {activeInvestments.length === 0 ? (
            <div className="bg-slate-800/50 rounded-xl p-8 text-center border border-slate-700">
              <p className="text-slate-400">No active investments. Start investing today!</p>
              <button 
                onClick={() => navigate('/plans')}
                className="mt-3 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition"
              >
                View Plans
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeInvestments.map((investment, index) => (
                <motion.div
                  key={investment._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700 hover:border-accent/50 transition-all duration-300 hover:shadow-xl"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-white">
                        {investment.plan?.name || investment.planName || 'Investment'}
                      </h3>
                      <p className="text-xs text-slate-400">
                        Started: {investment.startDate ? new Date(investment.startDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded-lg text-xs font-medium">
                      Active
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Amount:</span>
                    <span className="text-white font-semibold">
                      {formatCurrency(investment.amount || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-slate-400">ROI:</span>
                    <span className="text-green-500 font-medium">
                      {investment.roi || investment.dailyROI || 0}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-slate-400">Total ROI:</span>
                    <span className="text-accent font-medium">
                      {formatCurrency(investment.totalROI || 0)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
            <button 
              onClick={() => navigate('/transactions')}
              className="text-blue-400 hover:text-blue-300 text-sm transition-colors flex items-center gap-1"
            >
              View All →
            </button>
          </div>
          {recentTransactions.length === 0 ? (
            <div className="bg-slate-800/50 rounded-xl p-8 text-center border border-slate-700">
              <p className="text-slate-400">No transactions yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentTransactions.map((transaction, index) => (
                <TransactionCard 
                  key={transaction._id || index} 
                  transaction={transaction} 
                  currencySymbol={currencySymbol}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;