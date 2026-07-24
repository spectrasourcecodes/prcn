import { useState, useEffect } from 'react';
import { FaSearch, FaCheckCircle, FaTimesCircle, FaSpinner, FaEye } from 'react-icons/fa';
import toast from 'react-hot-toast';
import API from '../../utils/axios';

const WithdrawalManagement = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [processing, setProcessing] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchWithdrawals();
  }, [pagination.page, filterStatus]);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const response = await API.get('/admin/withdrawals', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          status: filterStatus !== 'all' ? filterStatus : undefined,
          search: searchTerm || undefined,
        }
      });
      if (response.data.success) {
        setWithdrawals(response.data.data);
        setPagination(response.data.pagination);
      } else {
        toast.error('Failed to load withdrawals');
      }
    } catch (error) {
      console.error('Fetch withdrawals error:', error);
      toast.error(error.response?.data?.message || 'Failed to load withdrawals');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchWithdrawals();
  };

  const handleStatusChange = async (withdrawalId, newStatus) => {
    setProcessing(true);
    try {
      let response;
      if (newStatus === 'approved') {
        response = await API.post(`/admin/withdrawals/${withdrawalId}/approve`);
      } else if (newStatus === 'rejected') {
        response = await API.post(`/admin/withdrawals/${withdrawalId}/reject`, {
          reason: 'Rejected by admin'
        });
      } else if (newStatus === 'paid') {
        response = await API.post(`/admin/withdrawals/${withdrawalId}/mark-paid`, {
          transactionHash: '0x' + Math.random().toString(36).substring(2, 15)
        });
      }

      if (response?.data.success) {
        toast.success(`Withdrawal ${newStatus === 'approved' ? 'approved' : newStatus === 'rejected' ? 'rejected' : 'marked as paid'} successfully`);
        fetchWithdrawals();
      } else {
        toast.error(response?.data?.message || 'Failed to update withdrawal');
      }
    } catch (error) {
      console.error('Status change error:', error);
      toast.error(error.response?.data?.message || 'Failed to update withdrawal');
    } finally {
      setProcessing(false);
    }
  };

  const handleViewDetails = async (withdrawalId) => {
    try {
      const response = await API.get(`/admin/withdrawals/${withdrawalId}`);
      if (response.data.success) {
        setSelectedWithdrawal(response.data.data);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('View withdrawal error:', error);
      toast.error('Failed to load withdrawal details');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-500/10 text-yellow-500',
      approved: 'bg-blue-500/10 text-blue-500',
      rejected: 'bg-red-500/10 text-red-500',
      paid: 'bg-green-500/10 text-green-500',
      cancelled: 'bg-slate-500/10 text-slate-400',
    };
    return badges[status] || 'bg-slate-500/10 text-slate-400';
  };

  const getStats = () => {
    const stats = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      paid: 0,
    };
    withdrawals.forEach(w => {
      stats.total += w.amount || 0;
      if (w.status === 'pending') stats.pending += w.amount || 0;
      if (w.status === 'approved') stats.approved += w.amount || 0;
      if (w.status === 'rejected') stats.rejected += w.amount || 0;
      if (w.status === 'paid') stats.paid += w.amount || 0;
    });
    return stats;
  };

  const stats = getStats();

  if (loading && withdrawals.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading withdrawals...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Withdrawal Management</h1>
        <p className="text-slate-400 mt-1">Process user withdrawal requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-6">
          <p className="text-orange-500 text-sm">Total Withdrawals</p>
          <p className="text-2xl font-bold text-white">${stats.total.toLocaleString()}</p>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6">
          <p className="text-yellow-500 text-sm">Pending</p>
          <p className="text-2xl font-bold text-white">${stats.pending.toLocaleString()}</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6">
          <p className="text-blue-500 text-sm">Approved</p>
          <p className="text-2xl font-bold text-white">${stats.approved.toLocaleString()}</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6">
          <p className="text-green-500 text-sm">Paid</p>
          <p className="text-2xl font-bold text-white">${stats.paid.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-xl p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by user or transaction ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="paid">Paid</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition text-white"
          >
            Search
          </button>
        </form>
      </div>

      {/* Withdrawals Table */}
      <div className="bg-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-700">
                <th className="text-left py-3 px-4 text-slate-300 font-medium">ID</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">User</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Amount</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Method</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Date</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Status</th>
                <th className="text-center py-3 px-4 text-slate-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.length > 0 ? (
                withdrawals.map((withdrawal) => (
                  <tr key={withdrawal._id} className="border-b border-slate-700 hover:bg-slate-700/50 transition">
                    <td className="py-3 px-4 text-slate-400 text-sm font-mono">
                      {withdrawal._id?.slice(-8).toUpperCase()}
                    </td>
                    <td className="py-3 px-4 text-white">
                      {withdrawal.user?.fullName || withdrawal.user?.name || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-orange-500 font-semibold">
                      ${(withdrawal.amount || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {withdrawal.cryptoCurrency || withdrawal.method || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-sm">
                      {withdrawal.createdAt ? new Date(withdrawal.createdAt).toLocaleString() : 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(withdrawal.status)}`}>
                        {withdrawal.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleViewDetails(withdrawal._id)}
                          className="p-2 hover:bg-slate-600 rounded-lg transition"
                          title="View Details"
                        >
                          <FaEye className="text-blue-400" />
                        </button>
                        {withdrawal.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(withdrawal._id, 'approved')}
                              disabled={processing}
                              className="p-2 bg-green-500/20 rounded-lg hover:bg-green-500/30 transition disabled:opacity-50"
                              title="Approve"
                            >
                              <FaCheckCircle className="text-green-500" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(withdrawal._id, 'rejected')}
                              disabled={processing}
                              className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition disabled:opacity-50"
                              title="Reject"
                            >
                              <FaTimesCircle className="text-red-500" />
                            </button>
                          </>
                        )}
                        {withdrawal.status === 'approved' && (
                          <button
                            onClick={() => handleStatusChange(withdrawal._id, 'paid')}
                            disabled={processing}
                            className="p-2 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition disabled:opacity-50"
                            title="Mark as Paid"
                          >
                            <FaCheckCircle className="text-blue-500" />
                          </button>
                        )}
                        {withdrawal.status === 'paid' && (
                          <span className="text-xs text-green-500 flex items-center">✓ Paid</span>
                        )}
                        {withdrawal.status === 'rejected' && (
                          <span className="text-xs text-red-500 flex items-center">✗ Rejected</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No withdrawals found
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
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page <= 1}
              className="px-4 py-2 bg-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition"
            >
              Previous
            </button>
            <span className="px-4 py-2 bg-slate-800 rounded-lg">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page >= pagination.pages}
              className="px-4 py-2 bg-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Withdrawal Detail Modal */}
      {showDetailModal && selectedWithdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700 shadow-2xl">
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-xl font-bold text-white">Withdrawal Details</h2>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedWithdrawal(null);
                }}
                className="p-2 hover:bg-slate-700 rounded-lg transition"
              >
                <FaTimesCircle className="text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <p className="text-xs text-slate-400">Transaction ID</p>
                  <p className="text-white font-mono text-sm">{selectedWithdrawal._id}</p>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <p className="text-xs text-slate-400">Reference</p>
                  <p className="text-white font-mono text-sm">{selectedWithdrawal.reference || 'N/A'}</p>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <p className="text-xs text-slate-400">User</p>
                  <p className="text-white">{selectedWithdrawal.user?.fullName || selectedWithdrawal.user?.name || 'N/A'}</p>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <p className="text-xs text-slate-400">Amount</p>
                  <p className="text-xl font-bold text-orange-500">${(selectedWithdrawal.amount || 0).toLocaleString()}</p>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <p className="text-xs text-slate-400">Cryptocurrency</p>
                  <p className="text-white">{selectedWithdrawal.cryptoCurrency || 'N/A'}</p>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <p className="text-xs text-slate-400">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedWithdrawal.status)}`}>
                    {selectedWithdrawal.status}
                  </span>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <p className="text-xs text-slate-400">Wallet Address</p>
                  <p className="text-white text-sm break-all">{selectedWithdrawal.walletAddress || 'N/A'}</p>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <p className="text-xs text-slate-400">Date Requested</p>
                  <p className="text-white">{selectedWithdrawal.createdAt ? new Date(selectedWithdrawal.createdAt).toLocaleString() : 'N/A'}</p>
                </div>
                {selectedWithdrawal.approvedAt && (
                  <div className="p-3 bg-slate-700/30 rounded-lg col-span-2">
                    <p className="text-xs text-slate-400">Approved Date</p>
                    <p className="text-white">{new Date(selectedWithdrawal.approvedAt).toLocaleString()}</p>
                  </div>
                )}
                {selectedWithdrawal.rejectionReason && (
                  <div className="p-3 bg-slate-700/30 rounded-lg col-span-2">
                    <p className="text-xs text-slate-400">Rejection Reason</p>
                    <p className="text-red-400">{selectedWithdrawal.rejectionReason}</p>
                  </div>
                )}
              </div>

              {selectedWithdrawal.status === 'pending' && (
                <div className="flex gap-2 pt-4 border-t border-slate-700">
                  <button
                    onClick={() => {
                      handleStatusChange(selectedWithdrawal._id, 'approved');
                      setShowDetailModal(false);
                    }}
                    disabled={processing}
                    className="flex-1 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition text-white"
                  >
                    Approve Withdrawal
                  </button>
                  <button
                    onClick={() => {
                      handleStatusChange(selectedWithdrawal._id, 'rejected');
                      setShowDetailModal(false);
                    }}
                    disabled={processing}
                    className="flex-1 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition text-white"
                  >
                    Reject Withdrawal
                  </button>
                </div>
              )}
              {selectedWithdrawal.status === 'approved' && (
                <div className="pt-4 border-t border-slate-700">
                  <button
                    onClick={() => {
                      handleStatusChange(selectedWithdrawal._id, 'paid');
                      setShowDetailModal(false);
                    }}
                    disabled={processing}
                    className="w-full py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition text-white"
                  >
                    Mark as Paid
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawalManagement;