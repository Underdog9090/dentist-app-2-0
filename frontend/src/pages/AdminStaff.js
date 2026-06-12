import { useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import { getStaffUsers, createStaffUser, updateStaffUser, deleteStaffUser, updateUserRole } from '../api/auth';
import Modal from 'react-modal';
import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Initialize Modal for accessibility
if (typeof window !== 'undefined') {
  Modal.setAppElement('#root');
}

// Skeleton loader for staff list
function StaffSkeleton({ count = 5 }) {
  return (
    <ul className="divide-y divide-gray-200 dark:divide-gray-700 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="px-6 py-4 bg-gray-100 dark:bg-gray-800 rounded mb-2">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/4 mb-2"></div>
          <div className="flex space-x-2 mt-2">
            <div className="h-3 w-12 bg-gray-200 dark:bg-gray-600 rounded"></div>
            <div className="h-3 w-16 bg-gray-200 dark:bg-gray-600 rounded"></div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function AdminStaff() {
  const { addNotification } = useNotification();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'staff',
    specialties: [],
    schedule: {
      monday: { start: '09:00', end: '17:00', available: true },
      tuesday: { start: '09:00', end: '17:00', available: true },
      wednesday: { start: '09:00', end: '17:00', available: true },
      thursday: { start: '09:00', end: '17:00', available: true },
      friday: { start: '09:00', end: '17:00', available: true }
    }
  });

  // Available roles and specialties
  const availableRoles = ['admin', 'staff', 'patient'];
  const availableSpecialties = [
    'General Dentistry',
    'Orthodontics',
    'Pediatric Dentistry',
    'Oral Surgery',
    'Endodontics'
  ];

  // Fetch staff data with React Query
  const { data: staff = [], isLoading, error } = useQuery({
    queryKey: ['staff'],
    queryFn: getStaffUsers,
    staleTime: 1000 * 60, // 1 minute
  });

  const handleOpenModal = (staffMember = null) => {
    if (staffMember) {
      setFormData({
        ...staffMember,
        password: '', // Don't show password when editing
        specialties: staffMember.specialties || [], // Ensure specialties is an array
        schedule: staffMember.schedule || {
          monday: { start: '09:00', end: '17:00', available: true },
          tuesday: { start: '09:00', end: '17:00', available: true },
          wednesday: { start: '09:00', end: '17:00', available: true },
          thursday: { start: '09:00', end: '17:00', available: true },
          friday: { start: '09:00', end: '17:00', available: true }
        }
      });
      setIsEditing(true);
    } else {
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'staff',
        specialties: [],
        schedule: {
          monday: { start: '09:00', end: '17:00', available: true },
          tuesday: { start: '09:00', end: '17:00', available: true },
          wednesday: { start: '09:00', end: '17:00', available: true },
          thursday: { start: '09:00', end: '17:00', available: true },
          friday: { start: '09:00', end: '17:00', available: true }
        }
      });
      setIsEditing(false);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'staff',
      specialties: [],
      schedule: {
        monday: { start: '09:00', end: '17:00', available: true },
        tuesday: { start: '09:00', end: '17:00', available: true },
        wednesday: { start: '09:00', end: '17:00', available: true },
        thursday: { start: '09:00', end: '17:00', available: true },
        friday: { start: '09:00', end: '17:00', available: true }
      }
    });
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        specialties: formData.specialties || []
      };
      if (isEditing) {
        if (!submitData.password) {
          delete submitData.password; // Don't send empty password
        }
        await updateStaffUser(formData._id, submitData);
        addNotification('Staff member updated successfully', 'success');
      } else {
        await createStaffUser(submitData);
        addNotification('Staff member added successfully', 'success');
      }
      handleCloseModal();
      queryClient.invalidateQueries(['staff']);
    } catch (err) {
      addNotification(err.message || 'Failed to save staff member', 'error');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!availableRoles.includes(newRole)) {
      addNotification('Invalid role selected', 'error');
      return;
    }
    try {
      await updateUserRole(userId, newRole);
      addNotification(`User role updated to ${newRole}`, 'success');
      queryClient.invalidateQueries(['staff']);
    } catch (err) {
      addNotification(err.message || 'Failed to update user role', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) {
      return;
    }
    try {
      await deleteStaffUser(id);
      addNotification('Staff member deleted successfully', 'success');
      queryClient.invalidateQueries(['staff']);
    } catch (err) {
      addNotification(err.message || 'Failed to delete staff member', 'error');
    }
  };

  const handleScheduleChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: {
          ...prev.schedule[day],
          [field]: value
        }
      }
    }));
  };

  const handleAvailabilityChange = (day) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: {
          ...prev.schedule[day],
          available: !prev.schedule[day].available
        }
      }
    }));
  };

  const handleSpecialtyChange = (specialty) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties?.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...(prev.specialties || []), specialty]
    }));
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 bg-white dark:bg-gray-900 rounded shadow min-h-[400px] flex flex-col justify-center">
        <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400 text-center">Staff Management</h2>
        <StaffSkeleton count={5} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 bg-white dark:bg-gray-900 rounded shadow min-h-[400px] flex flex-col justify-center">
      <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400 text-center">Staff Management</h2>
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add New Staff
        </button>
      </div>
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded mb-6">
          {error.message || error}
        </div>
      )}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {staff.map(member => (
            <li key={member._id} className="px-6 py-4 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-blue-600 dark:text-blue-400">{member.username}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-300">{member.email}</p>
                  <div className="mt-2">
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member._id, e.target.value)}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      {availableRoles.map(role => (
                        <option key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </option>
                      ))}
                    </select>
                    {member.specialties?.map(specialty => (
                      <span
                        key={specialty}
                        className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-300">
                    <h4 className="font-medium text-gray-700 dark:text-gray-100">Schedule:</h4>
                    {Object.entries(member.schedule || {}).map(([day, hours]) => (
                      <div key={day} className="ml-2">
                        <span className="capitalize">{day}:</span>{' '}
                        {hours.available ? `${hours.start} - ${hours.end}` : 'Not available'}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleOpenModal(member)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(member._id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <Modal
        isOpen={modalOpen}
        onRequestClose={handleCloseModal}
        className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4"
        contentLabel="Staff Member Modal"
      >
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4">
            {isEditing ? 'Edit Staff Member' : 'Add New Staff Member'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                required={!isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              >
                {availableRoles.map(role => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Specialties</label>
              <div className="mt-2 space-y-2">
                {availableSpecialties.map(specialty => (
                  <label key={specialty} className="inline-flex items-center mr-4">
                    <input
                      type="checkbox"
                      checked={formData.specialties?.includes(specialty)}
                      onChange={() => handleSpecialtyChange(specialty)}
                      className="rounded border-gray-300 dark:border-gray-700 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-200">{specialty}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Schedule</label>
              <div className="mt-2 space-y-2">
                {Object.entries(formData.schedule).map(([day, hours]) => (
                  <div key={day} className="flex items-center space-x-2">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={hours.available}
                        onChange={() => handleAvailabilityChange(day)}
                        className="rounded border-gray-300 dark:border-gray-700 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-200 capitalize">{day}</span>
                    </label>
                    {hours.available && (
                      <>
                        <input
                          type="time"
                          value={hours.start}
                          onChange={(e) => handleScheduleChange(day, 'start', e.target.value)}
                          className="rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                        />
                        <span>to</span>
                        <input
                          type="time"
                          value={hours.end}
                          onChange={(e) => handleScheduleChange(day, 'end', e.target.value)}
                          className="rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                {isEditing ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}

export default AdminStaff; 