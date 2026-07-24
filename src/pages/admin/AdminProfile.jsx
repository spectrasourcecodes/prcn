import { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaCamera, FaSave, FaShieldAlt, FaHistory, FaSpinner, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import API from '../../utils/axios';
import { useAuth } from '../../auth/userAuth';

const AdminProfile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'Admin',
    avatar: 'https://i.pravatar.cc/150?img=1',
    lastLogin: '',
    twoFactorEnabled: false,
    emailNotifications: true,
    isVerified: false,
  });

  const [formData, setFormData] = useState(profile);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [activityLog, setActivityLog] = useState([]);

  useEffect(() => {
    fetchProfile();
    fetchActivityLog();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await API.get('/users/profile');
      if (response.data.success) {
        const data = response.data.data;
        setProfile({
          fullName: data.fullName || data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          role: data.role === 'admin' ? 'Super Administrator' : 'Administrator',
          avatar: data.profileImage || 'https://i.pravatar.cc/150?img=1',
          lastLogin: data.lastLogin ? new Date(data.lastLogin).toLocaleString() : 'N/A',
          twoFactorEnabled: data.twoFactorEnabled || false,
          emailNotifications: data.settings?.emailNotifications !== undefined ? data.settings.emailNotifications : true,
          isVerified: data.isVerified || false,
        });
        setFormData({
          fullName: data.fullName || data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          avatar: data.profileImage || 'https://i.pravatar.cc/150?img=1',
        });
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityLog = async () => {
    try {
      const response = await API.get('/admin/audit-logs', { params: { limit: 10 } });
      if (response.data.success) {
        setActivityLog(response.data.data);
      }
    } catch (error) {
      console.error('Activity log fetch error:', error);
      // Fallback to empty array
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setUpdating(true);
    try {
      const response = await API.put('/users/profile', {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        settings: {
          emailNotifications: profile.emailNotifications,
        },
      });
      if (response.data.success) {
        setProfile({
          ...profile,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
        });
        // Update user context
        if (updateUser) {
          updateUser({
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
          });
        }
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleNotification = async () => {
    const newValue = !profile.emailNotifications;
    setProfile({ ...profile, emailNotifications: newValue });
    try {
      await API.put('/users/profile', {
        settings: { emailNotifications: newValue },
      });
    } catch (error) {
      console.error('Toggle notification error:', error);
      // Revert on error
      setProfile({ ...profile, emailNotifications: !newValue });
      toast.error('Failed to update notification preference');
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Please fill all fields');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setChangingPassword(true);
    try {
      const response = await API.put('/users/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      if (response.data.success) {
        toast.success('Password changed successfully!');
        setShowPasswordModal(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const getStatusText = (status) => {
    return status === 'success' ? 'Success' : 'Failed';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Admin Profile</h1>
        <p className="text-slate-400 mt-1">Manage your account settings and security</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800 rounded-2xl p-6 text-center sticky top-6">
            <div className="relative inline-block">
              <img
                src={profile.avatar}
                alt={profile.fullName || 'Admin'}
                className="w-32 h-32 rounded-full mx-auto border-4 border-red-500 object-cover"
              />
              <button className="absolute bottom-0 right-0 bg-red-600 p-2 rounded-full hover:bg-red-700 transition">
                <FaCamera className="text-white text-sm" />
              </button>
            </div>
            <h2 className="text-xl font-bold text-white mt-4">{profile.fullName || 'Admin User'}</h2>
            <p className="text-red-400 text-sm mt-1">{profile.role}</p>
            <div className="mt-4 flex justify-center gap-2">
              {profile.twoFactorEnabled && (
                <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded-lg text-xs">2FA Enabled</span>
              )}
              {profile.isVerified && (
                <span className="px-2 py-1 bg-blue-500/20 text-blue-500 rounded-lg text-xs">Verified</span>
              )}
            </div>
            <div className="mt-6 pt-6 border-t border-slate-700">
              <div className="text-left space-y-2 text-sm">
                <p className="text-slate-400">Last Login:</p>
                <p className="text-white">{profile.lastLogin || 'N/A'}</p>
              </div>
            </div>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full mt-6 py-2 bg-slate-700 rounded-lg text-white hover:bg-slate-600 transition flex items-center justify-center gap-2"
            >
              <FaLock className="text-sm" /> Change Password
            </button>
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Personal Information</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition text-white"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-slate-600 rounded-lg hover:bg-slate-700 transition text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={updating}
                    className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition flex items-center gap-2 text-white disabled:opacity-50"
                  >
                    {updating ? <FaSpinner className="animate-spin" /> : <FaSave />}
                    {updating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                <FaUser className="text-red-400" />
                <div className="flex-1">
                  <p className="text-xs text-slate-400">Full Name</p>
                  {isEditing ? (
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName || ''}
                      onChange={handleChange}
                      className="bg-slate-600 rounded px-2 py-1 text-white w-full focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  ) : (
                    <p className="text-white">{profile.fullName || 'N/A'}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                <FaEnvelope className="text-red-400" />
                <div className="flex-1">
                  <p className="text-xs text-slate-400">Email Address</p>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleChange}
                      className="bg-slate-600 rounded px-2 py-1 text-white w-full focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  ) : (
                    <p className="text-white">{profile.email || 'N/A'}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                <FaPhone className="text-red-400" />
                <div className="flex-1">
                  <p className="text-xs text-slate-400">Phone Number</p>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleChange}
                      className="bg-slate-600 rounded px-2 py-1 text-white w-full focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  ) : (
                    <p className="text-white">{profile.phone || 'N/A'}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                <FaShieldAlt className="text-red-400" />
                <div className="flex-1">
                  <p className="text-xs text-slate-400">Role</p>
                  <p className="text-white">{profile.role}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-slate-800 rounded-2xl p-6 mt-6">
            <h2 className="text-xl font-bold text-white mb-4">Notification Preferences</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white font-medium">Email Notifications</p>
                  <p className="text-xs text-slate-400">Receive admin alerts via email</p>
                </div>
                <button
                  onClick={handleToggleNotification}
                  className={`w-12 h-6 rounded-full transition ${
                    profile.emailNotifications ? 'bg-red-600' : 'bg-slate-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform transform ${
                    profile.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-slate-800 rounded-2xl p-6 mt-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FaHistory className="text-red-400" />
              Recent Activity
            </h2>
            <div className="space-y-3">
              {activityLog.length > 0 ? (
                activityLog.map((activity, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                    <div>
                      <p className="text-white text-sm">{activity.action || 'Action'}</p>
                      <p className="text-xs text-slate-400">IP: {activity.ip || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">
                        {activity.createdAt ? new Date(activity.createdAt).toLocaleString() : 'N/A'}
                      </p>
                      <span className={`text-xs ${activity.status === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                        {getStatusText(activity.status)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-400 py-4">No activity logs found</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Change Password</h2>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition"
              >
                <FaTimes className="text-slate-400" />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-slate-400 text-sm mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                  placeholder="••••••••"
                />
              </div>
              
              <div>
                <label className="block text-slate-400 text-sm mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                  placeholder="••••••••"
                />
              </div>
              
              <div>
                <label className="block text-slate-400 text-sm mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handlePasswordChange}
                disabled={changingPassword}
                className="flex-1 py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {changingPassword ? <FaSpinner className="animate-spin" /> : null}
                {changingPassword ? 'Updating...' : 'Update Password'}
              </button>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 py-3 rounded-lg bg-slate-700 text-white font-semibold hover:bg-slate-600 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfile;