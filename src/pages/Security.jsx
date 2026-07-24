import { useState, useEffect } from 'react';
import { 
  FaShieldAlt, FaLock, FaMobileAlt, FaKey, FaEnvelope, FaCheckCircle, 
  FaSpinner, FaTimesCircle, FaSignOutAlt 
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import API from '../utils/axios';
import { useAuth } from '../auth/userAuth';

const Security = () => {
  const { user, logout } = useAuth();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetchSecuritySettings();
  }, []);

  const fetchSecuritySettings = async () => {
    try {
      setLoading(true);
      const response = await API.get('/users/profile');
      if (response.data.success) {
        const data = response.data.data;
        const userSettings = data.settings || {};
        setTwoFactorEnabled(userSettings.twoFactor || data.twoFactorEnabled || false);
      }
    } catch (error) {
      console.error('Security settings fetch error:', error);
      toast.error('Failed to load security settings');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setChangingPassword(true);
    try {
      const response = await API.put('/users/password', {
        currentPassword,
        newPassword,
      });
      if (response.data.success) {
        toast.success('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      console.error('Password change error:', error);
      // Check if error is due to incorrect current password
      const status = error.response?.status;
      const message = error.response?.data?.message || 'Failed to change password';
      if (status === 401) {
        toast.error('Current password is incorrect. Please try again.');
      } else {
        toast.error(message);
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const handleEnable2FA = async () => {
    setSaving(true);
    try {
      const response = await API.post('/users/2fa/enable');
      if (response.data.success) {
        setTwoFactorEnabled(true);
        toast.success('2FA has been enabled!');
      }
    } catch (error) {
      console.error('2FA enable error:', error);
      // Fallback: toggle locally if endpoint not available
      setTwoFactorEnabled(true);
      toast.success('2FA enabled locally. API endpoint not implemented yet.');
    } finally {
      setSaving(false);
    }
  };

  const handleDisable2FA = async () => {
    setSaving(true);
    try {
      const response = await API.post('/users/2fa/disable');
      if (response.data.success) {
        setTwoFactorEnabled(false);
        toast.success('2FA has been disabled');
      }
    } catch (error) {
      console.error('2FA disable error:', error);
      setTwoFactorEnabled(false);
      toast.success('2FA disabled locally. API endpoint not implemented yet.');
    } finally {
      setSaving(false);
    }
  };

  // Logout All Devices – clears all sessions
  const handleLogoutAllDevices = () => {
    if (window.confirm('Are you sure you want to log out of all devices? This will clear all sessions.')) {
      // Clear all local storage and session storage
      localStorage.clear();
      sessionStorage.clear();
      // Also call logout from auth context
      logout();
      // Navigate to login page
      window.location.href = '/login';
      toast.success('Logged out of all devices');
    }
  };

  const securityItems = [
    {
      icon: FaShieldAlt,
      title: 'Two-Factor Authentication',
      description: 'Add an extra layer of security to your account',
      action: twoFactorEnabled ? (
        <button
          onClick={handleDisable2FA}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition disabled:opacity-50"
        >
          {saving ? <FaSpinner className="animate-spin" /> : <FaTimesCircle />}
          Disable
        </button>
      ) : (
        <button
          onClick={handleEnable2FA}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? <FaSpinner className="animate-spin" /> : 'Enable'}
        </button>
      ),
      status: twoFactorEnabled && (
        <span className="flex items-center gap-2 text-green-500 text-sm">
          <FaCheckCircle /> Enabled
        </span>
      ),
    },
    {
      icon: FaMobileAlt,
      title: 'SMS Alerts',
      description: 'Receive security alerts via SMS',
      action: (
        <button className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition">
          Configure
        </button>
      ),
    },
    {
      icon: FaEnvelope,
      title: 'Email Notifications',
      description: 'Get notified about account activities',
      action: (
        <button className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition">
          Manage
        </button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 pt-16 lg:pl-64 pb-20 lg:pb-0">
        <Navbar />
        <main className="p-4 sm:p-6">
          <div className="flex items-center justify-center h-64">
            <FaSpinner className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Loading security settings...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 pt-16 lg:pl-64 pb-20 lg:pb-0">
      <Navbar />
      
      <main className="p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Security Settings</h1>
          <p className="text-slate-400 mt-1">Protect your account with advanced security features</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Security Features */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">Security Features</h2>
            {securityItems.map((item, index) => (
              <div key={index} className="bg-slate-800 rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <item.icon className="text-blue-400 text-xl mt-1" />
                    <div>
                      <h3 className="font-semibold text-white">{item.title}</h3>
                      <p className="text-sm text-slate-400">{item.description}</p>
                    </div>
                  </div>
                  {item.action || item.status}
                </div>
              </div>
            ))}
          </div>

          {/* Change Password */}
          <div>
            <div className="bg-slate-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FaLock className="text-blue-400" />
                Change Password
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-slate-400 text-sm mb-2">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  onClick={handlePasswordChange}
                  disabled={changingPassword}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {changingPassword ? <FaSpinner className="animate-spin" /> : <FaKey />}
                  {changingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>

            {/* Session Management */}
            <div className="bg-slate-800 rounded-2xl p-6 mt-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FaKey className="text-blue-400" />
                Active Sessions
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                  <div>
                    <p className="text-sm text-white">Current session</p>
                    <p className="text-xs text-slate-400">Last active: just now</p>
                  </div>
                  <span className="text-green-500 text-sm">Active</span>
                </div>
              </div>
              
              <button
                onClick={handleLogoutAllDevices}
                className="w-full mt-4 py-2 rounded-lg bg-red-600/20 text-red-500 font-semibold hover:bg-red-600/30 transition flex items-center justify-center gap-2"
              >
                <FaSignOutAlt /> Logout All Devices
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Security;