export const validatePhone = (phone) => {
  const phoneRegex = /^\+?[\d\s-]{10,}$/;
  return phoneRegex.test(phone);
};

export const validateDate = (date) => {
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check if date is in the future
  if (selectedDate < today) {
    return false;
  }
  
  // Check if date is within next 3 months
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
  
  return selectedDate <= threeMonthsFromNow;
};

export const validateTime = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  
  // Check if time is between 9 AM and 5 PM
  return hours >= 9 && hours < 17;
};

export const validateBookingForm = (form) => {
  const errors = {};

  if (!form.patientName.trim()) {
    errors.patientName = 'Name is required';
  }

  if (!form.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = 'Email is invalid';
  }

  if (!form.phone.trim()) {
    errors.phone = 'Phone number is required';
  } else if (!validatePhone(form.phone)) {
    errors.phone = 'Phone number is invalid';
  }

  if (!form.date) {
    errors.date = 'Date is required';
  } else if (!validateDate(form.date)) {
    errors.date = 'Please select a valid date (today to 3 months from now)';
  }

  if (!form.time) {
    errors.time = 'Time is required';
  } else if (!validateTime(form.time)) {
    errors.time = 'Please select a time between 9 AM and 5 PM';
  }

  if (!form.service) {
    errors.service = 'Service is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}; 