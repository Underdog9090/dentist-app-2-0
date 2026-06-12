import { createRetryableApi } from '../utils/apiRetry';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Something went wrong');
  }
  return response.json();
};

// Helper function to create API request
const createRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  // If no token and not on login page, redirect to login
  if (!token && window.location.pathname !== '/login') {
    window.location.href = '/login?message=Please log in to continue';
    return Promise.reject(new Error('No token available'));
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?message=Your session has expired. Please log in again.';
      }
      return Promise.reject(new Error('Session expired'));
    }

    return handleResponse(response);
  } catch (error) {
    if (error.message === 'Session expired') {
      return Promise.reject(error);
    }
    throw error;
  }
};

// Create retryable API functions
const retryableCreateRequest = createRetryableApi(createRequest, {
  maxRetries: 3,
  shouldRetry: (error) => {
    // Retry on network errors or 5xx server errors
    return error.message === 'Failed to fetch' || 
           (error.status >= 500 && error.status < 600);
  },
});

// API functions
export const getAppointments = () => retryableCreateRequest('/appointments');
export const createAppointment = (data) => retryableCreateRequest('/appointments', {
  method: 'POST',
  body: JSON.stringify(data),
});
export const updateAppointment = (id, data) => retryableCreateRequest(`/appointments/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data),
});
export const deleteAppointment = (id) => retryableCreateRequest(`/appointments/${id}`, {
  method: 'DELETE',
});

export async function getAppointment(id) {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
  const res = await fetch(`${API_URL}/api/appointments/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  if (!res.ok) throw new Error('Failed to fetch appointment');
  return await res.json();
} 