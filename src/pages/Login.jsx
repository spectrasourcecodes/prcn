import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowRight } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { SITE_NAME } from '../data/mockData';
import { useAuth } from '../auth/userAuth';

const Login = () => {
  const navigate = useNavigate();
  const { login, loading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    const result = await login(formData.email, formData.password);
    setLoading(false);

    if (result.success) {
      navigate("/dashboard");
    } else {
      toast.error(result.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* ... background blobs ... */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-lighten filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500 rounded-full mix-blend-lighten filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-slate-700">
          {/* ... same content ... */}
          <div className="text-center mb-8">
            <Link to="/">
              <h1 className="text-3xl font-bold gradient-text">{SITE_NAME}</h1>
            </Link>
            <p className="text-slate-400 mt-2">Welcome back! Please login to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ... email and password fields ... */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Email Address</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="demo@example.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-12 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-slate-400">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300 transition">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading || authLoading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading || authLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Login <FaArrowRight />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold transition">
                Sign Up
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-xs text-center text-slate-500">
              Demo credentials: demo@example.com / password123
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;