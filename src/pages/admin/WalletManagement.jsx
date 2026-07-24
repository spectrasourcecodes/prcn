import { useState, useEffect } from 'react';
import { FaSearch, FaWallet, FaPlus, FaSave, FaTimes, FaSpinner, FaArrowUp } from 'react-icons/fa';
import toast from 'react-hot-toast';
import API from '../../utils/axios';

const WalletManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletData, setWalletData] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  const [balanceForm, setBalanceForm] = useState({
    amount: '',
    type: 'balance',
    action: 'add',
  });

  useEffect(() => {
    fetchUsers();
  }, [pagination.page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await API.get('/admin/users', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm
        }
      });
      if (response.data.success) {
        setUsers(response.data.data);
        setPagination(response.data.pagination);
      } else {
        toast.error('Failed to load users');
      }
    } catch (error) {
      console.error('Users fetch error:', error);
      toast.error(error.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchUsers();
  };

  const handleViewWallet = async (userId) => {
    try {
      // Find user from the existing list first
      const userFromList = users.find(u => u._id === userId);
      
      if (!userFromList) {
        toast.error('User not found');
        return;
      }
      
      // Set selected user from the list
      setSelectedUser({
        _id: userFromList._id,
        fullName: userFromList.fullName || userFromList.name || 'Unknown',
        email: userFromList.email || '',
        currency: userFromList.currency || 'USD',
        isActive: userFromList.isActive !== undefined ? userFromList.isActive : true,
      });
      
      // Fetch or create wallet
      try {
        const walletResponse = await API.get(`/admin/users/${userId}/wallet`);
        setWalletData(walletResponse.data.data);
        setShowWalletModal(true);
      } catch (e) {
        // If 404, create wallet
        if (e.response?.status === 404) {
          toast.loading('Creating wallet...');
          try {
            const createResponse = await API.post(`/admin/users/${userId}/wallet`, {});
            setWalletData(createResponse.data.data);
            toast.dismiss();
            toast.success('Wallet created successfully');
            // Also update the user in the list with the new wallet data
            setUsers(prevUsers => 
              prevUsers.map(user => 
                user._id === userId 
                  ? { 
                      ...user, 
                      balance: 0,
                      profitBalance: 0,
                      referralBalance: 0,
                    }
                  : user
              )
            );
            setShowWalletModal(true);
          } catch (err) {
            toast.dismiss();
            toast.error('Failed to create wallet');
          }
        } else {
          toast.error('Failed to fetch wallet');
        }
      }
    } catch (error) {
      console.error('View wallet error:', error);
      toast.error('Failed to load user wallet');
    }
  };

  const handleUpdateBalance = async () => {
    if (!selectedUser || !selectedUser._id) {
      toast.error('No user selected. Please close and reopen the wallet.');
      return;
    }

    if (!balanceForm.amount || parseFloat(balanceForm.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const amount = balanceForm.action === 'add' 
      ? parseFloat(balanceForm.amount) 
      : -parseFloat(balanceForm.amount);

    setUpdating(true);
    try {
      const response = await API.post(`/admin/users/${selectedUser._id}/balance`, {
        amount: amount,
        type: balanceForm.type
      });
      
      if (response.data.success) {
        toast.success(`Wallet ${balanceForm.action === 'add' ? 'credited' : 'debited'} successfully`);
        
        // Refresh wallet data
        const walletResponse = await API.get(`/admin/users/${selectedUser._id}/wallet`);
        const newWalletData = walletResponse.data.data;
        setWalletData(newWalletData);
        
        // ✅ UPDATE THE USER IN THE USERS LIST with new wallet data
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user._id === selectedUser._id 
              ? { 
                  ...user, 
                  balance: newWalletData.balance,
                  profitBalance: newWalletData.profitBalance,
                  referralBalance: newWalletData.referralBalance,
                }
              : user
          )
        );
        
        setBalanceForm({ amount: '', type: 'balance', action: 'add' });
      } else {
        toast.error(response.data.message || 'Failed to update balance');
      }
    } catch (error) {
      console.error('Balance update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update balance');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    return status ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10';
  };

  const getStatusText = (status) => {
    return status ? 'Active' : 'Inactive';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Wallet Management</h1>
        <p className="text-slate-400 mt-1">Manage user wallets and balances</p>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition text-white"
          >
            Search
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-700">
                <th className="text-left py-3 px-4 text-slate-300 font-medium">User</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Email</th>
                {/* <th className="text-left py-3 px-4 text-slate-300 font-medium">Balance</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Profit</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Referral</th> */}
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Status</th>
                <th className="text-center py-3 px-4 text-slate-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user._id} className="border-b border-slate-700 hover:bg-slate-700/50 transition">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-semibold text-white">{user.fullName || user.name}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{user.email}</td>
                    {/* <td className="py-3 px-4 text-white font-semibold">
                      ${(user.balance || user.wallet?.balance || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-green-400">
                      ${(user.profitBalance || user.wallet?.profitBalance || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-yellow-400">
                      ${(user.referralBalance || user.wallet?.referralBalance || 0).toLocaleString()}
                    </td> */}
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.isActive)}`}>
                        {getStatusText(user.isActive)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleViewWallet(user._id)}
                          className="p-2 hover:bg-slate-600 rounded-lg transition"
                          title="Manage Wallet"
                        >
                          <FaWallet className="text-blue-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-between items-center p-4 border-t border-slate-700">
            <p className="text-sm text-slate-400">
              Showing {users.length} of {pagination.total} users
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page <= 1}
                className="px-3 py-1 bg-slate-700 rounded-lg text-white disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-slate-400">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= pagination.pages}
                className="px-3 py-1 bg-slate-700 rounded-lg text-white disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Wallet Modal */}
      {showWalletModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-700 shadow-2xl">
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-white">Wallet Management</h2>
                <p className="text-sm text-slate-400">{selectedUser.fullName || 'User'}</p>
                <p className="text-xs text-slate-500">ID: {selectedUser._id}</p>
              </div>
              <button
                onClick={() => {
                  setShowWalletModal(false);
                  setSelectedUser(null);
                  setWalletData(null);
                }}
                className="p-2 hover:bg-slate-700 rounded-lg transition"
              >
                <FaTimes className="text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Wallet Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
                  <p className="text-sm text-slate-400">Balance</p>
                  <p className="text-2xl font-bold text-white">
                    ${(walletData?.balance || 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                  <p className="text-sm text-slate-400">Profit Balance</p>
                  <p className="text-2xl font-bold text-green-400">
                    ${(walletData?.profitBalance || 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-center">
                  <p className="text-sm text-slate-400">Referral Balance</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    ${(walletData?.referralBalance || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Balance Update Form */}
              <div className="bg-slate-700/30 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-white mb-3">Update Balance</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Type</label>
                    <select
                      value={balanceForm.type}
                      onChange={(e) => setBalanceForm(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                    >
                      <option value="balance">Balance</option>
                      <option value="profit">Profit</option>
                      <option value="referral">Referral</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Action</label>
                    <select
                      value={balanceForm.action}
                      onChange={(e) => setBalanceForm(prev => ({ ...prev, action: e.target.value }))}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                    >
                      <option value="add">Add (+) </option>
                      <option value="subtract">Subtract (-)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Amount</label>
                    <input
                      type="number"
                      value={balanceForm.amount}
                      onChange={(e) => setBalanceForm(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleUpdateBalance}
                      disabled={updating}
                      className="w-full px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition text-white disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {updating ? <FaSpinner className="animate-spin" /> : <FaSave />}
                      {updating ? 'Updating...' : 'Update'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => {
                    setBalanceForm({
                      amount: '100',
                      type: 'balance',
                      action: 'add'
                    });
                    setTimeout(() => handleUpdateBalance(), 100);
                  }}
                  className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition text-center"
                >
                  <FaPlus className="mx-auto text-green-400 mb-1" />
                  <span className="text-xs text-green-400">Add $100</span>
                </button>
                <button
                  onClick={() => {
                    setBalanceForm({
                      amount: '500',
                      type: 'balance',
                      action: 'add'
                    });
                    setTimeout(() => handleUpdateBalance(), 100);
                  }}
                  className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition text-center"
                >
                  <FaPlus className="mx-auto text-green-400 mb-1" />
                  <span className="text-xs text-green-400">Add $500</span>
                </button>
                <button
                  onClick={() => {
                    setBalanceForm({
                      amount: '100',
                      type: 'profit',
                      action: 'add'
                    });
                    setTimeout(() => handleUpdateBalance(), 100);
                  }}
                  className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition text-center"
                >
                  <FaArrowUp className="mx-auto text-blue-400 mb-1" />
                  <span className="text-xs text-blue-400">Profit +$100</span>
                </button>
                <button
                  onClick={() => {
                    setBalanceForm({
                      amount: '100',
                      type: 'referral',
                      action: 'add'
                    });
                    setTimeout(() => handleUpdateBalance(), 100);
                  }}
                  className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg hover:bg-yellow-500/20 transition text-center"
                >
                  <FaArrowUp className="mx-auto text-yellow-400 mb-1" />
                  <span className="text-xs text-yellow-400">Referral +$100</span>
                </button>
              </div>

              {/* Wallet Details */}
              <div className="bg-slate-700/30 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-white mb-2">Wallet Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-slate-400">Total Deposits:</span>
                    <span className="text-white ml-2">${(walletData?.totalDeposits || 0).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Total Withdrawals:</span>
                    <span className="text-white ml-2">${(walletData?.totalWithdrawals || 0).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">User ID:</span>
                    <span className="text-white ml-2 text-xs">{selectedUser._id}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Currency:</span>
                    <span className="text-white ml-2">{selectedUser.currency || 'USD'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletManagement;