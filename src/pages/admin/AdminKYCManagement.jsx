import { useState, useEffect } from "react";
import {
  FaSearch,
  FaEye,
  FaCheck,
  FaTimes,
  FaSpinner,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCalendar,
  FaIdCard,
  FaMapMarkerAlt,
  FaBriefcase,
  FaFileImage,
  FaExclamationTriangle,
} from "react-icons/fa";
import toast from "react-hot-toast";
import { adminKycService } from "../../services/adminKycService";

const AdminKYCManagement = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  // Modal states
  const [selectedKYC, setSelectedKYC] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, [pagination.page, statusFilter]);

  const fetchSubmissions = async (search = searchTerm) => {
    try {
      setLoading(true);
      const response = await adminKycService.getSubmissions({
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter === "all" ? undefined : statusFilter,
        search: search || undefined,
      });
      if (response.success) {
        setSubmissions(response.data);
        setPagination(response.pagination);
      } else {
        toast.error(response.message || "Failed to load submissions");
      }
    } catch (error) {
      console.error("Fetch KYC error:", error);
      toast.error(error.response?.data?.message || "Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchSubmissions(searchTerm);
  };

  const handleViewDetails = (kyc) => {
    setSelectedKYC(kyc);
    setShowDetailModal(true);
  };

  const handleApprove = async (id) => {
    if (!window.confirm("Are you sure you want to approve this KYC?")) return;
    setActionLoading(true);
    try {
      const response = await adminKycService.approveKYC(id);
      if (response.success) {
        toast.success("KYC approved successfully");
        // Update the list
        setSubmissions((prev) =>
          prev.map((item) =>
            item._id === id ? { ...item, status: "verified" } : item
          )
        );
        // Also update selected if modal is open
        if (selectedKYC?._id === id) {
          setSelectedKYC((prev) => ({ ...prev, status: "verified" }));
        }
      } else {
        toast.error(response.message || "Failed to approve KYC");
      }
    } catch (error) {
      console.error("Approve error:", error);
      toast.error(error.response?.data?.message || "Failed to approve KYC");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedKYC) return;
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    setActionLoading(true);
    try {
      const response = await adminKycService.rejectKYC(
        selectedKYC._id,
        rejectReason
      );
      if (response.success) {
        toast.success("KYC rejected");
        // Update the list
        setSubmissions((prev) =>
          prev.map((item) =>
            item._id === selectedKYC._id
              ? { ...item, status: "rejected", rejectionReason: rejectReason }
              : item
          )
        );
        setSelectedKYC((prev) => ({
          ...prev,
          status: "rejected",
          rejectionReason: rejectReason,
        }));
        setShowRejectModal(false);
        setRejectReason("");
      } else {
        toast.error(response.message || "Failed to reject KYC");
      }
    } catch (error) {
      console.error("Reject error:", error);
      toast.error(error.response?.data?.message || "Failed to reject KYC");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { color: "bg-yellow-500/20 text-yellow-500", label: "Pending" },
      verified: { color: "bg-green-500/20 text-green-500", label: "Verified" },
      rejected: { color: "bg-red-500/20 text-red-500", label: "Rejected" },
    };
    const info = config[status] || config.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${info.color}`}>
        {info.label}
      </span>
    );
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading && submissions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading KYC submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">KYC Management</h1>
        <p className="text-slate-400 mt-1">Review and manage user identity verifications</p>
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
              onKeyDown={(e) => e.key === "Enter" && handleSearch(e)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition text-white"
          >
            Search
          </button>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-700">
                <th className="text-left py-3 px-4 text-slate-300 font-medium">User</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Email</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Submitted</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Status</th>
                <th className="text-center py-3 px-4 text-slate-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length > 0 ? (
                submissions.map((kyc) => (
                  <tr key={kyc._id} className="border-b border-slate-700 hover:bg-slate-700/50 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <FaUser className="text-slate-400" />
                        <span className="font-semibold text-white">
                          {kyc.user?.fullName || kyc.user?.name || "Unknown"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{kyc.user?.email || "N/A"}</td>
                    <td className="py-3 px-4 text-slate-400">{formatDate(kyc.createdAt)}</td>
                    <td className="py-3 px-4">{getStatusBadge(kyc.status)}</td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleViewDetails(kyc)}
                          className="p-2 hover:bg-slate-600 rounded-lg transition"
                          title="View Details"
                        >
                          <FaEye className="text-blue-400" />
                        </button>
                        {kyc.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(kyc._id)}
                              disabled={actionLoading}
                              className="p-2 hover:bg-green-500/20 rounded-lg transition"
                              title="Approve"
                            >
                              <FaCheck className="text-green-500" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedKYC(kyc);
                                setShowRejectModal(true);
                              }}
                              disabled={actionLoading}
                              className="p-2 hover:bg-red-500/20 rounded-lg transition"
                              title="Reject"
                            >
                              <FaTimes className="text-red-500" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400">
                    No KYC submissions found
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
              Showing {submissions.length} of {pagination.total} submissions
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page <= 1}
                className="px-3 py-1 bg-slate-700 rounded-lg text-white disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-slate-400">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= pagination.pages}
                className="px-3 py-1 bg-slate-700 rounded-lg text-white disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedKYC && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-700 shadow-2xl">
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-white">KYC Details</h2>
                <p className="text-sm text-slate-400">
                  {selectedKYC.user?.fullName || "User"} • {selectedKYC.user?.email || "No email"}
                </p>
                <div className="mt-1">{getStatusBadge(selectedKYC.status)}</div>
              </div>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedKYC(null);
                }}
                className="p-2 hover:bg-slate-700 rounded-lg transition"
              >
                <FaTimes className="text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <FaUser className="text-blue-400" />
                  Personal Information
                </h3>
                <div className="bg-slate-700/30 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-400">Full Name:</span>
                    <span className="text-white ml-2">
                      {selectedKYC.personalInfo?.fullName || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Email:</span>
                    <span className="text-white ml-2">
                      {selectedKYC.user?.email || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Phone:</span>
                    <span className="text-white ml-2">
                      {selectedKYC.user?.phone || selectedKYC.personalInfo?.phone || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Date of Birth:</span>
                    <span className="text-white ml-2">
                      {selectedKYC.personalInfo?.dateOfBirth
                        ? formatDate(selectedKYC.personalInfo.dateOfBirth)
                        : "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Gender:</span>
                    <span className="text-white ml-2">
                      {selectedKYC.personalInfo?.gender || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Nationality:</span>
                    <span className="text-white ml-2">
                      {selectedKYC.personalInfo?.nationality || "N/A"}
                    </span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-slate-400">Address:</span>
                    <span className="text-white ml-2">
                      {selectedKYC.personalInfo?.address || "N/A"}
                    </span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-slate-400">Occupation:</span>
                    <span className="text-white ml-2">
                      {selectedKYC.personalInfo?.occupation || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Government ID */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <FaIdCard className="text-blue-400" />
                  Government ID
                </h3>
                <div className="bg-slate-700/30 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-400">ID Type:</span>
                    <span className="text-white ml-2">
                      {selectedKYC.governmentId?.type || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">ID Number:</span>
                    <span className="text-white ml-2">
                      {selectedKYC.governmentId?.idNumber || "N/A"}
                    </span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-slate-400">Front Image:</span>
                    {selectedKYC.governmentId?.frontImage ? (
                      <a
                        href={selectedKYC.governmentId.frontImage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline ml-2"
                      >
                        <FaFileImage className="inline mr-1" /> View
                      </a>
                    ) : (
                      <span className="text-white ml-2">N/A</span>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-slate-400">Back Image:</span>
                    {selectedKYC.governmentId?.backImage ? (
                      <a
                        href={selectedKYC.governmentId.backImage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline ml-2"
                      >
                        <FaFileImage className="inline mr-1" /> View
                      </a>
                    ) : (
                      <span className="text-white ml-2">N/A</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Selfie & Proof of Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <FaUser className="text-blue-400" />
                    Selfie
                  </h3>
                  <div className="bg-slate-700/30 rounded-lg p-4 text-sm">
                    {selectedKYC.selfieImage ? (
                      <a
                        href={selectedKYC.selfieImage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        <FaFileImage className="inline mr-1" /> View Selfie
                      </a>
                    ) : (
                      <span className="text-slate-400">No selfie uploaded</span>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-blue-400" />
                    Proof of Address
                  </h3>
                  <div className="bg-slate-700/30 rounded-lg p-4 text-sm">
                    {selectedKYC.proofOfAddress ? (
                      <a
                        href={selectedKYC.proofOfAddress}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        <FaFileImage className="inline mr-1" /> View Document
                      </a>
                    ) : (
                      <span className="text-slate-400">No document uploaded</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Rejection Reason (if rejected) */}
              {selectedKYC.status === "rejected" && selectedKYC.rejectionReason && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <h4 className="text-red-400 font-semibold flex items-center gap-2">
                    <FaExclamationTriangle /> Rejection Reason
                  </h4>
                  <p className="text-red-300 text-sm mt-1">{selectedKYC.rejectionReason}</p>
                </div>
              )}

              {/* Meta Info */}
              <div className="bg-slate-700/30 rounded-lg p-4 text-xs text-slate-400 space-y-1">
                <div>
                  <span>Submitted: </span>
                  <span className="text-white">{formatDateTime(selectedKYC.createdAt)}</span>
                </div>
                {selectedKYC.verifiedAt && (
                  <div>
                    <span>Verified on: </span>
                    <span className="text-white">{formatDateTime(selectedKYC.verifiedAt)}</span>
                  </div>
                )}
                {selectedKYC.verifiedBy && (
                  <div>
                    <span>Verified by: </span>
                    <span className="text-white">{selectedKYC.verifiedBy?.fullName || "Admin"}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons (if pending) */}
              {selectedKYC.status === "pending" && (
                <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-700">
                  <button
                    onClick={() => handleApprove(selectedKYC._id)}
                    disabled={actionLoading}
                    className="flex-1 min-w-[120px] py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {actionLoading ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setShowRejectModal(true);
                      setShowDetailModal(false);
                    }}
                    disabled={actionLoading}
                    className="flex-1 min-w-[120px] py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {actionLoading ? <FaSpinner className="animate-spin" /> : <FaTimes />}
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedKYC && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl max-w-md w-full border border-slate-700 shadow-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Reject KYC</h3>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                }}
                className="p-2 hover:bg-slate-700 rounded-lg transition"
              >
                <FaTimes className="text-slate-400" />
              </button>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              Please provide a reason for rejecting this KYC submission.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none h-24"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                }}
                className="flex-1 py-2 bg-slate-600 rounded-lg hover:bg-slate-500 transition text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="flex-1 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {actionLoading ? <FaSpinner className="animate-spin" /> : <FaTimes />}
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminKYCManagement;