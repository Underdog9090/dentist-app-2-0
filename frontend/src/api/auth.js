import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth functions
export const loginUser = async (credentials) => {
  const response = await api.post('/users/login', credentials);
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await api.post('/users/register', userData);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/users/me');
  return response.data;
};

// Staff management functions
export const getStaffUsers = async () => {
  const response = await api.get('/users/staff');
  return response.data;
};

export const createStaffUser = async (staffData) => {
  const response = await api.post('/users/staff', staffData);
  return response.data;
};

export const updateStaffUser = async (id, staffData) => {
  const response = await api.put(`/users/staff/${id}`, staffData);
  return response.data;
};

export const deleteStaffUser = async (id) => {
  const response = await api.delete(`/users/staff/${id}`);
  return response.data;
};

// Role management functions
export const updateUserRole = async (userId, newRole) => {
  const response = await api.put(`/users/${userId}/role`, { role: newRole });
  return response.data;
};

export const getAllUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

// Schedule management
export const updateStaffSchedule = async (staffId, schedule) => {
  const response = await api.put(`/users/staff/${staffId}/schedule`, { schedule });
  return response.data;
};

// Error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw new Error(error.response.data.message || 'An error occurred');
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('No response from server');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error('Error setting up request');
    }
  }
);

export async function updateUserProfile(data) {
  try {
    const response = await api.put('/profile', data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'An error occurred');
  }
}

export async function changePassword(data) {
  try {
    const response = await api.put('/change-password', data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'An error occurred');
  }
}

export async function forgotPassword(email) {
  try {
    const response = await api.post('/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'An error occurred');
  }
}

export async function resetPassword(token, password) {
  try {
    const response = await api.post('/reset-password', { token, password });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'An error occurred');
  }
} 