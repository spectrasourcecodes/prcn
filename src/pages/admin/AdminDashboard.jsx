import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaMoneyBillWave, FaHandHoldingUsd, FaChartLine, FaArrowUp, FaArrowDown, FaSpinner, FaUserCog, FaHistory, FaPlusCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';
import API from '../../utils/axios';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalProfit: 0,
    pendingDeposits: 0,
    pendingWithdrawals: 0,
    revenue: 0,
    activeUsers: 0,
    growth: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    deposits: [],
    users: [],
    labels: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch dashboard stats
      const statsResponse = await API.get('/admin/stats');
      if (statsResponse.data.success) {
        const data = statsResponse.data.data;
        setStats({
          totalUsers: data.totalUsers || 0,
          totalDeposits: data.totalDeposits || 0,
          totalWithdrawals: data.totalWithdrawals || 0,
          totalProfit: data.totalProfit || 0,
          pendingDeposits: data.pendingDeposits || 0,
          pendingWithdrawals: data.pendingWithdrawals || 0,
          revenue: data.revenue || data.totalProfit || 0,
          activeUsers: data.activeUsers || data.totalUsers || 0,
          growth: data.growth || 0
        });
      }

      // Fetch recent users
      const usersResponse = await API.get('/admin/users', {
        params: { page: 1, limit: 5 }
      });
      if (usersResponse.data.success) {
        setRecentUsers(usersResponse.data.data);
      }

      // For charts, we can use real data or generate from stats
      // Using mock data for now – replace with real chart data from API when available
      const labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'];
      const depositsData = [125000, 158000, 142000, 189000, 210000, 245000];
      const usersData = [8500, 9200, 10100, 11200, 11800, 12545];

      setChartData({
        labels,
        deposits: depositsData,
        users: usersData
      });

    } catch (error) {
      console.error('Dashboard fetch error:', error);
      toast.error(error.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-slate-400 mt-1">Welcome back, Admin</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers} 
          icon={FaUsers} 
          bgGradient="from-blue-600/20 to-blue-800/20" 
        />
        <StatCard 
          title="Total Deposits" 
          value={stats.totalDeposits} 
          icon={FaMoneyBillWave} 
          bgGradient="from-green-600/20 to-green-800/20" 
        />
        <StatCard 
          title="Total Withdrawals" 
          value={stats.totalWithdrawals} 
          icon={FaHandHoldingUsd} 
          bgGradient="from-orange-600/20 to-orange-800/20" 
        />
        <StatCard 
          title="Platform Profit" 
          value={stats.revenue || stats.totalProfit} 
          icon={FaChartLine} 
          bgGradient="from-purple-600/20 to-purple-800/20" 
          change={stats.growth}
          isPositive={stats.growth > 0}
        />
      </div>

      {/* Pending Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-yellow-500 text-sm">Pending Deposits</p>
              <p className="text-2xl font-bold text-white">${stats.pendingDeposits.toLocaleString()}</p>
              <p className="text-xs text-slate-400 mt-1">Awaiting confirmation</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <FaMoneyBillWave className="text-yellow-500 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-orange-500 text-sm">Pending Withdrawals</p>
              <p className="text-2xl font-bold text-white">${stats.pendingWithdrawals.toLocaleString()}</p>
              <p className="text-xs text-slate-400 mt-1">Awaiting processing</p>
            </div>
            <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
              <FaHandHoldingUsd className="text-orange-500 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <button
          onClick={() => navigate('/admin/users')}
          className="bg-slate-800 hover:bg-slate-700 rounded-2xl p-6 border border-slate-700 transition flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
            <FaUserCog className="text-blue-400 text-xl" />
          </div>
          <div className="text-left">
            <h3 className="text-white font-semibold">User Management</h3>
            <p className="text-slate-400 text-sm">Manage all users</p>
          </div>
          <FaArrowUp className="text-slate-400 ml-auto rotate-45" />
        </button>

        <button
          onClick={() => navigate('/admin/withdrawals')}
          className="bg-slate-800 hover:bg-slate-700 rounded-2xl p-6 border border-slate-700 transition flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
            <FaHandHoldingUsd className="text-orange-400 text-xl" />
          </div>
          <div className="text-left">
            <h3 className="text-white font-semibold">Withdrawals</h3>
            <p className="text-slate-400 text-sm">Manage withdrawals</p>
          </div>
          <FaArrowUp className="text-slate-400 ml-auto rotate-45" />
        </button>

        <button
          onClick={() => navigate('/admin/plans')}
          className="bg-slate-800 hover:bg-slate-700 rounded-2xl p-6 border border-slate-700 transition flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
            <FaPlusCircle className="text-purple-400 text-xl" />
          </div>
          <div className="text-left">
            <h3 className="text-white font-semibold">Investment Plans</h3>
            <p className="text-slate-400 text-sm">Manage plans</p>
          </div>
          <FaArrowUp className="text-slate-400 ml-auto rotate-45" />
        </button>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartCard 
          title="Deposits Overview" 
          data={chartData.deposits} 
          labels={chartData.labels} 
          height={300} 
        />
        <ChartCard 
          title="User Growth" 
          data={chartData.users} 
          labels={chartData.labels} 
          height={300} 
        />
      </div>

      {/* Recent Users */}
      <div className="bg-slate-800 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-white">Recent Registrations</h2>
          <button 
            onClick={() => navigate('/admin/users')}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            View All
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-slate-400 font-medium">User</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Email</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Date</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">Deposit</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.length > 0 ? (
                recentUsers.map((user) => (
                  <tr key={user._id} className="border-b border-slate-700 hover:bg-slate-700/50 transition">
                    <td className="py-3 px-4 text-white">{user.fullName || user.name}</td>
                    <td className="py-3 px-4 text-slate-400">{user.email}</td>
                    <td className="py-3 px-4 text-slate-400">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-right text-green-500">
                      ${(user.totalDeposits || 0).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-400">
                    No recent registrations
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;