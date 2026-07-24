import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaFilter, FaSearch } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import TransactionCard from '../components/TransactionCard';
import { walletService } from '../services/walletService';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });

  useEffect(() => {
    fetchTransactions();
  }, [pagination.page, filterType]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await walletService.getTransactions(pagination.page, pagination.limit);
      setTransactions(response.data);
      setPagination(response.pagination);
    } catch (error) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(tx =>
    tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.reference?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  if (loading && transactions.length === 0) {
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
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Transactions</h1>
          <p className="text-slate-400 mt-1">View your transaction history</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>
          <div className="flex items-center gap-2">
            <FaFilter className="text-slate-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="deposit">Deposits</option>
              <option value="withdrawal">Withdrawals</option>
              <option value="investment">Investments</option>
              <option value="profit">Profits</option>
              <option value="referral">Referrals</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {filteredTransactions.map((tx) => (
            <TransactionCard key={tx._id} transaction={tx} />
          ))}
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            No transactions found.
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-4 py-2 bg-slate-800 rounded-lg text-white disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-slate-400">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="px-4 py-2 bg-slate-800 rounded-lg text-white disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;