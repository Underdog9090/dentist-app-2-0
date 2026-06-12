import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch notifications from backend on load
  useEffect(() => {
    if (!user) return;
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${API_URL}/api/notifications`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (!res.ok) throw new Error('Failed to fetch notifications');
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
      } catch (err) {}
    };
    fetchNotifications();
  }, [user]);

  // Real-time notifications
  useEffect(() => {
    if (!user) return;
    const socket = io(API_URL);
    socket.emit('join', user._id);
    socket.on('notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      setToast(notification);
      setTimeout(() => setToast(null), 4000);
    });
    return () => { socket.disconnect(); };
  }, [user]);

  const handleNotificationClick = async (notification) => {
    setNotifications(prev =>
      prev.map(n =>
        n._id === notification._id ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    // Mark as read in backend
    if (notification._id) {
      await fetch(`${API_URL}/api/notifications/${notification._id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
    }
    // Navigate to MyAppointments and pass appointmentId in state
    if (notification.appointmentId) {
      navigate('/my-appointments', { state: { openMessageId: notification.appointmentId } });
    }
  };

  const handleDeleteNotification = async (id) => {
    await fetch(`${API_URL}/api/notifications/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    setNotifications(prev => prev.filter(n => n._id !== id));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleClearAll = async () => {
    // Delete all notifications with a valid _id
    await Promise.all(
      notifications
        .filter(n => n._id)
        .map(n =>
          fetch(`${API_URL}/api/notifications/${n._id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
        )
    );
    setNotifications([]);
    setUnreadCount(0);
  };

  const handleMarkAllAsRead = async () => {
    await Promise.all(
      notifications.filter(n => !n.read).map(n =>
        fetch(`${API_URL}/api/notifications/${n._id}/read`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      )
    );
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-200 hover:text-gray-800 dark:hover:text-white focus:outline-none"
      >
        <svg
          className="w-6 h-6 text-gray-600 dark:text-gray-200"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white dark:text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg shadow-lg overflow-hidden z-50">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
            <div className="flex space-x-2">
              {notifications.length > 0 && (
                <>
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 border px-2 py-1 rounded"
                  >
                    Mark all as read
                  </button>
                  <button
                    onClick={handleClearAll}
                    className="text-xs text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 border px-2 py-1 rounded"
                  >
                    Clear all
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-300">
                No notifications
              </div>
            ) : (
              notifications.map((notification, index) => (
                <div key={notification._id || index} className="flex items-start group">
                  <button
                    onClick={() => handleNotificationClick(notification)}
                    className={`flex-1 p-4 text-left border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 ${
                      !notification.read ? 'bg-blue-50 dark:bg-blue-900' : ''
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-2 mt-1">
                        {/* Icon for notification type */}
                        {notification.type === 'message_reply' ? (
                          <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                        ) : (
                          <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </div>
                      <div className="ml-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-300">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-400 mt-1">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </button>
                  {/* Delete button (shows on hover) */}
                  <button
                    onClick={() => handleDeleteNotification(notification._id)}
                    className="p-2 text-gray-400 dark:text-gray-300 hover:text-red-600 focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete notification"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Toast/Snackbar for new notifications */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded shadow-lg z-50 flex items-center space-x-3 animate-fade-in-out transition-all duration-500">
          <span>
            {toast.title ? <b>{toast.title}: </b> : null}
            {toast.message}
          </span>
        </div>
      )}
      <style>{`
        @keyframes fade-in-out {
          0% { opacity: 0; transform: translateY(20px) scale(0.95); }
          10% { opacity: 1; transform: translateY(0) scale(1); }
          90% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(20px) scale(0.95); }
        }
        .animate-fade-in-out {
          animation: fade-in-out 4s both;
        }
      `}</style>
    </div>
  );
}

export default NotificationCenter; 