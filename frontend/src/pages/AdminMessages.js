import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAppointments, updateAppointment } from '../api/appointments';
import ReplyModal from '../components/ReplyModal';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

async function sendReply(appointmentId, reply) {
  const res = await fetch(`${API_URL}/api/appointments/${appointmentId}/reply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ body: reply }),
  });
  if (!res.ok) throw new Error('Failed to send reply');
  return await res.json();
}

async function markAsRead(appointmentId) {
  await updateAppointment(appointmentId, { read: true });
}

function AdminMessages() {
  const queryClient = useQueryClient();
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyLoading, setReplyLoading] = useState(false);
  const [viewingMessage, setViewingMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  // Fetch appointments/messages with React Query
  const { data: appointments = [], isLoading, error, refetch } = useQuery({
    queryKey: ['appointments'],
    queryFn: getAppointments,
    staleTime: 1000 * 60, // 1 minute
  });

  // Only show appointments with a non-empty message
  const messages = useMemo(() =>
    appointments.filter(app => app.message && app.message.trim() !== '').map(app => ({
      id: app._id,
      sender: app.patientName,
      email: app.email,
      subject: app.service,
      body: app.message,
      date: app.date,
      replies: app.replies || [],
      read: !!app.read,
    })), [appointments]);

  const handleReply = async (appointmentId, reply) => {
    setReplyLoading(true);
    try {
      const updated = await sendReply(appointmentId, reply);
      queryClient.invalidateQueries(['appointments']);
      setReplyingTo(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setReplyLoading(false);
    }
  };

  const handleOpenReply = (msg) => {
    setReplyingTo(msg.id);
  };

  const handleViewMessage = async (msg) => {
    setViewingMessage(msg);
    if (!msg.read) {
      await markAsRead(msg.id);
      queryClient.invalidateQueries(['appointments']);
    }
  };

  // Filter and sort messages
  const filteredMessages = useMemo(() => {
    return messages
      .filter(msg => {
        // Search filter
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = searchQuery === '' || 
          msg.sender.toLowerCase().includes(searchLower) ||
          msg.email.toLowerCase().includes(searchLower) ||
          msg.body.toLowerCase().includes(searchLower) ||
          msg.subject.toLowerCase().includes(searchLower);

        // Date filter
        const msgDate = new Date(msg.date);
        const today = new Date();
        const matchesDate = dateFilter === 'all' || 
          (dateFilter === 'today' && msgDate.toDateString() === today.toDateString()) ||
          (dateFilter === 'week' && (today - msgDate) <= 7 * 24 * 60 * 60 * 1000) ||
          (dateFilter === 'month' && (today - msgDate) <= 30 * 24 * 60 * 60 * 1000);

        // Status filter
        const matchesStatus = statusFilter === 'all' ||
          (statusFilter === 'unread' && !msg.read) ||
          (statusFilter === 'read' && msg.read) ||
          (statusFilter === 'replied' && msg.replies && msg.replies.length > 0);

        return matchesSearch && matchesDate && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'date') {
          return new Date(b.date) - new Date(a.date);
        } else {
          // Sort by status: unread first, then by date
          if (!a.read && b.read) return -1;
          if (a.read && !b.read) return 1;
          return new Date(b.date) - new Date(a.date);
        }
      });
  }, [messages, searchQuery, dateFilter, statusFilter, sortBy]);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 bg-white dark:bg-gray-900 rounded shadow min-h-[400px] flex flex-col justify-center">
      <h2 className="text-2xl font-bold mb-4 text-green-700 dark:text-green-400">Patient Messages</h2>
      
      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages..."
              className="w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-green-500 focus:ring-green-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          {/* Date Filter */}
          <div>
            <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Date Range
            </label>
            <select
              id="dateFilter"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-green-500 focus:ring-green-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Status
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-green-500 focus:ring-green-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Messages</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Sort By
            </label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-green-500 focus:ring-green-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            >
              <option value="date">Date</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        Showing {filteredMessages.length} of {messages.length} messages
      </div>

      {isLoading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-600">{error.message || 'Error loading messages'}</div>
      ) : filteredMessages.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded shadow p-6 text-center text-gray-500">
          {messages.length === 0 
            ? "No messages yet. Patient messages will appear here for you to view and respond to."
            : "No messages match your current filters."}
        </div>
      ) : (
        <ul className="space-y-4">
          {filteredMessages.map(msg => (
            <li key={msg.id} className={`bg-white dark:bg-gray-800 rounded shadow p-4 ${!msg.read ? 'border-l-4 border-green-500' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-500 dark:text-gray-300">{new Date(msg.date).toLocaleString()}</div>
                {!msg.read && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Unread</span>}
              </div>
              <div className={`font-semibold ${!msg.read ? 'text-green-700 dark:text-green-400' : 'text-blue-700 dark:text-blue-400'}`}>{msg.subject}</div>
              <div className="mb-2 text-gray-700 dark:text-gray-100 line-clamp-2">{msg.body}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">From: {msg.sender} ({msg.email})</div>
              <div className="mt-2 space-x-2">
                <button
                  className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() => handleViewMessage(msg)}
                >
                  View Message
                </button>
                <button
                  className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  onClick={() => handleOpenReply(msg)}
                >
                  Reply
                </button>
              </div>
              {msg.replies && msg.replies.length > 0 && (
                <div className="mt-4 bg-gray-50 dark:bg-gray-900 rounded p-3">
                  <div className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Replies:</div>
                  <ul className="space-y-2">
                    {msg.replies.map((rep, i) => (
                      <li key={i} className="text-sm text-gray-800 dark:text-gray-100 border-l-4 border-green-400 pl-2">
                        <div className="flex justify-between items-center">
                          <span>{rep.body}</span>
                          <span className="ml-2 text-xs text-gray-500 dark:text-gray-300">{rep.admin} &middot; {new Date(rep.date).toLocaleString()}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <ReplyModal
                open={replyingTo === msg.id}
                onClose={() => setReplyingTo(null)}
                onSubmit={reply => handleReply(msg.id, reply)}
                loading={replyLoading}
              />
            </li>
          ))}
        </ul>
      )}

      {/* Message View Modal */}
      {viewingMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-green-700">Message Details</h2>
              <button
                onClick={() => setViewingMessage(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">From</div>
                <div className="font-medium">{viewingMessage.sender} ({viewingMessage.email})</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Subject</div>
                <div className="font-medium">{viewingMessage.subject}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Date</div>
                <div>{new Date(viewingMessage.date).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Message</div>
                <div className="whitespace-pre-wrap">{viewingMessage.body}</div>
              </div>
              {viewingMessage.replies && viewingMessage.replies.length > 0 && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Replies</div>
                  <div className="space-y-2">
                    {viewingMessage.replies.map((rep, i) => (
                      <div key={i} className="bg-gray-50 p-3 rounded">
                        <div className="text-sm text-gray-800">{rep.body}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {rep.admin} &middot; {new Date(rep.date).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setViewingMessage(null);
                  handleOpenReply(viewingMessage);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Reply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminMessages; 