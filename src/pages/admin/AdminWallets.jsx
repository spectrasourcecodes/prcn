import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaSpinner, FaTimes, FaSave, FaWallet, FaBitcoin, FaEthereum, FaMoneyBillWave } from 'react-icons/fa';
import { SiBinance, SiTether } from 'react-icons/si';
import toast from 'react-hot-toast';
import API from '../../utils/axios';

const AdminWallets = () => {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingWallet, setEditingWallet] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'crypto',
    currency: 'BTC',
    address: '',
    details: {
      network: '',
      bankName: '',
      accountName: '',
      accountNumber: '',
      routingNumber: '',
      swift: '',
      keyType: '',
      bank: '',
    },
    isActive: true,
    isDefault: false,
    order: 0,
  });

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      setLoading(true);
      const response = await API.get('/admin/wallets');
      if (response.data.success) {
        setWallets(response.data.data);
      } else {
        toast.error('Failed to load wallets');
      }
    } catch (error) {
      console.error('Fetch wallets error:', error);
      toast.error(error.response?.data?.message || 'Failed to load wallets');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (wallet = null) => {
    if (wallet) {
      setEditingWallet(wallet);
      setFormData({
        name: wallet.name || '',
        type: wallet.type || 'crypto',
        currency: wallet.currency || 'BTC',
        address: wallet.address || '',
        details: wallet.details || { network: '' },
        isActive: wallet.isActive !== undefined ? wallet.isActive : true,
        isDefault: wallet.isDefault || false,
        order: wallet.order || 0,
      });
    } else {
      setEditingWallet(null);
      setFormData({
        name: '',
        type: 'crypto',
        currency: 'BTC',
        address: '',
        details: { network: '' },
        isActive: true,
        isDefault: false,
        order: 0,
      });
    }
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    if (name.startsWith('details.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        details: { ...prev.details, [key]: value }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: inputType === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.address) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const walletData = {
        name: formData.name,
        type: formData.type,
        currency: formData.currency,
        address: formData.address,
        details: formData.details,
        isActive: formData.isActive,
        isDefault: formData.isDefault,
        order: parseInt(formData.order) || 0,
      };

      let response;
      if (editingWallet) {
        response = await API.put(`/admin/wallets/${editingWallet._id}`, walletData);
        if (response.data.success) {
          toast.success('Wallet updated successfully');
        }
      } else {
        response = await API.post('/admin/wallets', walletData);
        if (response.data.success) {
          toast.success('Wallet created successfully');
        }
      }
      setShowModal(false);
      fetchWallets();
    } catch (error) {
      console.error('Save wallet error:', error);
      toast.error(error.response?.data?.message || 'Failed to save wallet');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (walletId) => {
    if (!window.confirm('Are you sure you want to delete this wallet?')) return;
    try {
      const response = await API.delete(`/admin/wallets/${walletId}`);
      if (response.data.success) {
        toast.success('Wallet deleted successfully');
        fetchWallets();
      }
    } catch (error) {
      console.error('Delete wallet error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete wallet');
    }
  };

  const handleToggleStatus = async (walletId, currentStatus) => {
    try {
      const response = await API.patch(`/admin/wallets/${walletId}/toggle`);
      if (response.data.success) {
        toast.success(`Wallet ${currentStatus ? 'deactivated' : 'activated'} successfully`);
        fetchWallets();
      }
    } catch (error) {
      console.error('Toggle status error:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'crypto': return <FaBitcoin className="text-orange-400" />;
      case 'pix': return <FaMoneyBillWave className="text-emerald-400" />;
      case 'bank': return <FaWallet className="text-blue-400" />;
      default: return <FaWallet className="text-slate-400" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'crypto': return 'border-orange-500/30 bg-orange-500/10';
      case 'pix': return 'border-emerald-500/30 bg-emerald-500/10';
      case 'bank': return 'border-blue-500/30 bg-blue-500/10';
      default: return 'border-slate-500/30 bg-slate-500/10';
    }
  };

  const getCurrencyIcon = (currency) => {
    const icons = {
      BTC: <FaBitcoin className="text-orange-400" />,
      ETH: <FaEthereum className="text-purple-400" />,
      USDT: <SiTether className="text-green-400" />,
      BNB: <SiBinance className="text-yellow-400" />,
    };
    return icons[currency] || <FaWallet className="text-slate-400" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading wallets...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Payment Wallets</h1>
          <p className="text-slate-400 mt-1">Manage payment methods for deposits</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition flex items-center gap-2 text-white"
        >
          <FaPlus /> Add New Wallet
        </button>
      </div>

      {/* Wallets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wallets.length > 0 ? (
          wallets.map((wallet) => (
            <div
              key={wallet._id}
              className={`bg-slate-800 rounded-2xl overflow-hidden border ${getTypeColor(wallet.type)} ${!wallet.isActive ? 'opacity-60' : ''}`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                      {getTypeIcon(wallet.type)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{wallet.name}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        {getCurrencyIcon(wallet.currency)} {wallet.currency} • {wallet.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {wallet.isDefault && (
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs">Default</span>
                    )}
                    <button
                      onClick={() => handleToggleStatus(wallet._id, wallet.isActive)}
                      className="p-1.5 rounded-lg hover:bg-slate-700 transition"
                      title={wallet.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {wallet.isActive ? (
                        <FaToggleOn className="text-green-500 text-xl" />
                      ) : (
                        <FaToggleOff className="text-red-500 text-xl" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-3 mb-4">
                  <p className="text-xs text-slate-400">Address</p>
                  <p className="text-sm text-white font-mono break-all">{wallet.address}</p>
                </div>

                {wallet.type === 'crypto' && wallet.details?.network && (
                  <div className="mb-4">
                    <p className="text-xs text-slate-400">Network</p>
                    <p className="text-sm text-white">{wallet.details.network}</p>
                  </div>
                )}

                {wallet.type === 'pix' && (
                  <div className="mb-4">
                    <p className="text-xs text-slate-400">PIX Details</p>
                    <p className="text-sm text-white">{wallet.details?.keyType || 'N/A'}</p>
                    <p className="text-sm text-white">{wallet.details?.bank || 'N/A'}</p>
                  </div>
                )}

                {wallet.type === 'bank' && (
                  <div className="mb-4">
                    <p className="text-xs text-slate-400">Bank Details</p>
                    <p className="text-sm text-white">{wallet.details?.bankName || 'N/A'}</p>
                    <p className="text-sm text-white">{wallet.details?.accountName || 'N/A'}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t border-slate-700">
                  <button
                    onClick={() => handleOpenModal(wallet)}
                    className="flex-1 py-2 px-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(wallet._id)}
                    className="py-2 px-4 rounded-lg bg-red-600/20 text-red-500 font-semibold hover:bg-red-600/30 transition flex items-center justify-center gap-2"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-slate-400">
            No wallets found. Click "Add New Wallet" to create one.
          </div>
        )}
      </div>

      {/* Add/Edit Wallet Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">
                {editingWallet ? 'Edit Wallet' : 'Add New Wallet'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition"
              >
                <FaTimes className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2">Wallet Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g., Bitcoin Wallet"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Type *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="crypto">Cryptocurrency</option>
                    <option value="pix">PIX</option>
                    <option value="bank">Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Currency *</label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                    <option value="USDT">USDT</option>
                    <option value="BNB">BNB</option>
                    <option value="TRX">TRX</option>
                    <option value="BRL">BRL</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-2">Address / Key *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="Wallet address or PIX key"
                />
              </div>

              {/* Crypto Details */}
              {formData.type === 'crypto' && (
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Network</label>
                  <input
                    type="text"
                    name="details.network"
                    value={formData.details?.network || ''}
                    onChange={handleChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g., ERC20, BEP20, TRC20"
                  />
                </div>
              )}

              {/* Bank Details */}
              {formData.type === 'bank' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Bank Name</label>
                    <input
                      type="text"
                      name="details.bankName"
                      value={formData.details?.bankName || ''}
                      onChange={handleChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Account Name</label>
                    <input
                      type="text"
                      name="details.accountName"
                      value={formData.details?.accountName || ''}
                      onChange={handleChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Account Number</label>
                    <input
                      type="text"
                      name="details.accountNumber"
                      value={formData.details?.accountNumber || ''}
                      onChange={handleChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Routing Number</label>
                    <input
                      type="text"
                      name="details.routingNumber"
                      value={formData.details?.routingNumber || ''}
                      onChange={handleChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* PIX Details */}
              {formData.type === 'pix' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Key Type</label>
                    <select
                      name="details.keyType"
                      value={formData.details?.keyType || ''}
                      onChange={handleChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Select</option>
                      <option value="CPF">CPF</option>
                      <option value="CNPJ">CNPJ</option>
                      <option value="Email">Email</option>
                      <option value="Phone">Phone</option>
                      <option value="Random">Random</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Bank</label>
                    <input
                      type="text"
                      name="details.bank"
                      value={formData.details?.bank || ''}
                      onChange={handleChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="text-slate-300 text-sm">Active</label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="text-slate-300 text-sm">Set as Default</label>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-2">Display Order</label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                {saving ? 'Saving...' : (editingWallet ? 'Update Wallet' : 'Add Wallet')}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-lg bg-slate-700 text-white font-semibold hover:bg-slate-600 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWallets;