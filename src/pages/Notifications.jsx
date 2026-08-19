import { useState, useEffect } from 'react';
import { FaBell, FaCheckCircle, FaClock, FaTrash, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import API from '../utils/axios';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [pagination.page, filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await API.get('/notifications', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
        },
      });
      if (response.data.success) {
        setNotifications(response.data.data);
        setPagination(response.data.pagination);
      } else {
        toast.error('Failed to load notifications');
      }
    } catch (error) {
      console.error('Notifications fetch error:', error);
      toast.error(error.response?.data?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      setActionLoading(true);
      const response = await API.put(`/notifications/${id}/read`);
      if (response.data.success) {
        setNotifications(
          notifications.map((notif) =>
            notif._id === id ? { ...notif, read: true, readAt: new Date().toISOString() } : notif
          )
        );
        toast.success('Marked as read');
      } else {
        toast.error(response.data.message || 'Failed to mark as read');
      }
    } catch (error) {
      console.error('Mark as read error:', error);
      toast.error(error.response?.data?.message || 'Failed to mark as read');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteNotification = async (id) => {
    try {
      setActionLoading(true);
      const response = await API.delete(`/notifications/${id}`);
      if (response.data.success) {
        setNotifications(notifications.filter((notif) => notif._id !== id));
        toast.success('Notification deleted');
      } else {
        toast.error(response.data.message || 'Failed to delete notification');
      }
    } catch (error) {
      console.error('Delete notification error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete notification');
    } finally {
      setActionLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      setActionLoading(true);
      const response = await API.put('/notifications/read-all');
      if (response.data.success) {
        setNotifications(
          notifications.map((notif) => ({
            ...notif,
            read: true,
            readAt: new Date().toISOString(),
          }))
        );
        toast.success('All notifications marked as read');
      } else {
        toast.error(response.data.message || 'Failed to mark all as read');
      }
    } catch (error) {
      console.error('Mark all as read error:', error);
      toast.error(error.response?.data?.message || 'Failed to mark all as read');
    } finally {
      setActionLoading(false);
    }
  };

  const loadMore = () => {
    if (pagination.page < pagination.pages) {
      setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Format time from ISO string
  const formatTime = (date) => {
    if (!date) return 'Just now';
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'unread') return !notif.read;
    if (filter === 'read') return notif.read;
    return true;
  });

  if (loading && notifications.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 pt-16 lg:pl-64 pb-20 lg:pb-0">
        <Navbar />
        <main className="p-4 sm:p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <FaSpinner className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-slate-400">Loading notifications...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 pt-16 lg:pl-64 pb-20 lg:pb-0">
      <Navbar />

      <main className="p-4 sm:p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Notifications</h1>
            <p className="text-slate-400 mt-1">Stay updated with your account activities</p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              disabled={actionLoading}
              className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition text-sm disabled:opacity-50"
            >
              {actionLoading ? <FaSpinner className="animate-spin inline" /> : 'Mark all as read'}
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition whitespace-nowrap ${
              filter === 'all'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg transition whitespace-nowrap ${
              filter === 'unread'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-4 py-2 rounded-lg transition whitespace-nowrap ${
              filter === 'read'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Read
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`bg-slate-800 rounded-xl p-4 transition-all duration-200 ${
                  !notification.read ? 'border-l-4 border-blue-500' : 'opacity-75'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-3 flex-1">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaBell className="text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white">{notification.title}</h3>
                      <p className="text-sm text-slate-400 mt-1 break-words">{notification.message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <FaClock className="text-slate-500 text-xs" />
                        <span className="text-xs text-slate-500">
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0 ml-2">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification._id)}
                        disabled={actionLoading}
                        className="p-2 hover:bg-slate-700 rounded-lg transition disabled:opacity-50"
                        title="Mark as read"
                      >
                        <FaCheckCircle className="text-green-500" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification._id)}
                      disabled={actionLoading}
                      className="p-2 hover:bg-slate-700 rounded-lg transition disabled:opacity-50"
                      title="Delete"
                    >
                      <FaTrash className="text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <BellIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No notifications found</p>
            </div>
          )}
        </div>

        {/* Load More */}
        {pagination.pages > 1 && pagination.page < pagination.pages && (
          <div className="text-center mt-6">
            <button
              onClick={loadMore}
              disabled={loading}
              className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white transition disabled:opacity-50"
            >
              {loading ? <FaSpinner className="animate-spin inline" /> : 'Load More'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

const BellIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
);

export default Notifications;