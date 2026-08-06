import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaEnvelope, FaPhone, FaIdCard, FaCheckCircle, FaSpinner, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

// Get KYC code from environment variable
const KYC_CODE = import.meta.env.VITE_KYC_CODE || '983454';

const KYC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [kycVerified, setKycVerified] = useState(false);

  // Personal info form
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    idType: 'passport',
    idNumber: '',
    address: '',
  });

  // Modal state
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [verifying, setVerifying] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate required fields
    if (!formData.fullName || !formData.email || !formData.idNumber) {
      toast.error('Please fill in all required fields');
      return;
    }
    // Show the code modal
    setShowCodeModal(true);
  };

  const handleVerifyCode = () => {
    if (!codeInput) {
      toast.error('Please enter the verification code');
      return;
    }

    setVerifying(true);
    setTimeout(() => {
      if (codeInput === KYC_CODE) {
        setKycVerified(true);
        setShowCodeModal(false);
        toast.success('KYC verification successful!');
        // Store in localStorage so we remember
        localStorage.setItem('kyc_verified', 'true');
      } else {
        toast.error('Invalid verification code. Please try again.');
        setCodeInput('');
      }
      setVerifying(false);
    }, 1000);
  };

  // Check if already verified
  useState(() => {
    const saved = localStorage.getItem('kyc_verified');
    if (saved === 'true') {
      setKycVerified(true);
      setStep(2);
    }
  }, []);

  if (kycVerified) {
    return (
      <div className="min-h-screen bg-slate-900 pt-16 lg:pl-64 pb-20 lg:pb-0">
        <Navbar />
        <div className="p-4 sm:p-6 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 text-center border border-slate-700"
          >
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <FaCheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">KYC Verified</h2>
            <p className="text-slate-400">
              Your identity has been verified. You now have full access to all features.
            </p>
            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-green-400 text-sm">
                ✅ You can now deposit, withdraw, and invest without restrictions.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 pt-16 lg:pl-64 pb-20 lg:pb-0">
      <Navbar />
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">KYC Verification</h1>
          <p className="text-slate-400 mt-1">Complete your identity verification</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700"
        >
          <div className="mb-6 flex justify-between items-center">
            <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: step === 1 ? '50%' : '100%' }}
              />
            </div>
            <span className="ml-4 text-sm text-slate-400">{step}/2</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Full Name *</label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Email *</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Phone Number</label>
              <div className="relative">
                <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 234 567 8900"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">ID Type *</label>
              <select
                name="idType"
                value={formData.idType}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition"
              >
                <option value="passport">Passport</option>
                <option value="driver_license">Driver License</option>
                <option value="national_id">National ID</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">ID Number *</label>
              <div className="relative">
                <FaIdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleChange}
                  placeholder="AB123456"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Main St, City, Country"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              Submit for Verification
            </button>

            <p className="text-xs text-slate-500 text-center">
              * Required fields. Your information is secure and will not be shared.
            </p>
          </form>
        </motion.div>
      </div>

      {/* Code Verification Modal */}
      <AnimatePresence>
        {showCodeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-800/95 backdrop-blur-xl rounded-2xl max-w-md w-full border border-slate-700 shadow-2xl p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Enter Verification Code</h2>
                <button
                  onClick={() => setShowCodeModal(false)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition"
                >
                  <FaTimes className="text-slate-400" />
                </button>
              </div>

              <p className="text-slate-400 text-sm mb-4">
                Enter your 6 digit KYC code, if you dont have code, purchase 1 from our support team.
              </p>

              <div>
                <input
                  type="text"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white text-center text-2xl tracking-widest focus:outline-none focus:border-blue-500 transition"
                  maxLength="6"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowCodeModal(false)}
                  className="flex-1 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyCode}
                  disabled={verifying}
                  className="flex-1 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {verifying ? <FaSpinner className="animate-spin" /> : 'Verify'}
                </button>
              </div>

              <p className="text-xs text-slate-500 text-center mt-3">
                make sure your email is verified.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KYC;