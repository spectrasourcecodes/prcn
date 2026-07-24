import { useState } from 'react';
import { FaBell, FaCheckCircle, FaClock, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { mockNotifications } from '../data/mockData';

const Notifications = () => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState('all');

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    ));
    toast.success('Marked as read');
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
    toast.success('Notification deleted');
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
    toast.success('All notifications marked as read');
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.read;
    if (filter === 'read') return notif.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

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
              className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition text-sm"
            >
              Mark all as read
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
                key={notification.id}
                className={`bg-slate-800 rounded-xl p-4 transition-all duration-200 ${
                  !notification.read ? 'border-l-4 border-blue-500' : 'opacity-75'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <FaBell className="text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{notification.title}</h3>
                      <p className="text-sm text-slate-400 mt-1">{notification.message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <FaClock className="text-slate-500 text-xs" />
                        <span className="text-xs text-slate-500">{notification.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-2 hover:bg-slate-700 rounded-lg transition"
                      >
                        <FaCheckCircle className="text-green-500" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-2 hover:bg-slate-700 rounded-lg transition"
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
      </main>
    </div>
  );
};

const BellIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

export default Notifications;