import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { getAppointments, deleteAppointment, updateAppointment } from '../api/appointments';
import RescheduleModal from '../components/RescheduleModal';
import MessageModal from '../components/MessageModal';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';

function MyAppointments() {
  const { token } = useAuth();
  const { addNotification } = useNotification();
  const [cancellingId, setCancellingId] = useState(null);
  const [reschedulingAppointment, setReschedulingAppointment] = useState(null);
  const [viewingMessage, setViewingMessage] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch appointments with React Query
  const { data: appointments = [], isLoading, error, refetch } = useQuery({
    queryKey: ['appointments'],
    queryFn: getAppointments,
    enabled: !!token,
    staleTime: 1000 * 60, // 1 minute
  });

  // Open message modal if navigated from notification, then clear state
  useEffect(() => {
    if (location.state && location.state.openMessageId && appointments.length > 0) {
      const app = appointments.find(a => a._id === location.state.openMessageId);
      if (app) setViewingMessage(app);
      // Clear the navigation state so it doesn't persist on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line
  }, [location.state, appointments]);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }
    setCancellingId(id);
    try {
      await deleteAppointment(id);
      queryClient.invalidateQueries(['appointments']);
      addNotification('Appointment cancelled successfully', 'success');
    } catch (err) {
      addNotification(err.message || 'Failed to cancel appointment', 'error');
    } finally {
      setCancellingId(null);
    }
  };

  const handleReschedule = async (formData) => {
    try {
      const updatedAppointment = await updateAppointment(reschedulingAppointment._id, {
        ...reschedulingAppointment,
        date: formData.date,
        time: formData.time
      });
      queryClient.invalidateQueries(['appointments']);
      addNotification('Appointment rescheduled successfully', 'success');
    } catch (err) {
      addNotification(err.message || 'Failed to reschedule appointment', 'error');
      throw err; // Re-throw to be handled by the modal
    }
  };

  if (!token) {
    return <div className="text-center mt-10 text-red-600 dark:text-red-400">You must be logged in to view your appointments.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white dark:bg-gray-900 rounded shadow min-h-[400px] flex flex-col justify-center">
      <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400 text-center">My Appointments</h2>
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <svg className="animate-spin h-8 w-8 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
      {error && (
        <div className="text-red-600 dark:text-red-400 text-center bg-red-50 dark:bg-red-900/50 p-4 rounded mb-4">
          {error.message || error}
        </div>
      )}
      {!isLoading && appointments.length === 0 && (
        <div className="text-center text-gray-600 dark:text-gray-300 py-8">
          No appointments found. Book your first appointment now!
        </div>
      )}
      {!isLoading && appointments.length > 0 && (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {appointments.map(app => (
            <li key={app._id} className="py-4">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <div>
                  <div className="font-semibold text-lg text-blue-600 dark:text-blue-400 flex items-center">
                    {app.service}
                    {app.replies && app.replies.length > 0 && app.read === false && (
                      <span className="ml-2 inline-block w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full" title="New reply"></span>
                    )}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">
                    {new Date(app.date).toLocaleDateString()} at {app.time}
                  </div>
                  <div className={`text-sm ${
                    app.status === 'confirmed' ? 'text-green-600 dark:text-green-400' :
                    app.status === 'cancelled' ? 'text-red-600 dark:text-red-400' :
                    'text-yellow-600 dark:text-yellow-400'
                  }`}>
                    Status: {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </div>
                  <button
                    className="mt-2 px-4 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 text-sm"
                    onClick={() => setViewingMessage(app)}
                  >
                    View Message
                  </button>
                </div>
                <div className="mt-2 md:mt-0 text-gray-700 dark:text-gray-200">
                  <div className="font-medium">{app.patientName}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{app.email}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{app.phone}</div>
                  {app.status !== 'cancelled' && (
                    <div className="flex space-x-2 mt-2">
                      <button
                        onClick={() => setReschedulingAppointment(app)}
                        className="px-4 py-2 text-sm bg-blue-500 dark:bg-blue-700 hover:bg-blue-600 dark:hover:bg-blue-800 text-white rounded transition-colors duration-200"
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={() => handleCancel(app._id)}
                        disabled={cancellingId === app._id}
                        className={`px-4 py-2 text-sm rounded ${
                          cancellingId === app._id
                            ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                            : 'bg-red-500 dark:bg-red-700 hover:bg-red-600 dark:hover:bg-red-800'
                        } text-white transition-colors duration-200`}
                      >
                        {cancellingId === app._id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {reschedulingAppointment && (
        <RescheduleModal
          appointment={reschedulingAppointment}
          onClose={() => setReschedulingAppointment(null)}
          onReschedule={handleReschedule}
        />
      )}
      {viewingMessage && (
        <MessageModal
          open={!!viewingMessage}
          onClose={() => setViewingMessage(null)}
          appointment={viewingMessage}
        />
      )}
    </div>
  );
}

export default MyAppointments; 