import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNotification } from '../context/NotificationContext';
import { getAppointments, updateAppointment } from '../api/appointments';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getStaffUsers } from '../api/auth';
import Modal from 'react-modal';

const locales = {
  'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Status color mapping
const getStatusColor = (status) => {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Utility to assign a color to each staff member
const staffColors = [
  'bg-blue-200', 'bg-green-200', 'bg-yellow-200', 'bg-pink-200', 'bg-purple-200', 'bg-orange-200', 'bg-teal-200', 'bg-red-200', 'bg-indigo-200', 'bg-gray-200'
];
const getStaffColor = (staffId, staffList) => {
  if (!staffId || !staffList.length) return 'bg-gray-200';
  const idx = staffList.findIndex(s => s._id === staffId);
  return staffColors[idx % staffColors.length] || 'bg-gray-200';
};

Modal.setAppElement('#root'); // For accessibility

function Admin() {
  const { addNotification } = useNotification();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [timeRange, setTimeRange] = useState('today'); // 'today', 'week', 'month'
  const [view, setView] = useState('list'); // 'list' or 'calendar'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [modalSaving, setModalSaving] = useState(false);

  // Calculate weekStart and weekEnd for the selected week (inclusive, full days)
  const weekStart = new Date(selectedDate);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999); // Include all of Saturday

  // Memoize the fetchAppointments function
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAppointments();
      setAppointments(data);
    } catch (err) {
      setError(err.message || 'Could not fetch appointments');
      addNotification(err.message || 'Could not fetch appointments', 'error');
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Fetch staff for filter
  useEffect(() => {
    getStaffUsers().then(setStaffList).catch(() => setStaffList([]));
  }, []);

  // Memoize the handleStatusChange function
  const handleStatusChange = useCallback(async (appointmentId, newStatus) => {
    try {
      const updatedAppointment = await updateAppointment(appointmentId, {
        status: newStatus
      });
      setAppointments(prev => prev.map(app => app._id === updatedAppointment._id ? updatedAppointment : app));
      addNotification(`Appointment status updated to ${newStatus}`, 'success');
    } catch (err) {
      addNotification(err.message || 'Failed to update appointment status', 'error');
    }
  }, [addNotification]);

  // Memoize the stats calculation
  const stats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

    return {
      today: appointments.filter(app => new Date(app.date) >= today).length,
      week: appointments.filter(app => new Date(app.date) >= weekAgo).length,
      month: appointments.filter(app => new Date(app.date) >= monthAgo).length,
      total: appointments.length,
      byStatus: {
        pending: appointments.filter(app => app.status === 'pending').length,
        confirmed: appointments.filter(app => app.status === 'confirmed').length,
        cancelled: appointments.filter(app => app.status === 'cancelled').length,
      },
      byService: appointments.reduce((acc, app) => {
        acc[app.service] = (acc[app.service] || 0) + 1;
        return acc;
      }, {}),
      recentActivity: appointments
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
    };
  }, [appointments]);

  // List View filtering - Daily appointments only
  const filteredAppointments = useMemo(() =>
    appointments.filter(app => {
      const appDate = new Date(app.date).toISOString().split('T')[0];
      const matchesDate = appDate === selectedDate;
      const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
      const matchesStaff = selectedStaff === 'all' || (app.staff && app.staff === selectedStaff);
      return matchesDate && matchesStatus && matchesStaff;
    }), [appointments, selectedDate, filterStatus, selectedStaff]);

  // Calendar View filtering - Weekly appointments
  const calendarEvents = useMemo(() =>
    appointments
      .filter(app => {
        const appDate = new Date(app.date);
        const matchesWeek = appDate >= weekStart && appDate <= weekEnd;
        const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
        const matchesStaff = selectedStaff === 'all' || (app.staff && app.staff === selectedStaff);
        return matchesWeek && matchesStatus && matchesStaff;
      })
      .map(app => {
        const dateObj = new Date(app.date);
        const [hour, minute] = app.time.split(':').map(Number);
        const start = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), hour, minute);
        const duration = app.duration || 30;
        const end = new Date(start.getTime() + duration * 60000);
        return {
          id: app._id,
          title: `${app.patientName} - ${app.service}`,
          start,
          end,
          status: app.status,
          patientName: app.patientName,
          service: app.service,
          email: app.email,
          phone: app.phone,
          staff: app.staff,
          duration,
        };
      }), [appointments, weekStart, weekEnd, filterStatus, selectedStaff]);

  // Debug logging
  console.log('calendarEvents', calendarEvents);
  console.log('weekStart', weekStart, 'weekEnd', weekEnd);

  // Memoize event style getter
  const eventStyleGetter = useCallback((event) => {
    let backgroundColor = '#E5E7EB';
    let borderColor = '#9CA3AF';

    switch (event.status) {
      case 'confirmed':
        backgroundColor = '#D1FAE5';
        borderColor = '#059669';
        break;
      case 'cancelled':
        backgroundColor = '#FEE2E2';
        borderColor = '#DC2626';
        break;
      case 'pending':
        backgroundColor = '#FEF3C7';
        borderColor = '#D97706';
        break;
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: '#1F2937',
        border: '1px solid',
        display: 'block',
      },
    };
  }, []);

  // Handle appointment rescheduling
  const handleEventDrop = useCallback(async ({ event, start, end }) => {
    try {
      const updatedAppointment = await updateAppointment(event.id, {
        date: start.toISOString().split('T')[0],
        time: start.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
      });
      
      setAppointments(prev => prev.map(app => 
        app._id === updatedAppointment._id ? updatedAppointment : app
      ));
      
      addNotification('Appointment rescheduled successfully', 'success');
    } catch (err) {
      addNotification(err.message || 'Failed to reschedule appointment', 'error');
      // Refresh appointments to revert the UI
      fetchAppointments();
    }
  }, [addNotification, fetchAppointments]);

  // Custom event tooltip with staff color and name
  const EventComponent = useCallback(({ event }) => {
    const staff = staffList.find(s => s._id === event.staff);
    return (
      <div className={`p-1 rounded ${getStaffColor(event.staff, staffList)}`}> 
        <div className="font-medium">{event.title}</div>
        <div className="text-xs text-gray-600">
          {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')} ({event.duration} min)
        </div>
        {staff && (
          <div className="text-xs font-semibold text-gray-700 mt-1">Staff: {staff.username}</div>
        )}
        <div className={`text-xs px-1 py-0.5 rounded-full mt-1 inline-block ${getStatusColor(event.status)}`}>
          {event.status}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {event.email}<br/>{event.phone}
        </div>
      </div>
    );
  }, [staffList]);

  // Overview stats
  const today = new Date().toISOString().split('T')[0];
  const todaysAppointments = appointments.filter(app => app.date === today);
  const pendingAppointments = appointments.filter(app => app.status === 'pending');

  // Open modal on event click
  const handleEventClick = (event) => {
    setModalData(event);
    setModalOpen(true);
  };

  // Save changes from modal
  const handleModalSave = async () => {
    if (!modalData) return;
    setModalSaving(true);
    try {
      const updated = await updateAppointment(modalData.id, {
        date: modalData.start.toISOString().split('T')[0],
        time: modalData.start.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        staff: modalData.staff,
        duration: modalData.duration,
        status: modalData.status,
      });
      setAppointments(prev => prev.map(app => app._id === updated._id ? updated : app));
      setModalOpen(false);
      setModalData(null);
      addNotification('Appointment updated', 'success');
    } catch (err) {
      addNotification(err.message || 'Failed to update appointment', 'error');
    } finally {
      setModalSaving(false);
    }
  };

  // Check if staff is available at the given time
  const isStaffAvailable = (staffId, date, time, duration) => {
    const staff = staffList.find(s => s._id === staffId);
    if (!staff || !staff.schedule) return true;

    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'lowercase' });
    const staffSchedule = staff.schedule[dayOfWeek];
    
    if (!staffSchedule || !staffSchedule.available) return false;

    const appointmentTime = new Date(`${date}T${time}`);
    const appointmentEnd = new Date(appointmentTime.getTime() + duration * 60000);
    
    const [startHour, startMinute] = staffSchedule.start.split(':').map(Number);
    const [endHour, endMinute] = staffSchedule.end.split(':').map(Number);
    
    const scheduleStart = new Date(appointmentTime);
    scheduleStart.setHours(startHour, startMinute, 0);
    
    const scheduleEnd = new Date(appointmentTime);
    scheduleEnd.setHours(endHour, endMinute, 0);

    return appointmentTime >= scheduleStart && appointmentEnd <= scheduleEnd;
  };

  // Filter available staff for a given time slot
  const getAvailableStaff = (date, time, duration) => {
    return staffList.filter(staff => isStaffAvailable(staff._id, date, time, duration));
  };

  return (
    <div className="max-w-7xl mx-auto mt-10 p-6 bg-white dark:bg-gray-900 rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400 text-center">Admin Dashboard</h2>
      {/* Welcome and Overview */}
      <div className="mb-8">
        <p className="text-center text-gray-600 mb-6">This is your admin dashboard where you can manage the dental clinic.</p>
        
        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-2">Today's Appointments</h2>
            <div className="text-3xl font-bold text-blue-600">{stats.today}</div>
            <div className="text-sm text-gray-500">Total appointments today</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-2">This Week</h2>
            <div className="text-3xl font-bold text-green-600">{stats.week}</div>
            <div className="text-sm text-gray-500">Appointments this week</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-2">This Month</h2>
            <div className="text-3xl font-bold text-purple-600">{stats.month}</div>
            <div className="text-sm text-gray-500">Appointments this month</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-2">Total Appointments</h2>
            <div className="text-3xl font-bold text-orange-600">{stats.total}</div>
            <div className="text-sm text-gray-500">All time appointments</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <button
              onClick={() => window.location.href = '/admin/messages'}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              View Messages
            </button>
          </div>

          {/* Status Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Appointment Status</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pending</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2.5 mr-2">
                    <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: `${(stats.byStatus.pending / stats.total) * 100}%` }}></div>
                  </div>
                  <span className="text-sm font-medium">{stats.byStatus.pending}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Confirmed</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2.5 mr-2">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${(stats.byStatus.confirmed / stats.total) * 100}%` }}></div>
                  </div>
                  <span className="text-sm font-medium">{stats.byStatus.confirmed}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Cancelled</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2.5 mr-2">
                    <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${(stats.byStatus.cancelled / stats.total) * 100}%` }}></div>
                  </div>
                  <span className="text-sm font-medium">{stats.byStatus.cancelled}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Service Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Service Distribution</h2>
            <div className="space-y-4">
              {Object.entries(stats.byService).map(([service, count]) => (
                <div key={service} className="flex justify-between items-center">
                  <span className="text-gray-600">{service}</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2.5 mr-2">
                      <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${(count / stats.total) * 100}%` }}></div>
                    </div>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {stats.recentActivity.map(app => (
              <div key={app._id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <div className="font-medium">{app.patientName}</div>
                  <div className="text-sm text-gray-500">{app.service}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm">{new Date(app.date).toLocaleDateString()}</div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* View Toggle and Filters */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-4">
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-md ${
                view === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`px-4 py-2 rounded-md ${
                view === 'calendar'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Calendar View
            </button>
        </div>
      </div>

        <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Date
          </label>
          <input
            type="date"
            id="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Status
          </label>
          <select
            id="status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          </div>
          <div className="flex-1">
            <label htmlFor="timeRange" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Time Range
            </label>
            <select
              id="timeRange"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Staff Filter Dropdown */}
      <div className="mb-4 flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex-1">
          <label htmlFor="staff" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Staff</label>
          <select
            id="staff"
            value={selectedStaff}
            onChange={e => setSelectedStaff(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Staff</option>
            {staffList.map(staff => (
              <option key={staff._id} value={staff._id}>{staff.username}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : error ? (
        <div className="text-red-600 text-center bg-red-50 p-4 rounded mb-4">
          {error}
        </div>
      ) : view === 'calendar' ? (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <div className="mb-4 flex justify-between items-center">
            <div className="text-lg font-semibold">
              {selectedDate && new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  const date = new Date(selectedDate);
                  date.setDate(date.getDate() - 7);
                  setSelectedDate(date.toISOString().split('T')[0]);
                }}
                className="px-3 py-1 border rounded hover:bg-gray-100"
              >
                Previous Week
              </button>
              <button
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                className="px-3 py-1 border rounded hover:bg-gray-100"
              >
                Today
              </button>
              <button
                onClick={() => {
                  const date = new Date(selectedDate);
                  date.setDate(date.getDate() + 7);
                  setSelectedDate(date.toISOString().split('T')[0]);
                }}
                className="px-3 py-1 border rounded hover:bg-gray-100"
              >
                Next Week
              </button>
            </div>
          </div>

          {/* Weekly Calendar View */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => {
              const date = new Date(selectedDate);
              date.setDate(date.getDate() - date.getDay() + index);
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <div 
                  key={day} 
                  className={`p-2 text-center border rounded ${isToday ? 'bg-blue-100 border-blue-400 font-bold' : 'bg-gray-50'}`}
                >
                  <div className="font-medium text-gray-800">{day}</div>
                  <div className="text-sm text-gray-600">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                </div>
              );
            })}
          </div>

          {/* Time Slots */}
          <div className="grid grid-cols-7 gap-1" style={{ maxHeight: '340px', overflowY: 'auto' }}>
            {Array.from({ length: 13 }, (_, i) => i + 8).map(hour => (
              <div key={hour} className="col-span-7 grid grid-cols-7 gap-2">
                <div className="text-right pr-2 text-sm text-gray-500">
                  {`${hour}:00`}
                </div>
                {Array.from({ length: 7 }, (_, dayIndex) => {
                  const date = new Date(selectedDate);
                  date.setDate(date.getDate() - date.getDay() + dayIndex);
                  date.setHours(hour, 0, 0, 0);
                  
                  const isToday = date.toDateString() === new Date().toDateString();
                  
                  const events = calendarEvents.filter(event => {
                    const eventDate = new Date(event.start);
                    return eventDate.getDate() === date.getDate() &&
                           eventDate.getMonth() === date.getMonth() &&
                           eventDate.getFullYear() === date.getFullYear() &&
                           eventDate.getHours() === hour;
                  });

                  return (
                    <div 
                      key={`${dayIndex}-${hour}`} 
                      className={`border rounded min-h-[18px] p-0.5 relative ${isToday ? 'bg-blue-50' : ''}`}
                    >
                      {events.map(event => {
                        const eventDate = new Date(event.start);
                        const minutes = eventDate.getMinutes();
                        const duration = event.duration || 30;
                        const height = `${(duration / 60) * 60}px`;
                        
                        return (
                          <div 
                            key={event.id}
                            className={`absolute left-1 right-1 p-1 rounded text-xs ${getStatusColor(event.status)} cursor-pointer hover:bg-opacity-90 ${isToday ? 'ring-2 ring-blue-400' : ''}`}
                            style={{
                              top: `${(minutes / 60) * 60}px`,
                              height: height,
                              zIndex: 10
                            }}
                            onClick={() => {
                              setModalData({
                                id: event.id,
                                start: new Date(event.start),
                                end: new Date(event.end),
                                title: event.title,
                                status: event.status,
                                staff: event.staff,
                                duration: event.duration,
                                patientName: event.patientName,
                                service: event.service,
                                email: event.email,
                                phone: event.phone
                              });
                              setModalOpen(true);
                            }}
                          >
                            <div className="font-medium truncate">{event.title}</div>
                            <div className="text-xs text-gray-600">
                              {format(new Date(event.start), 'h:mm a')} - {format(new Date(event.end), 'h:mm a')}
                            </div>
                            <div className="text-xs text-gray-600 truncate">
                              {event.patientName}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Week's Appointments List */}
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="font-semibold mb-2 text-gray-800 dark:text-white">
              This Week's Appointments
              <span className="ml-2 text-xs text-gray-600 dark:text-white font-normal">
                ({format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')})
              </span>
            </h3>
            <div className="space-y-2">
              {calendarEvents
                .filter(event => {
                  const eventDate = new Date(event.start);
                  return eventDate >= weekStart && eventDate <= weekEnd;
                })
                .sort((a, b) => new Date(a.start) - new Date(b.start))
                .map(event => {
                  const eventDate = new Date(event.start);
                  const isToday = eventDate.toDateString() === new Date().toDateString();
                  
                  return (
                    <div 
                      key={event.id} 
                      className={`flex items-center justify-between p-2 bg-white rounded shadow-sm cursor-pointer hover:bg-gray-50 ${isToday ? 'border-l-4 border-blue-500' : ''}`}
                      onClick={() => {
                        setModalData({
                          id: event.id,
                          start: new Date(event.start),
                          end: new Date(event.end),
                          title: event.title,
                          status: event.status,
                          staff: event.staff,
                          duration: event.duration,
                          patientName: event.patientName,
                          service: event.service,
                          email: event.email,
                          phone: event.phone
                        });
                        setModalOpen(true);
                      }}
                    >
                      <div>
                        <span className="font-medium">{event.title}</span>
                        <span className="text-sm text-gray-800 ml-2">
                          {format(new Date(event.start), 'EEEE, MMM d, h:mm a')}
                          {isToday && <span className="ml-2 text-blue-600 font-semibold">(Today)</span>}
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Show a message if there are no appointments for the week */}
          {calendarEvents.filter(event => {
            const eventDate = new Date(event.start);
            return eventDate >= weekStart && eventDate <= weekEnd;
          }).length === 0 && (
            <div className="text-center text-gray-400 dark:text-gray-300 py-8">
              No appointments scheduled for this week.
            </div>
          )}
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="text-center text-gray-600 py-8">
          No appointments found for the selected filters.
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredAppointments.map(app => (
              <li key={app._id} className="px-6 py-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-blue-600">{app.service}</h3>
                      <span className={getStatusColor(app.status)}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <p>Date: {new Date(app.date).toLocaleDateString()}</p>
                      <p>Time: {app.time}</p>
                    </div>
                    <div className="mt-2">
                      <h4 className="text-sm font-medium text-gray-900">Patient Information</h4>
                      <div className="mt-1 text-sm text-gray-600">
                        <p>Name: {app.patientName}</p>
                        <p>Email: {app.email}</p>
                        <p>Phone: {app.phone}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-6 flex flex-col space-y-2">
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app._id, e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <button
                      onClick={() => window.location.href = `/admin/appointments/${app._id}`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Edit Appointment Modal */}
      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        contentLabel="Edit Appointment"
        className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto mt-24 outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center"
      >
        {modalData ? (
          <div>
            <h2 className="text-xl font-bold mb-4">Edit Appointment</h2>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Date</label>
              <input 
                type="date" 
                className="w-full border rounded p-2" 
                value={modalData.start.toISOString().split('T')[0]} 
                onChange={e => {
                  const newDate = e.target.value;
                  const availableStaff = getAvailableStaff(
                    newDate,
                    modalData.start.toTimeString().slice(0,5),
                    modalData.duration
                  );
                  setModalData({ 
                    ...modalData, 
                    start: new Date(newDate + 'T' + modalData.start.toTimeString().slice(0,5)),
                    staff: availableStaff.some(s => s._id === modalData.staff) ? modalData.staff : ''
                  });
                }} 
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Time</label>
              <input 
                type="time" 
                className="w-full border rounded p-2" 
                value={modalData.start.toTimeString().slice(0,5)} 
                onChange={e => {
                  const newTime = e.target.value;
                  setModalData({ 
                    ...modalData, 
                    start: new Date(modalData.start.toISOString().split('T')[0] + 'T' + newTime)
                  });
                }} 
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Duration (minutes)</label>
              <input 
                type="number" 
                className="w-full border rounded p-2" 
                value={modalData.duration} 
                min={5}
                max={180}
                onChange={e => setModalData({ ...modalData, duration: parseInt(e.target.value) })}
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Status</label>
              <select
                className="w-full border rounded p-2"
                value={modalData.status}
                onChange={e => setModalData({ ...modalData, status: e.target.value })}
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Staff</label>
              <select 
                className="w-full border rounded p-2" 
                value={modalData.staff || ''} 
                onChange={e => setModalData({ ...modalData, staff: e.target.value })}
              >
                <option value="">Select Staff</option>
                {getAvailableStaff(
                  modalData.start.toISOString().split('T')[0],
                  modalData.start.toTimeString().slice(0,5),
                  modalData.duration
                ).map(staff => (
                  <option key={staff._id} value={staff._id}>{staff.username}</option>
                ))}
              </select>
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Patient Name</label>
              <input
                type="text"
                className="w-full border rounded p-2 bg-gray-100"
                value={modalData.patientName}
                readOnly
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Service</label>
              <input
                type="text"
                className="w-full border rounded p-2 bg-gray-100"
                value={modalData.service}
                readOnly
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Email</label>
              <input
                type="email"
                className="w-full border rounded p-2 bg-gray-100"
                value={modalData.email}
                readOnly
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Phone</label>
              <input
                type="text"
                className="w-full border rounded p-2 bg-gray-100"
                value={modalData.phone}
                readOnly
              />
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                disabled={modalSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleModalSave}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                disabled={modalSaving}
              >
                {modalSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

export default Admin; 