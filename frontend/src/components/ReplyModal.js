import { useState } from 'react';

function ReplyModal({ open, onClose, onSubmit, loading }) {
  const [reply, setReply] = useState('');
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reply.trim()) {
      setError('Reply cannot be empty');
      return;
    }
    setError('');
    await onSubmit(reply);
    setReply('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-green-700">Reply to Message</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            rows={4}
            value={reply}
            onChange={e => setReply(e.target.value)}
            placeholder="Type your reply here..."
            disabled={loading}
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex justify-end space-x-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reply'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReplyModal; 