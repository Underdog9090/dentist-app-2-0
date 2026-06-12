import React, { useEffect, useState } from 'react';
import { updateAppointment, getAppointment } from '../api/appointments';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function getInitials(nameOrEmail) {
  if (!nameOrEmail) return '?';
  const parts = nameOrEmail.split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function MessageModal({ open, onClose, appointment }) {
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [localAppointment, setLocalAppointment] = useState(appointment);

  useEffect(() => {
    if (open && appointment) {
      // Fetch the latest appointment data
      getAppointment(appointment._id).then(setLocalAppointment);
    }
  }, [open, appointment]);

  useEffect(() => {
    if (open && localAppointment && localAppointment.replies && localAppointment.replies.length > 0 && !localAppointment.read) {
      // Mark as read in backend
      updateAppointment(localAppointment._id, { read: true });
    }
  }, [open, localAppointment]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) {
      setError('Reply cannot be empty');
      return;
    }
    setSending(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/appointments/${localAppointment._id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ body: reply }),
      });
      if (!res.ok) throw new Error('Failed to send reply');
      const updated = await res.json();
      setLocalAppointment(updated);
      setReply('');
    } catch (err) {
      setError(err.message || 'Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  if (!open || !localAppointment) return null;

  // Helper to determine if a reply is from admin/staff or patient
  const isAdminReply = (rep) => rep.admin && (rep.admin.toLowerCase().includes('admin') || rep.admin.toLowerCase().includes('staff'));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-blue-700">Appointment Message</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        <div className="mb-4">
          <div className="text-sm text-gray-500 mb-1">Service</div>
          <div className="font-medium">{localAppointment.service}</div>
        </div>
        {localAppointment.message && (
          <div className="mb-4">
            <div className="text-sm text-gray-500 mb-1">Your Message</div>
            <div className="whitespace-pre-wrap text-gray-800">{localAppointment.message}</div>
          </div>
        )}
        {localAppointment.replies && localAppointment.replies.length > 0 && (
          <div className="mb-4">
            <div className="text-sm text-gray-500 mb-1">Replies</div>
            <ul className="space-y-2">
              {localAppointment.replies.map((rep, i) => {
                const admin = isAdminReply(rep);
                return (
                  <li
                    key={i}
                    className={`flex items-end ${admin ? 'justify-start' : 'justify-end'}`}
                  >
                    {admin && (
                      <div className="flex-shrink-0 mr-2">
                        <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold">
                          {getInitials(rep.admin)}
                        </div>
                      </div>
                    )}
                    <div
                      className={`p-3 rounded-lg shadow text-sm max-w-[70%] ${
                        admin
                          ? 'bg-blue-100 text-blue-900 rounded-bl-none'
                          : 'bg-green-100 text-green-900 rounded-br-none'
                      }`}
                    >
                      <div>{rep.body}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {rep.admin ? rep.admin : 'Staff'} &middot; {new Date(rep.date).toLocaleString()}
                      </div>
                    </div>
                    {!admin && (
                      <div className="flex-shrink-0 ml-2">
                        <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center text-green-700 font-bold">
                          {getInitials(rep.admin)}
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        {(!localAppointment.message && (!localAppointment.replies || localAppointment.replies.length === 0)) && (
          <div className="text-gray-500 text-center">No messages or replies for this appointment.</div>
        )}
        {/* Reply box for patient */}
        <form onSubmit={handleReply} className="mt-4">
          <textarea
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            value={reply}
            onChange={e => setReply(e.target.value)}
            placeholder="Type your reply here..."
            disabled={sending}
          />
          {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${sending ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={sending}
            >
              {sending ? 'Sending...' : 'Send Reply'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MessageModal; 