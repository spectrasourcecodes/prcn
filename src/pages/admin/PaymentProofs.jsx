import { useState, useEffect } from 'react';
import { FaSearch, FaEye, FaSpinner, FaTimes, FaCheckCircle, FaTimesCircle, FaDownload, FaImage, FaFilePdf } from 'react-icons/fa';
import toast from 'react-hot-toast';
import API from '../../utils/axios';

const PaymentProofs = () => {
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [selectedProof, setSelectedProof] = useState(null);
  const [showProofModal, setShowProofModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchProofs();
  }, [pagination.page, filterStatus, filterType]);

  const fetchProofs = async () => {
    try {
      setLoading(true);
      const response = await API.get('/admin/payment-proofs', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          status: filterStatus !== 'all' ? filterStatus : undefined,
          type: filterType !== 'all' ? filterType : undefined,
          search: searchTerm || undefined,
        }
      });
      if (response.data.success) {
        setProofs(response.data.data);
        setPagination(response.data.pagination);
      } else {
        toast.error('Failed to load payment proofs');
      }
    } catch (error) {
      console.error('Fetch proofs error:', error);
      toast.error(error.response?.data?.message || 'Failed to load payment proofs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchProofs();
  };

  const handleViewProof = async (proofId) => {
    try {
      const response = await API.get(`/admin/payment-proofs/${proofId}`);
      if (response.data.success) {
        setSelectedProof(response.data.data);
        setShowProofModal(true);
      }
    } catch (error) {
      console.error('View proof error:', error);
      toast.error('Failed to load proof details');
    }
  };

  const handleVerifyProof = async (proofId, action) => {
    setProcessing(true);
    try {
      const endpoint = action === 'approve' ? 'approve' : 'reject';
      const response = await API.post(`/admin/payment-proofs/${proofId}/${endpoint}`);
      if (response.data.success) {
        toast.success(`Proof ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
        fetchProofs();
        if (selectedProof && selectedProof._id === proofId) {
          setSelectedProof(prev => ({ ...prev, status: action === 'approve' ? 'approved' : 'rejected' }));
        }
      } else {
        toast.error(response.data.message || 'Failed to update proof');
      }
    } catch (error) {
      console.error('Verify proof error:', error);
      toast.error(error.response?.data?.message || 'Failed to update proof');
    } finally {
      setProcessing(false);
    }
  };

  // Download image using fetch and blob
  const downloadImage = async (imageUrl, fileName = 'payment-proof.jpg') => {
    try {
      toast.loading('Downloading...');
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(blobUrl);
      toast.dismiss();
      toast.success('Image downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.dismiss();
      toast.error('Failed to download image. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-500/10 text-yellow-500',
      pending_verification: 'bg-yellow-500/10 text-yellow-500',
      approved: 'bg-green-500/10 text-green-500',
      rejected: 'bg-red-500/10 text-red-500',
      verified: 'bg-green-500/10 text-green-500',
    };
    return badges[status] || 'bg-slate-500/10 text-slate-400';
  };

  const getTypeBadge = (type) => {
    const badges = {
      deposit: 'bg-blue-500/10 text-blue-500',
      investment: 'bg-purple-500/10 text-purple-500',
    };
    return badges[type] || 'bg-slate-500/10 text-slate-400';
  };

  const getFileIcon = (url) => {
    if (!url) return <FaImage className="text-blue-400" />;
    if (url.includes('.pdf')) return <FaFilePdf className="text-red-400" />;
    return <FaImage className="text-blue-400" />;
  };

  const getStats = () => {
    const stats = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    };
    proofs.forEach(p => {
      stats.total += 1;
      if (p.status === 'pending' || p.status === 'pending_verification') stats.pending += 1;
      if (p.status === 'approved' || p.status === 'verified') stats.approved += 1;
      if (p.status === 'rejected') stats.rejected += 1;
    });
    return stats;
  };

  const stats = getStats();

  if (loading && proofs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading payment proofs...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Payment Proofs</h1>
        <p className="text-slate-400 mt-1">Verify and manage payment proof submissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6">
          <p className="text-blue-500 text-sm">Total Submissions</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6">
          <p className="text-yellow-500 text-sm">Pending Review</p>
          <p className="text-2xl font-bold text-white">{stats.pending}</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6">
          <p className="text-green-500 text-sm">Approved</p>
          <p className="text-2xl font-bold text-white">{stats.approved}</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
          <p className="text-red-500 text-sm">Rejected</p>
          <p className="text-2xl font-bold text-white">{stats.rejected}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-xl p-4 mb-6">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by user or ID..."
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
            <option value="pending_verification">Pending Verification</option>
            <option value="approved">Approved</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value="deposit">Deposits</option>
            <option value="investment">Investments</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition text-white"
          >
            Search
          </button>
        </form>
      </div>

      {/* Proofs Table */}
      <div className="bg-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-700">
                <th className="text-left py-3 px-4 text-slate-300 font-medium">ID</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">User</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Type</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Amount</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Proof</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Date</th>
                <th className="text-center py-3 px-4 text-slate-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {proofs.length > 0 ? (
                proofs.map((proof) => (
                  <tr key={proof._id} className="border-b border-slate-700 hover:bg-slate-700/50 transition">
                    <td className="py-3 px-4 text-slate-400 text-sm font-mono">
                      {proof._id?.slice(-8).toUpperCase()}
                    </td>
                    <td className="py-3 px-4 text-white">
                      {proof.user?.fullName || proof.user?.name || 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getTypeBadge(proof.type)}`}>
                        {proof.type || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white font-semibold">
                      ${(proof.amount || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      {proof.proofImage ? (
                        <button
                          onClick={() => handleViewProof(proof._id)}
                          className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm"
                        >
                          {getFileIcon(proof.proofImage)}
                          <span>View</span>
                        </button>
                      ) : (
                        <span className="text-slate-500 text-sm">No proof</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(proof.status)}`}>
                        {proof.status || 'pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-sm">
                      {proof.createdAt ? new Date(proof.createdAt).toLocaleString() : 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center gap-1 flex-wrap">
                        <button
                          onClick={() => handleViewProof(proof._id)}
                          className="p-2 hover:bg-slate-600 rounded-lg transition"
                          title="View Details"
                        >
                          <FaEye className="text-blue-400" />
                        </button>
                        {proof.status === 'pending' || proof.status === 'pending_verification' ? (
                          <>
                            <button
                              onClick={() => handleVerifyProof(proof._id, 'approve')}
                              disabled={processing}
                              className="p-2 bg-green-500/20 rounded-lg hover:bg-green-500/30 transition disabled:opacity-50"
                              title="Approve"
                            >
                              <FaCheckCircle className="text-green-500" />
                            </button>
                            <button
                              onClick={() => handleVerifyProof(proof._id, 'reject')}
                              disabled={processing}
                              className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition disabled:opacity-50"
                              title="Reject"
                            >
                              <FaTimesCircle className="text-red-500" />
                            </button>
                          </>
                        ) : null}
                        {proof.proofImage && (
                          <button
                            onClick={() => downloadImage(
                              proof.proofImage,
                              `proof_${proof._id?.slice(-8).toUpperCase() || 'image'}.jpg`
                            )}
                            className="p-2 hover:bg-slate-600 rounded-lg transition"
                            title="Download Proof Image"
                          >
                            <FaDownload className="text-green-400" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">
                    No payment proofs found
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
              className="px-4 py-2 bg-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition text-white"
            >
              Previous
            </button>
            <span className="px-4 py-2 bg-slate-800 rounded-lg text-white">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page >= pagination.pages}
              className="px-4 py-2 bg-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition text-white"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Proof Details Modal */}
      {showProofModal && selectedProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-700 shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-white">Payment Proof Details</h2>
                <p className="text-sm text-slate-400">
                  {selectedProof.user?.fullName || selectedProof.user?.name || 'User'}
                </p>
              </div>
              <div className="flex gap-2">
                {selectedProof.proofImage && (
                  <button
                    onClick={() => downloadImage(
                      selectedProof.proofImage,
                      `proof_${selectedProof._id?.slice(-8).toUpperCase() || 'image'}.jpg`
                    )}
                    className="p-2 bg-green-600/20 rounded-lg hover:bg-green-600/30 transition"
                    title="Download Proof Image"
                  >
                    <FaDownload className="text-green-400" />
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowProofModal(false);
                    setSelectedProof(null);
                  }}
                  className="p-2 hover:bg-slate-700 rounded-lg transition"
                >
                  <FaTimes className="text-slate-400" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Proof Image */}
              {selectedProof.proofImage && (
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <p className="text-slate-400 text-sm mb-3">Proof of Payment</p>
                  <div className="flex justify-center">
                    <img
                      src={selectedProof.proofImage}
                      alt="Payment Proof"
                      className="max-h-96 rounded-lg object-contain border border-slate-600"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                      }}
                    />
                  </div>
                  <div className="flex justify-center mt-3 gap-2">
                    <a
                      href={selectedProof.proofImage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition text-white text-sm"
                    >
                      <FaDownload /> Open Full Image
                    </a>
                    <button
                      onClick={() => downloadImage(
                        selectedProof.proofImage,
                        `proof_${selectedProof._id?.slice(-8).toUpperCase() || 'image'}.jpg`
                      )}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition text-white text-sm"
                    >
                      <FaDownload /> Download Image
                    </button>
                  </div>
                </div>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <p className="text-xs text-slate-400">Transaction ID</p>
                  <p className="text-white font-mono text-sm">{selectedProof._id}</p>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <p className="text-xs text-slate-400">Reference</p>
                  <p className="text-white font-mono text-sm">{selectedProof.reference || 'N/A'}</p>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <p className="text-xs text-slate-400">Type</p>
                  <p className={`capitalize font-semibold ${getTypeBadge(selectedProof.type)}`}>
                    {selectedProof.type || 'N/A'}
                  </p>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <p className="text-xs text-slate-400">Amount</p>
                  <p className="text-white font-bold">${(selectedProof.amount || 0).toLocaleString()}</p>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <p className="text-xs text-slate-400">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedProof.status)}`}>
                    {selectedProof.status || 'pending'}
                  </span>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <p className="text-xs text-slate-400">Submitted</p>
                  <p className="text-white">{selectedProof.createdAt ? new Date(selectedProof.createdAt).toLocaleString() : 'N/A'}</p>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-lg col-span-2">
                  <p className="text-xs text-slate-400">Description</p>
                  <p className="text-white">{selectedProof.description || 'No description provided'}</p>
                </div>
                {selectedProof.rejectionReason && (
                  <div className="p-3 bg-slate-700/30 rounded-lg col-span-2">
                    <p className="text-xs text-slate-400">Rejection Reason</p>
                    <p className="text-red-400">{selectedProof.rejectionReason}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              {(selectedProof.status === 'pending' || selectedProof.status === 'pending_verification') && (
                <div className="flex gap-2 pt-4 border-t border-slate-700">
                  <button
                    onClick={() => {
                      handleVerifyProof(selectedProof._id, 'approve');
                      setTimeout(() => {
                        setShowProofModal(false);
                        setSelectedProof(null);
                      }, 500);
                    }}
                    disabled={processing}
                    className="flex-1 py-3 bg-green-600 rounded-lg hover:bg-green-700 transition text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <FaCheckCircle /> Approve Proof
                  </button>
                  <button
                    onClick={() => {
                      handleVerifyProof(selectedProof._id, 'reject');
                      setTimeout(() => {
                        setShowProofModal(false);
                        setSelectedProof(null);
                      }, 500);
                    }}
                    disabled={processing}
                    className="flex-1 py-3 bg-red-600 rounded-lg hover:bg-red-700 transition text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <FaTimesCircle /> Reject Proof
                  </button>
                </div>
              )}
              {selectedProof.status === 'approved' && (
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
                  <p className="text-green-500">✅ This payment proof has been approved.</p>
                </div>
              )}
              {selectedProof.status === 'rejected' && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
                  <p className="text-red-500">❌ This payment proof has been rejected.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentProofs;