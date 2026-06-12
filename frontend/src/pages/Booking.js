import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { createAppointment } from '../api/appointments';
import { validateBookingForm } from '../utils/validation';

function Booking() {
  const { token, user } = useAuth();
  const [form, setForm] = useState({
    patientName: user?.username || '',
    email: user?.email || '',
    phone: '',
    date: '',
    time: '',
    service: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const navigate = useNavigate();

  if (!token) {
    return <div className="text-center mt-10 text-red-600 dark:text-red-400">You must be logged in to book an appointment.</div>;
  }

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');
    setErrors({});

    // Validate form
    const { isValid, errors: validationErrors } = validateBookingForm(form);
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      await createAppointment(form);
      setSubmitSuccess('Appointment booked successfully!');
      setTimeout(() => navigate('/my-appointments'), 1200);
    } catch (err) {
      setSubmitError(err.message || 'Failed to book appointment');
    } finally {
      setIsLoading(false);
    }
  };

  const getInputClassName = (fieldName) => {
    return `w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      errors[fieldName] ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
    } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400`;
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white dark:bg-gray-900 rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400 text-center">Book an Appointment</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            name="patientName"
            placeholder="Your Name"
            className={getInputClassName('patientName')}
            value={form.patientName}
            onChange={handleChange}
            disabled={isLoading}
          />
          {errors.patientName && <p className="text-red-500 text-sm mt-1">{errors.patientName}</p>}
        </div>

        <div>
          <input
            type="email"
            name="email"
            placeholder="Email"
            className={getInputClassName('email')}
            value={form.email}
            onChange={handleChange}
            disabled={isLoading}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            className={getInputClassName('phone')}
            value={form.phone}
            onChange={handleChange}
            disabled={isLoading}
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
        </div>

        <div>
          <input
            type="date"
            name="date"
            className={getInputClassName('date')}
            value={form.date}
            onChange={handleChange}
            disabled={isLoading}
            min={new Date().toISOString().split('T')[0]}
            max={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
          />
          {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
        </div>

        <div>
          <input
            type="time"
            name="time"
            className={getInputClassName('time')}
            value={form.time}
            onChange={handleChange}
            disabled={isLoading}
            min="09:00"
            max="17:00"
          />
          {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
        </div>

        <div>
          <select
            name="service"
            className={getInputClassName('service')}
            value={form.service}
            onChange={handleChange}
            disabled={isLoading}
          >
            <option value="">Select Service</option>
            <option value="Teeth Cleaning">Teeth Cleaning</option>
            <option value="Braces & Orthodontics">Braces & Orthodontics</option>
            <option value="Teeth Whitening">Teeth Whitening</option>
            <option value="Dental Implants">Dental Implants</option>
            <option value="Emergency Care">Emergency Care</option>
          </select>
          {errors.service && <p className="text-red-500 text-sm mt-1">{errors.service}</p>}
        </div>

        <div>
          <textarea
            name="message"
            placeholder="Message (optional)"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            value={form.message}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          className={`w-full bg-blue-600 text-white py-2 rounded font-semibold transition-colors duration-200 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
          }`}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Booking...
            </span>
          ) : 'Book Appointment'}
        </button>

        {submitError && (
          <div className="text-red-600 text-center bg-red-50 p-3 rounded">
            {submitError}
          </div>
        )}
        {submitSuccess && (
          <div className="text-green-600 text-center bg-green-50 p-3 rounded">
            {submitSuccess}
          </div>
        )}
      </form>
    </div>
  );
}

export default Booking; 