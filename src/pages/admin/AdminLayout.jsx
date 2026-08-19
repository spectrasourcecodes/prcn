import { useState } from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { 
  FaTachometerAlt, FaUsers, FaMoneyBillWave, FaHandHoldingUsd, 
  FaChartLine, FaCog, FaSignOutAlt, FaBars, FaTimes,
  FaBell, FaEnvelope, FaUserShield, FaWallet, FaGift,
  FaImage
} from 'react-icons/fa';
import toast from 'react-hot-toast'; // ✅ Added missing import
import { SITE_NAME } from '../../data/mockData';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/admin/login');
    toast.success('Logged out successfully');
  };

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: FaTachometerAlt },
    { path: '/admin/users', label: 'User Management', icon: FaUsers },
    { path: '/admin/wallets', label: 'Wallet Management', icon: FaWallet },
    { path: '/admin/transactions', label: 'Transactions', icon: FaWallet },
    { path: '/admin/admin-wallets', label: 'Admin Wallets', icon: FaWallet },
    { path: '/admin/payment-proofs', label: 'Proofs', icon: FaImage },
    { path: '/admin/profile', label: 'Profile', icon: FaUserShield },
    // External link – opens in new tab
    { path: 'https://chat-support1.onrender.com/admin', label: 'Live Chat', icon: FaEnvelope, external: true },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 w-64 h-full bg-slate-800 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <FaUserShield className="text-2xl text-red-500" />
            <h2 className="text-lg font-bold text-white">{SITE_NAME}</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">Admin Panel</p>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            // If external link, render as anchor tag
            if (item.external) {
              return (
                <a
                  key={item.path}
                  href={item.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-200"
                >
                  <Icon className="text-lg" />
                  <span>{item.label}</span>
                </a>
              );
            }
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-200"
              >
                <Icon className="text-lg" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/20 transition-all duration-200 mt-4"
          >
            <FaSignOutAlt className="text-lg" />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 rounded-lg"
      >
        {sidebarOpen ? <FaTimes className="text-white" /> : <FaBars className="text-white" />}
      </button>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Admin Header */}
        <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40">
          <div className="px-6 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-white hidden lg:block">Admin Dashboard</h1>
            <div className="flex items-center gap-4 ml-auto">
              <button className="p-2 hover:bg-slate-700 rounded-lg transition relative">
                <FaBell className="text-slate-400" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 hover:bg-slate-700 rounded-lg transition">
                <FaEnvelope className="text-slate-400" />
              </button>
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-slate-700">
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">Admin User</p>
                  <p className="text-xs text-slate-400">Super Admin</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center">
                  <FaUserShield className="text-white" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;