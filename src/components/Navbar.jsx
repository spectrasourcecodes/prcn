import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaHome, FaChartLine, FaHandHoldingUsd, FaWallet, FaUserCircle, 
  FaSignOutAlt, FaHeadset, FaTelegram, FaWhatsapp, FaIdCard,
  FaHistory, FaGift, FaUsers, FaBell, FaShieldAlt, FaCog, FaDollarSign,
  FaComments, FaExternalLinkAlt
} from 'react-icons/fa';
import { HiMenu, HiX } from 'react-icons/hi';
import Modal from 'react-modal';
import GoogleTranslate from './GoogleTranslate';
import { SITE_NAME, ADMIN_WHATSAPP, ADMIN_TELEGRAM } from '../data/mockData';
import API from '../utils/axios';
import { useAuth } from '../auth/userAuth';
import { getCurrencySymbol } from '../utils/currency';

Modal.setAppElement('#root');

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: '400px',
    border: 'none',
    borderRadius: '16px',
    padding: '0',
    background: 'transparent',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
    overflow: 'hidden'
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(8px)',
    zIndex: 1000
  }
};

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [wallet, setWallet] = useState({ totalBalance: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const response = await API.get('/wallet');
      if (response.data.success) {
        const data = response.data.data || response.data.wallet;
        setWallet({
          totalBalance: data.balance || data.totalBalance || 0,
          balance: data.balance || 0,
        });
      } else {
        console.warn('Failed to fetch wallet:', response.data.message);
      }
    } catch (error) {
      console.error('Wallet fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: FaChartLine },
    { path: '/withdraw', label: 'Withdraw', icon: FaWallet },
    { path: '/transactions', label: 'Transactions', icon: FaHistory },
    { path: '/plans', label: 'Invest Plans', icon: FaDollarSign },
    { path: '/notifications', label: 'Notifications', icon: FaBell },
    { path: '/kyc', label: 'Kyc Verification', icon: FaIdCard },
    { path: '/referrals', label: 'Referrals', icon: FaUsers },
    { path: '/profile', label: 'Profile', icon: FaUserCircle },
    { path: '/security', label: 'Security', icon: FaShieldAlt },
  ];

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLogoutModalOpen(false);
    navigate('/');
    window.location.reload();
  };

  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // ✅ Use shared currency symbol function
  const currencySymbol = getCurrencySymbol(user?.currency);

  const displayBalance = loading ? '...' : `${currencySymbol}${wallet.totalBalance?.toLocaleString() || '0.00'}`;

  const openLiveChat = () => {
    window.open('https://chat-support1.onrender.com', '_blank', 'width=400,height=600,scrollbars=yes');
  };

  return (
    <>
      {/* Top Bar – fixed height */}
      <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-800 to-indigo-900 shadow-lg z-40 h-16 flex items-center">
        <div className="container mx-auto px-3 sm:px-4 flex items-center justify-between w-full">
          {/* Left section - Hamburger + Logo */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-white p-2 hover:bg-white/10 rounded-lg transition"
            >
              {isMobileMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
            </button>
            
            <Link to="/" className="flex items-center min-w-[120px]">
              <h2 className="text-lg sm:text-xl font-bold text-white">{SITE_NAME}</h2>
            </Link>
          </div>
          
          {/* Right section */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={() => setIsSupportOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg flex items-center transition text-sm"
            >
              <FaHeadset className="mr-1 sm:mr-2 text-sm sm:text-base" />
              <span className="hidden xs:inline">Support</span>
            </button>
            <GoogleTranslate />
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-16 bottom-0 w-64 bg-slate-900 border-r border-slate-800 overflow-y-auto z-30">
        <div className="p-4">
          <div className="mb-8 p-4 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl">
            <p className="text-slate-400 text-sm">Total Balance</p>
            <p className="text-2xl font-bold text-white">{displayBalance}</p>
          </div>
          
          <nav className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive(link.path)
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/20 transition-all duration-200"
            >
              <FaSignOutAlt size={18} />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 lg:hidden pt-16">
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-4 right-4 text-white p-2"
          >
            <HiX size={26} />
          </button>

          <div className="flex flex-col h-[calc(100vh-4rem)] px-4 py-4">
            <nav className="flex-1 space-y-1 mt-2">
              {navLinks
                .filter(link => link.path !== "/")
                .map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                        isActive(link.path)
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <Icon size={18} />
                      <span className="font-medium">{link.label}</span>
                    </Link>
                  );
                })}
            </nav>

            <div className="pt-3 border-t border-slate-700">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/20 transition-all duration-200"
              >
                <FaSignOutAlt size={18} />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 flex justify-around py-2 z-50 lg:hidden h-16">
        <Link to="/dashboard" className="flex flex-col items-center justify-center p-2">
          <FaChartLine className="text-lg text-slate-400" />
          <span className="text-xs mt-1 text-slate-400">Dashboard</span>
        </Link>
        <Link to="/plans" className="flex flex-col items-center justify-center p-2">
          <FaHandHoldingUsd className="text-lg text-slate-400" />
          <span className="text-xs mt-1 text-slate-400">Invest</span>
        </Link>
        <Link to="/withdraw" className="flex flex-col items-center justify-center p-2">
          <FaWallet className="text-lg text-slate-400" />
          <span className="text-xs mt-1 text-slate-400">Withdraw</span>
        </Link>
        <Link to="/transactions" className="flex flex-col items-center justify-center p-2">
          <FaHistory className="text-lg text-slate-400" />
          <span className="text-xs mt-1 text-slate-400">History</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center justify-center p-2">
          <FaUserCircle className="text-lg text-slate-400" />
          <span className="text-xs mt-1 text-slate-400">Profile</span>
        </Link>
      </nav>

      {/* Logout Modal */}
      <Modal
        isOpen={isLogoutModalOpen}
        style={customStyles}
        onRequestClose={() => setIsLogoutModalOpen(false)}
        contentLabel="Logout Confirmation"
      >
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl text-white">
          <h3 className="text-xl font-bold mb-4 text-center">Logout Confirmation</h3>
          <p className="mb-6 text-slate-300 text-center">Are you sure you want to logout?</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setIsLogoutModalOpen(false)}
              className="bg-slate-600 hover:bg-slate-500 py-2 px-6 rounded-lg transition duration-300"
            >
              Cancel
            </button>
            <button
              onClick={confirmLogout}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 py-2 px-6 rounded-lg transition duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      </Modal>

      {/* Support Modal */}
      <Modal
        isOpen={isSupportOpen}
        style={customStyles}
        onRequestClose={() => setIsSupportOpen(false)}
        contentLabel="Support Options"
      >
        <div className="bg-gradient-to-br from-blue-900 to-indigo-900 p-6 rounded-xl text-white">
          <h3 className="text-xl font-bold mb-6 text-center">Customer Support</h3>
          
          <div className="space-y-4 mb-6">
            <button
              onClick={openLiveChat}
              className="w-full flex items-center p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg group"
            >
              <div className="bg-white/20 p-3 rounded-full mr-4 group-hover:scale-110 transition">
                <FaComments className="text-2xl" />
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-semibold">Live Chat</h4>
                <p className="text-sm text-white/80">Chat with support instantly</p>
              </div>
              <FaExternalLinkAlt className="text-white/60 text-sm" />
            </button>

            <a 
              href={ADMIN_TELEGRAM} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center p-4 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl hover:from-teal-700 hover:to-cyan-700 transition-all duration-300 shadow-lg"
            >
              <div className="bg-white/20 p-3 rounded-full mr-4">
                <FaTelegram className="text-2xl" />
              </div>
              <div>
                <h4 className="font-semibold">Telegram</h4>
                <p className="text-sm text-white/80">@support</p>
              </div>
            </a>
            
            <a 
              href={`https://wa.me/${ADMIN_WHATSAPP}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center p-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg"
            >
              <div className="bg-white/20 p-3 rounded-full mr-4">
                <FaWhatsapp className="text-2xl" />
              </div>
              <div>
                <h4 className="font-semibold">WhatsApp</h4>
                <p className="text-sm text-white/80">{ADMIN_WHATSAPP}</p>
              </div>
            </a>
          </div>
          
          <button
            onClick={() => setIsSupportOpen(false)}
            className="w-full py-3 px-4 rounded-lg font-medium bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 transition duration-300"
          >
            Close
          </button>
        </div>
      </Modal>
    </>
  );
};

export default Navbar;