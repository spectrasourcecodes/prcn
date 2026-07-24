import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaArrowLeft, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import API from '../utils/axios';
import { SITE_NAME } from '../data/mockData';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload

    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await API.post('/auth/forgot-password', { email });
      if (response.data.success) {
        setSent(true);
        toast.success('Password reset link sent to your email');
      } else {
        toast.error(response.data.message || 'Failed to send reset link');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      const message = error.response?.data?.message || 'Failed to send reset link. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-lighten filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500 rounded-full mix-blend-lighten filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative z-10 w-full max-w-md">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-slate-700 text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <FaCheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
            <p className="text-slate-400 mb-6">
              We've sent a password reset link to <strong className="text-white">{email}</strong>
            </p>
            <p className="text-sm text-slate-500 mb-6">
              Didn't receive the email? Check your spam folder or try again.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition"
            >
              <FaArrowLeft /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-lighten filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500 rounded-full mix-blend-lighten filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-slate-700">
          <div className="text-center mb-8">
            <Link to="/">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {SITE_NAME}
              </h1>
            </Link>
            <p className="text-slate-400 mt-2">Reset your password</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Email Address</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                  required
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Enter the email address associated with your account.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-blue-400 hover:text-blue-300 transition inline-flex items-center gap-2">
              <FaArrowLeft className="text-sm" /> Back to Login
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-xs text-center text-slate-500">
              Remember your password?{' '}
              <Link to="/login" className="text-blue-400 hover:text-blue-300">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;