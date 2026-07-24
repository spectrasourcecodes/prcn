import { useState, useEffect } from 'react';
import { FaBell, FaMoon, FaLanguage, FaGlobe, FaSave, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { useAuth } from '../auth/userAuth';
import API from '../utils/axios';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsAlerts: false,
    darkMode: false,
    language: 'en',
    currency: 'USD',
    twoFactor: false,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // Fetch user profile which contains settings
      const response = await API.get('/users/profile');
      if (response.data.success) {
        const data = response.data.data;
        const userSettings = data.settings || {};
        setSettings({
          emailNotifications: userSettings.emailNotifications ?? true,
          pushNotifications: userSettings.pushNotifications ?? true,
          smsAlerts: userSettings.smsAlerts ?? false,
          darkMode: userSettings.darkMode ?? false,
          language: userSettings.language || 'en',
          currency: data.currency || 'USD',
          twoFactor: userSettings.twoFactor || false,
        });
      }
    } catch (error) {
      console.error('Settings fetch error:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await API.put('/users/profile', {
        currency: settings.currency,
        settings: {
          emailNotifications: settings.emailNotifications,
          pushNotifications: settings.pushNotifications,
          smsAlerts: settings.smsAlerts,
          darkMode: settings.darkMode,
          language: settings.language,
          twoFactor: settings.twoFactor,
        },
      });
      if (response.data.success) {
        toast.success('Settings saved successfully!');
        // Update user context if currency changed
        if (settings.currency !== user?.currency) {
          updateUser({ currency: settings.currency });
        }
        // Also update theme
        if (settings.darkMode !== user?.settings?.darkMode) {
          // Theme will be applied globally (if needed)
        }
      }
    } catch (error) {
      console.error('Settings save error:', error);
      toast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 pt-16 lg:pl-64 pb-20 lg:pb-0">
        <Navbar />
        <main className="p-4 sm:p-6">
          <div className="flex items-center justify-center h-64">
            <FaSpinner className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Loading settings...</p>
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
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Settings</h1>
          <p className="text-slate-400 mt-1">Manage your account preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
          {/* Notification Settings */}
          <div className="bg-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FaBell className="text-blue-400" />
              Notification Preferences
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white font-medium">Email Notifications</p>
                  <p className="text-xs text-slate-400">Receive updates via email</p>
                </div>
                <button
                  onClick={() => handleToggle('emailNotifications')}
                  className={`w-12 h-6 rounded-full transition ${
                    settings.emailNotifications ? 'bg-blue-600' : 'bg-slate-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform transform ${
                    settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white font-medium">Push Notifications</p>
                  <p className="text-xs text-slate-400">Browser push notifications</p>
                </div>
                <button
                  onClick={() => handleToggle('pushNotifications')}
                  className={`w-12 h-6 rounded-full transition ${
                    settings.pushNotifications ? 'bg-blue-600' : 'bg-slate-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform transform ${
                    settings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white font-medium">SMS Alerts</p>
                  <p className="text-xs text-slate-400">Receive SMS for important events</p>
                </div>
                <button
                  onClick={() => handleToggle('smsAlerts')}
                  className={`w-12 h-6 rounded-full transition ${
                    settings.smsAlerts ? 'bg-blue-600' : 'bg-slate-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform transform ${
                    settings.smsAlerts ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Appearance Settings */}
          <div className="bg-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FaMoon className="text-blue-400" />
              Appearance
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white font-medium">Dark Mode</p>
                  <p className="text-xs text-slate-400">Switch between light and dark theme</p>
                </div>
                <button
                  onClick={() => handleToggle('darkMode')}
                  className={`w-12 h-6 rounded-full transition ${
                    settings.darkMode ? 'bg-blue-600' : 'bg-slate-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform transform ${
                    settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Language & Currency */}
          <div className="bg-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FaLanguage className="text-blue-400" />
              Language & Currency
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2">Language</label>
                <select
                  name="language"
                  value={settings.language}
                  onChange={handleChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="zh">中文</option>
                  <option value="pt">Português</option>
                  <option value="ar">العربية</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-2">Currency</label>
                <select
                  name="currency"
                  value={settings.currency}
                  onChange={handleChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                  <option value="NGN">NGN - Nigerian Naira</option>
                  <option value="BRL">BRL - Brazilian Real</option>
                  <option value="INR">INR - Indian Rupee</option>
                </select>
              </div>
            </div>
          </div>

          {/* Security Preferences */}
          <div className="bg-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FaGlobe className="text-blue-400" />
              Security Preferences
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white font-medium">Two-Factor Authentication</p>
                  <p className="text-xs text-slate-400">Add extra security to your account</p>
                </div>
                <button
                  onClick={() => handleToggle('twoFactor')}
                  className={`w-12 h-6 rounded-full transition ${
                    settings.twoFactor ? 'bg-blue-600' : 'bg-slate-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform transform ${
                    settings.twoFactor ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 max-w-5xl">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
            {saving ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>
      </main>
    </div>
  );
};

export default Settings;