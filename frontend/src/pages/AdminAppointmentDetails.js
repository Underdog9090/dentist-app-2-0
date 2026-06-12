import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAppointment, getAppointments, updateAppointment } from '../api/appointments';
import { useNotification } from '../context/NotificationContext';

function AdminAppointmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const [appointment, setAppointment] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getAppointment(id);
        setAppointment(data);
        setStatus(data.status);
        // Fetch patient history (all appointments for this patient, excluding this one)
        if (data.email) {
          const all = await getAppointments();
          setHistory(all.filter(a => a.email === data.email && a._id !== id));
        }
        // Load notes if available
        setNotes(data.notes || []);
      } catch (err) {
        setError(err.message || 'Could not fetch appointment details');
        addNotification(err.message || 'Could not fetch appointment details', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, addNotification]);

  const handleStatusChange = async (newStatus) => {
    try {
      const updated = await updateAppointment(id, { status: newStatus });
      setStatus(newStatus);
      setAppointment(prev => ({ ...prev, status: newStatus }));
      addNotification('Status updated', 'success');
    } catch (err) {
      addNotification(err.message || 'Failed to update status', 'error');
    }
  };

  const handleAddNote = async () => {
    if (!note.trim()) return;
    try {
      const updated = await updateAppointment(id, { 
        notes: [...(appointment.notes || []), { text: note, date: new Date().toISOString() }] 
      });
      setAppointment(updated);
      setNotes(updated.notes || []);
      setNote('');
      addNotification('Note added', 'success');
    } catch (err) {
      addNotification(err.message || 'Failed to add note', 'error');
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center text-red-600 py-10">{error}</div>;
  if (!appointment) return null;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <button onClick={() => navigate(-1)} className="mb-4 text-blue-600 hover:underline">&larr; Back to Appointments</button>
      <h2 className="text-2xl font-bold mb-2 text-blue-700">Appointment Details</h2>
      <div className="bg-white rounded shadow p-6 mb-6">
        <div className="mb-2"><span className="font-semibold">Service:</span> {appointment.service}</div>
        <div className="mb-2"><span className="font-semibold">Date:</span> {new Date(appointment.date).toLocaleDateString()} at {appointment.time}</div>
        <div className="mb-2"><span className="font-semibold">Status:</span> <span className="capitalize">{status}</span></div>
        <div className="mb-2"><span className="font-semibold">Patient Name:</span> {appointment.patientName}</div>
        <div className="mb-2"><span className="font-semibold">Email:</span> {appointment.email}</div>
        <div className="mb-2"><span className="font-semibold">Phone:</span> {appointment.phone}</div>
        <div className="mb-2">
          <span className="font-semibold">Change Status:</span>
          <select value={status} onChange={e => handleStatusChange(e.target.value)} className="ml-2 border rounded px-2 py-1">
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      <div className="bg-white rounded shadow p-6 mb-6">
        <h3 className="font-semibold mb-2">Notes & Comments</h3>
        <ul className="mb-4 space-y-2">
          {notes.length === 0 && <li className="text-gray-500">No notes yet.</li>}
          {notes.map((note, i) => (
            <li key={i} className="border-b pb-2">
              <div className="text-sm text-gray-500">{new Date(note.date).toLocaleString()}</div>
              <div>{note.text}</div>
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Add a note..."
            className="flex-1 border rounded px-2 py-1"
          />
          <button 
            onClick={handleAddNote}
            className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
          >
            Add
          </button>
        </div>
      </div>
      <div className="bg-white rounded shadow p-6">
        <h3 className="font-semibold mb-2">Patient History</h3>
        {history.length === 0 ? (
          <div className="text-gray-500">No previous appointments found.</div>
        ) : (
          <ul className="list-disc pl-5">
            {history.map(h => (
              <li key={h._id}>
                {new Date(h.date).toLocaleDateString()} at {h.time} — {h.service} (<span className="capitalize">{h.status}</span>)
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default AdminAppointmentDetails; 