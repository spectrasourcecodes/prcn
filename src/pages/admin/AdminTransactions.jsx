import { useState, useEffect } from 'react';
import { FaSearch, FaDownload, FaEye, FaPrint, FaSpinner, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import API from '../../utils/axios';

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const itemsPerPage = 20;

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, filterType, filterStatus]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await API.get('/admin/transactions', {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          type: filterType !== 'all' ? filterType : undefined,
          status: filterStatus !== 'all' ? filterStatus : undefined,
          search: searchTerm || undefined,
        }
      });
      if (response.data.success) {
        setTransactions(response.data.data);
        setPagination(response.data.pagination);
      } else {
        toast.error('Failed to load transactions');
      }
    } catch (error) {
      console.error('Fetch transactions error:', error);
      toast.error(error.response?.data?.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTransactions();
  };

  const handleViewDetails = async (transactionId) => {
    try {
      const response = await API.get(`/admin/transactions/${transactionId}`);
      if (response.data.success) {
        setSelectedTransaction(response.data.data);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('View transaction error:', error);
      toast.error('Failed to load transaction details');
    }
  };

  const getTypeBadge = (type) => {
    const badges = {
      deposit: 'bg-green-500/10 text-green-500',
      withdrawal: 'bg-red-500/10 text-red-500',
      investment: 'bg-blue-500/10 text-blue-500',
      profit: 'bg-purple-500/10 text-purple-500',
      referral: 'bg-yellow-500/10 text-yellow-500',
      bonus: 'bg-pink-500/10 text-pink-500',
    };
    return badges[type] || 'bg-slate-500/10 text-slate-400';
  };

  const getStatusBadge = (status) => {
    const badges = {
      completed: 'bg-green-500/10 text-green-500',
      pending: 'bg-yellow-500/10 text-yellow-500',
      approved: 'bg-blue-500/10 text-blue-500',
      rejected: 'bg-red-500/10 text-red-500',
      failed: 'bg-red-500/10 text-red-500',
      cancelled: 'bg-slate-500/10 text-slate-400',
    };
    return badges[status] || 'bg-slate-500/10 text-slate-400';
  };

  const exportToCSV = () => {
    if (transactions.length === 0) {
      toast.error('No transactions to export');
      return;
    }

    const headers = ['ID', 'User', 'Type', 'Amount', 'Currency', 'Status', 'Date', 'Reference'];
    const csvData = transactions.map(tx => [
      tx._id?.slice(-8) || 'N/A',
      tx.user?.fullName || tx.user?.name || 'N/A',
      tx.type || 'N/A',
      tx.amount || 0,
      tx.currency || 'USD',
      tx.status || 'N/A',
      tx.createdAt ? new Date(tx.createdAt).toLocaleString() : 'N/A',
      tx.reference || 'N/A'
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Transactions exported successfully');
  };

  // Calculate stats from transactions
  const getStats = () => {
    const stats = {
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalProfit: 0,
      totalInvestments: 0
    };
    
    transactions.forEach(tx => {
      if (tx.type === 'deposit') stats.totalDeposits += tx.amount || 0;
      if (tx.type === 'withdrawal') stats.totalWithdrawals += tx.amount || 0;
      if (tx.type === 'profit') stats.totalProfit += tx.amount || 0;
      if (tx.type === 'investment') stats.totalInvestments += tx.amount || 0;
    });
    
    return stats;
  };

  const stats = getStats();

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Transaction Management</h1>
        <p className="text-slate-400 mt-1">View and manage all platform transactions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6">
          <p className="text-green-500 text-sm">Total Deposits</p>
          <p className="text-2xl font-bold text-white">${stats.totalDeposits.toLocaleString()}</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
          <p className="text-red-500 text-sm">Total Withdrawals</p>
          <p className="text-2xl font-bold text-white">${stats.totalWithdrawals.toLocaleString()}</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6">
          <p className="text-blue-500 text-sm">Total Investments</p>
          <p className="text-2xl font-bold text-white">${stats.totalInvestments.toLocaleString()}</p>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-6">
          <p className="text-purple-500 text-sm">Total Profits Paid</p>
          <p className="text-2xl font-bold text-white">${stats.totalProfit.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-xl p-4 mb-6">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by user or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-red-500"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
          >
            <option value="all">All Types</option>
            <option value="deposit">Deposits</option>
            <option value="withdrawal">Withdrawals</option>
            <option value="investment">Investments</option>
            <option value="profit">Profits</option>
            <option value="referral">Referrals</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="failed">Failed</option>
          </select>

          <input
            type="date"
            placeholder="Start Date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
          />

          <input
            type="date"
            placeholder="End Date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
          />
        </form>
        
        <div className="flex justify-end mt-4 gap-2">
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition text-white flex items-center gap-2"
          >
            <FaSearch /> Search
          </button>
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition text-white flex items-center gap-2"
          >
            <FaDownload /> Export CSV
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-700">
                <th className="text-left py-3 px-4 text-slate-300 font-medium">ID</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">User</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Type</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Amount</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Date</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Reference</th>
                <th className="text-center py-3 px-4 text-slate-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <tr key={transaction._id} className="border-b border-slate-700 hover:bg-slate-700/50 transition">
                    <td className="py-3 px-4 text-slate-400 text-sm font-mono">
                      {transaction._id?.slice(-8).toUpperCase()}
                    </td>
                    <td className="py-3 px-4 text-white">
                      {transaction.user?.fullName || transaction.user?.name || 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getTypeBadge(transaction.type)}`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${transaction.type === 'withdrawal' ? 'text-red-500' : 'text-green-500'}`}>
                        {transaction.type === 'withdrawal' ? '-' : '+'}${(transaction.amount || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-sm">
                      {transaction.createdAt ? new Date(transaction.createdAt).toLocaleString() : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-sm font-mono">
                      {transaction.reference || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleViewDetails(transaction._id)}
                          className="p-2 hover:bg-slate-600 rounded-lg transition"
                          title="View Details"
                        >
                          <FaEye className="text-blue-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-slate-700">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition"
            >
              Previous
            </button>
            <span className="px-4 py-2 bg-slate-800 rounded-lg">
              Page {currentPage} of {pagination.pages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
              disabled={currentPage === pagination.pages}
              className="px-4 py-2 bg-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      {showDetailModal && selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700 shadow-2xl">
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-xl font-bold text-white">Transaction Details</h2>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedTransaction(null);
                }}
                className="p-2 hover:bg-slate-700 rounded-lg transition"
              >
                <FaTimes className="text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <p className="text-xs text-slate-400">Transaction ID</p>
                  <p className="text-white font-mono text-sm">{selectedTransaction._id}</p>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <p className="text-xs text-slate-400">Reference</p>
                  <p className="text-white font-mono text-sm">{selectedTransaction.reference || 'N/A'}</p>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <p className="text-xs text-slate-400">User</p>
                  <p className="text-white">{selectedTransaction.user?.fullName || selectedTransaction.user?.name || 'N/A'}</p>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <p className="text-xs text-slate-400">Type</p>
                  <p className={`capitalize font-semibold ${getTypeBadge(selectedTransaction.type)}`}>
                    {selectedTransaction.type}
                  </p>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <p className="text-xs text-slate-400">Amount</p>
                  <p className={`font-bold ${selectedTransaction.type === 'withdrawal' ? 'text-red-500' : 'text-green-500'}`}>
                    {selectedTransaction.type === 'withdrawal' ? '-' : '+'}${(selectedTransaction.amount || 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <p className="text-xs text-slate-400">Currency</p>
                  <p className="text-white">{selectedTransaction.currency || 'USD'}</p>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <p className="text-xs text-slate-400">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedTransaction.status)}`}>
                    {selectedTransaction.status}
                  </span>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <p className="text-xs text-slate-400">Date</p>
                  <p className="text-white">{selectedTransaction.createdAt ? new Date(selectedTransaction.createdAt).toLocaleString() : 'N/A'}</p>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-lg col-span-2">
                  <p className="text-xs text-slate-400">Description</p>
                  <p className="text-white">{selectedTransaction.description || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTransactions;