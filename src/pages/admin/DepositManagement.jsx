import { useState } from 'react';
import { FaSearch, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import toast from 'react-hot-toast';

const DepositManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [deposits, setDeposits] = useState([
    { id: 'DEP001', user: 'John Doe', amount: 5000, method: 'USDT (TRC20)', date: '2024-01-20 14:30', status: 'pending', txHash: '0x742d35Cc6634C0532925a3b844Bc9e7595f0b3b' },
    { id: 'DEP002', user: 'Jane Smith', amount: 2500, method: 'BTC', date: '2024-01-19 10:15', status: 'completed', txHash: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' },
    { id: 'DEP003', user: 'Mike Johnson', amount: 10000, method: 'Bank Transfer', date: '2024-01-19 09:45', status: 'pending', txHash: 'TRX123456789' },
    { id: 'DEP004', user: 'Sarah Wilson', amount: 3000, method: 'ETH', date: '2024-01-18 16:20', status: 'completed', txHash: '0x742d35Cc6634C0532925a3b844Bc9e7595f0b3b' },
  ]);

  const handleStatusChange = (depositId, newStatus) => {
    setDeposits(deposits.map(deposit => 
      deposit.id === depositId ? { ...deposit, status: newStatus } : deposit
    ));
    toast.success(`Deposit ${newStatus === 'completed' ? 'approved' : 'rejected'} successfully`);
  };

  const filteredDeposits = deposits.filter(deposit => {
    const matchesSearch = deposit.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deposit.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || deposit.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'completed':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500">Completed</span>;
      case 'pending':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500">Pending</span>;
      case 'rejected':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500">Rejected</span>;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Deposit Management</h1>
        <p className="text-slate-400 mt-1">Manage user deposits</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6">
          <p className="text-green-500 text-sm">Total Deposits</p>
          <p className="text-2xl font-bold text-white">$205,000</p>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6">
          <p className="text-yellow-500 text-sm">Pending Deposits</p>
          <p className="text-2xl font-bold text-white">$15,000</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6">
          <p className="text-blue-500 text-sm">Total Transactions</p>
          <p className="text-2xl font-bold text-white">156</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
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
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Deposits Table */}
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
              {filteredDeposits.map((deposit) => (
                <tr key={deposit.id} className="border-b border-slate-700 hover:bg-slate-700/50 transition">
                  <td className="py-3 px-4 text-slate-400 text-sm">{deposit.id}</td>
                  <td className="py-3 px-4 text-white">{deposit.user}</td>
                  <td className="py-3 px-4 text-green-500 font-semibold">${deposit.amount.toLocaleString()}</td>
                  <td className="py-3 px-4 text-slate-400">{deposit.method}</td>
                  <td className="py-3 px-4 text-slate-400">{deposit.date}</td>
                  <td className="py-3 px-4">{getStatusBadge(deposit.status)}</td>
                  <td className="py-3 px-4">
                    {deposit.status === 'pending' && (
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleStatusChange(deposit.id, 'completed')} className="p-2 bg-green-500/20 rounded-lg hover:bg-green-500/30 transition" title="Approve">
                          <FaCheckCircle className="text-green-500" />
                        </button>
                        <button onClick={() => handleStatusChange(deposit.id, 'rejected')} className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition" title="Reject">
                          <FaTimesCircle className="text-red-500" />
                        </button>
                      </div>
                    )}
                    {deposit.status === 'completed' && (
                      <span className="text-xs text-green-500">✓ Approved</span>
                    )}
                    {deposit.status === 'rejected' && (
                      <span className="text-xs text-red-500">✗ Rejected</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DepositManagement;