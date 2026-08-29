import { useState, useEffect } from 'react';
import { FaSearch, FaEdit, FaTrash, FaBan, FaCheckCircle, FaEye, FaSpinner, FaTimes, FaSave, FaUser, FaEnvelope, FaPhone, FaGlobe, FaDollarSign, FaCalendarAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import API from '../../utils/axios';
import { country } from '../../data/countries'; // ✅ import countries

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, filterStatus]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await API.get('/admin/users', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm,
          status: filterStatus !== 'all' ? filterStatus : undefined
        }
      });
      if (response.data.success) {
        const mappedUsers = response.data.data.map(user => ({
          ...user,
          balance: user.balance || user.wallet?.balance || 0,
          profitBalance: user.profitBalance || user.wallet?.profitBalance || 0,
          referralBalance: user.referralBalance || user.wallet?.referralBalance || 0,
        }));
        setUsers(mappedUsers);
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

  // View User
  const handleViewUser = async (userId) => {
    try {
      const response = await API.get(`/admin/users/${userId}`);
      
      if (response.data.success) {
        const { user, wallet, kyc } = response.data.data;

        setSelectedUser({
          _id: user._id,
          fullName: user.fullName || user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          country: user.country || '',
          currency: user.currency || 'USD',
          isActive: user.isActive !== undefined ? user.isActive : true,
          isVerified: user.isVerified || false,
          createdAt: user.createdAt,
          balance: wallet?.balance || 0,
          profitBalance: wallet?.profitBalance || 0,
          referralBalance: wallet?.referralBalance || 0,
          wallet: wallet,
          kyc: kyc,
        });

        setEditForm({
          fullName: user.fullName || user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          country: user.country || '',
          currency: user.currency || 'USD',
          isActive: user.isActive !== undefined ? user.isActive : true,
          isVerified: user.isVerified || false,
        });

        setIsEditing(false);
        setShowUserModal(true);
        return true;
      }
    } catch (error) {
      console.error('View user error:', error);
      toast.error('Failed to load user details');
      return false;
    }
  };

  // Edit User
  const handleEditUser = () => {
    if (!selectedUser) {
      toast.error('No user selected');
      return;
    }
    setIsEditing(true);
    setEditForm({
      fullName: selectedUser.fullName || '',
      email: selectedUser.email || '',
      phone: selectedUser.phone || '',
      country: selectedUser.country || '',
      currency: selectedUser.currency || 'USD',
      isActive: selectedUser.isActive !== undefined ? selectedUser.isActive : true,
      isVerified: selectedUser.isVerified || false,
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveUser = async () => {
    if (!selectedUser || !selectedUser._id) {
      toast.error('User not selected properly. Please close and reopen the modal.');
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        fullName: editForm.fullName || '',
        email: editForm.email || '',
        phone: editForm.phone || '',
        country: editForm.country || '',
        currency: editForm.currency || 'USD',
        isActive: editForm.isActive !== undefined ? editForm.isActive : true,
        isVerified: editForm.isVerified || false,
      };
      
      const response = await API.put(`/admin/users/${selectedUser._id}`, updateData);
      if (response.data.success) {
        toast.success('User updated successfully');
        setSelectedUser(prev => ({ ...prev, ...updateData }));
        setIsEditing(false);
        fetchUsers();
      } else {
        toast.error(response.data.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Update user error:', error);
      toast.error(error.response?.data?.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const isActive = newStatus === 'active';
      const response = await API.put(`/admin/users/${userId}`, { isActive });
      if (response.data.success) {
        toast.success(`User ${isActive ? 'activated' : 'suspended'} successfully`);
        fetchUsers();
        if (selectedUser && selectedUser._id === userId) {
          setSelectedUser(prev => ({ ...prev, isActive }));
          setEditForm(prev => ({ ...prev, isActive }));
        }
      }
    } catch (error) {
      console.error('Status change error:', error);
      toast.error(error.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleVerifyUser = async (userId) => {
    try {
      const response = await API.put(`/admin/users/${userId}`, { isVerified: true });
      if (response.data.success) {
        toast.success('User verified successfully');
        fetchUsers();
        if (selectedUser && selectedUser._id === userId) {
          setSelectedUser(prev => ({ ...prev, isVerified: true }));
          setEditForm(prev => ({ ...prev, isVerified: true }));
        }
      }
    } catch (error) {
      console.error('Verify user error:', error);
      toast.error(error.response?.data?.message || 'Failed to verify user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const response = await API.delete(`/admin/users/${userId}`);
      if (response.data.success) {
        toast.success('User deleted successfully');
        fetchUsers();
        setShowUserModal(false);
      }
    } catch (error) {
      console.error('Delete user error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const getStatusColor = (status) => {
    const isActive = status === 'active' || status === true;
    if (isActive) return 'text-green-500 bg-green-500/10';
    if (status === 'suspended' || status === false) return 'text-red-500 bg-red-500/10';
    if (status === 'pending') return 'text-yellow-500 bg-yellow-500/10';
    return 'text-slate-400 bg-slate-500/10';
  };

  const getStatusText = (status) => {
    if (status === 'active' || status === true) return 'active';
    if (status === 'suspended' || status === false) return 'suspended';
    return status || 'pending';
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
        <h1 className="text-2xl font-bold text-white">User Management</h1>
        <p className="text-slate-400 mt-1">Manage all registered users</p>
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
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
          </select>
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
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Contact</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Balance</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Verified</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Joined</th>
                <th className="text-center py-3 px-4 text-slate-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user._id} className="border-b border-slate-700 hover:bg-slate-700/50 transition">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-semibold text-white">{user.fullName || user.name || 'N/A'}</p>
                        <p className="text-xs text-slate-400">{user.email || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{user.phone || 'N/A'}</td>
                    <td className="py-3 px-4 text-white font-semibold">
                      ${(user.balance || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.isActive)}`}>
                        {getStatusText(user.isActive)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {user.isVerified ? (
                        <FaCheckCircle className="text-green-500" />
                      ) : (
                        <button
                          onClick={() => handleVerifyUser(user._id)}
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          Verify
                        </button>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={async () => {
                            await handleViewUser(user._id);
                            handleEditUser();
                          }}
                          className="p-2 hover:bg-slate-600 rounded-lg transition"
                          title="Edit"
                        >
                          <FaEdit className="text-yellow-400" />
                        </button>
                        <button
                          onClick={() => handleViewUser(user._id)}
                          className="p-2 hover:bg-slate-600 rounded-lg transition"
                          title="View"
                        >
                          <FaEye className="text-blue-400" />
                        </button>
                        {user.isActive ? (
                          <button
                            onClick={() => handleStatusChange(user._id, 'suspended')}
                            className="p-2 hover:bg-slate-600 rounded-lg transition"
                            title="Suspend"
                          >
                            <FaBan className="text-orange-400" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(user._id, 'active')}
                            className="p-2 hover:bg-slate-600 rounded-lg transition"
                            title="Activate"
                          >
                            <FaCheckCircle className="text-green-400" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-2 hover:bg-slate-600 rounded-lg transition"
                          title="Delete"
                        >
                          <FaTrash className="text-red-400" />
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

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700 shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-xl font-bold text-white">
                {isEditing ? 'Edit User' : 'User Details'}
              </h2>
              <div className="flex gap-2">
                {!isEditing ? (
                  <button
                    onClick={handleEditUser}
                    className="px-4 py-2 bg-yellow-600 rounded-lg hover:bg-yellow-700 transition text-white flex items-center gap-2"
                  >
                    <FaEdit /> Edit
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-slate-600 rounded-lg hover:bg-slate-700 transition text-white flex items-center gap-2"
                    >
                      <FaTimes /> Cancel
                    </button>
                    <button
                      onClick={handleSaveUser}
                      disabled={saving}
                      className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition text-white flex items-center gap-2 disabled:opacity-50"
                    >
                      {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowUserModal(false)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition"
                >
                  <FaTimes className="text-slate-400" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Profile Summary */}
              <div className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-lg">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-2xl font-bold text-white">
                  {(selectedUser.fullName || 'U').charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {isEditing ? (
                      <input
                        type="text"
                        name="fullName"
                        value={editForm.fullName || ''}
                        onChange={handleEditChange}
                        className="bg-slate-700 rounded px-2 py-1 text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      selectedUser.fullName || 'N/A'
                    )}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={editForm.email || ''}
                        onChange={handleEditChange}
                        className="bg-slate-700 rounded px-2 py-1 text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      selectedUser.email || 'N/A'
                    )}
                  </p>
                </div>
                <div className="ml-auto flex flex-col items-end">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedUser.isActive)}`}>
                    {getStatusText(selectedUser.isActive)}
                  </span>
                  <span className="text-xs text-slate-400 mt-1">
                    {selectedUser.isVerified ? '✅ Verified' : '❌ Not Verified'}
                  </span>
                </div>
              </div>

              {/* User Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <p className="text-xs text-slate-400 flex items-center gap-2">
                    <FaUser className="text-blue-400" /> Full Name
                  </p>
                  {isEditing ? (
                    <input
                      type="text"
                      name="fullName"
                      value={editForm.fullName || ''}
                      onChange={handleEditChange}
                      className="bg-slate-700 rounded px-2 py-1 text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                    />
                  ) : (
                    <p className="text-white mt-1">{selectedUser.fullName || 'N/A'}</p>
                  )}
                </div>
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <p className="text-xs text-slate-400 flex items-center gap-2">
                    <FaEnvelope className="text-blue-400" /> Email
                  </p>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={editForm.email || ''}
                      onChange={handleEditChange}
                      className="bg-slate-700 rounded px-2 py-1 text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                    />
                  ) : (
                    <p className="text-white mt-1">{selectedUser.email || 'N/A'}</p>
                  )}
                </div>
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <p className="text-xs text-slate-400 flex items-center gap-2">
                    <FaPhone className="text-blue-400" /> Phone
                  </p>
                  {isEditing ? (
                    <input
                      type="text"
                      name="phone"
                      value={editForm.phone || ''}
                      onChange={handleEditChange}
                      className="bg-slate-700 rounded px-2 py-1 text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                    />
                  ) : (
                    <p className="text-white mt-1">{selectedUser.phone || 'N/A'}</p>
                  )}
                </div>
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <p className="text-xs text-slate-400 flex items-center gap-2">
                    <FaGlobe className="text-blue-400" /> Country
                  </p>
                  {isEditing ? (
                    <select
                      name="country"
                      value={editForm.country || ''}
                      onChange={handleEditChange}
                      className="bg-slate-700 rounded px-2 py-1 text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                    >
                      <option value="">Select Country</option>
                      {country.map((c) => (
                        <option key={c.code} value={c.name}>
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-white mt-1">{selectedUser.country || 'N/A'}</p>
                  )}
                </div>
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <p className="text-xs text-slate-400 flex items-center gap-2">
                    <FaDollarSign className="text-blue-400" /> Currency
                  </p>
                  {isEditing ? (
                    <select
                      name="currency"
                      value={editForm.currency || 'USD'}
                      onChange={handleEditChange}
                      className="bg-slate-700 rounded px-2 py-1 text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="NGN">NGN - Nigerian Naira</option>
                      <option value="BRL">BRL - Brazilian Real</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                      <option value="AUD">AUD - Australian Dollar</option>
                      <option value="JPY">JPY - Japanese Yen</option>
                      <option value="CHF">CHF - Swiss Franc</option>
                      <option value="AED">AED - UAE Dirham</option>
                      <option value="SAR">SAR - Saudi Riyal</option>
                      <option value="INR">INR - Indian Rupee</option>
                      <option value="PKR">PKR - Pakistani Rupee</option>
                      <option value="KES">KES - Kenyan Shilling</option>
                      <option value="GHS">GHS - Ghanaian Cedi</option>
                      <option value="ZAR">ZAR - South African Rand</option>
                      <option value="DZD">DZD - Algerian Dinar</option>
                      <option value="JOD">JOD - Jordanian Dinar</option>
                    </select>
                  ) : (
                    <p className="text-white mt-1">{selectedUser.currency || 'USD'}</p>
                  )}
                </div>
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <p className="text-xs text-slate-400 flex items-center gap-2">
                    <FaCalendarAlt className="text-blue-400" /> Joined
                  </p>
                  <p className="text-white mt-1">
                    {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Wallet Info */}
              <div className="p-4 bg-slate-700/30 rounded-lg">
                <p className="text-xs text-slate-400">Wallet Balance</p>
                <p className="text-2xl font-bold text-white">
                  ${(selectedUser.wallet?.balance || selectedUser.balance || 0).toLocaleString()}
                </p>
                <div className="flex gap-4 mt-2 text-sm">
                  <span className="text-slate-400">Profit: <span className="text-green-400">${(selectedUser.wallet?.profitBalance || 0).toLocaleString()}</span></span>
                  <span className="text-slate-400">Referral: <span className="text-yellow-400">${(selectedUser.wallet?.referralBalance || 0).toLocaleString()}</span></span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-700">
                <button
                  onClick={() => handleStatusChange(selectedUser._id, selectedUser.isActive ? 'suspended' : 'active')}
                  className={`px-4 py-2 rounded-lg transition ${selectedUser.isActive ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
                >
                  {selectedUser.isActive ? 'Suspend User' : 'Activate User'}
                </button>
                <button
                  onClick={() => handleVerifyUser(selectedUser._id)}
                  disabled={selectedUser.isVerified}
                  className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition text-white disabled:opacity-50"
                >
                  {selectedUser.isVerified ? 'Already Verified' : 'Verify User'}
                </button>
                <button
                  onClick={() => handleDeleteUser(selectedUser._id)}
                  className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition text-white"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;