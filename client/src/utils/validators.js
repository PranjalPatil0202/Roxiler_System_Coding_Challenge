// Client-side validation matching backend Sequelize and express-validator rules

export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>_\-\\\/\[\]~`+=]).{8,16}$/;

/**
 * Validate user or store name (20-60 characters)
 */
export const validateName = (name) => {
  if (!name || typeof name !== 'string') return 'Name is required';
  const trimmed = name.trim();
  if (trimmed.length < 20) return 'Name must be at least 20 characters long';
  if (trimmed.length > 60) return 'Name cannot exceed 60 characters';
  return null;
};

/**
 * Validate address (max 400 characters)
 */
export const validateAddress = (address, isRequired = false) => {
  if (!address && isRequired) return 'Address is required';
  if (address && address.length > 400) return 'Address cannot exceed 400 characters';
  return null;
};

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return 'Email is required';
  if (!emailRegex.test(email.trim())) return 'Please provide a valid email address';
  return null;
};

/**
 * Validate password requirements (8-16 chars, 1 uppercase, 1 special char)
 */
export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (password.length > 16) return 'Password cannot exceed 16 characters';
  if (!/[A-Z]/.test(password)) return 'Password must include at least one uppercase letter (A-Z)';
  if (!/[!@#$%^&*(),.?":{}|<>_\-\\\/\[\]~`+=]/.test(password)) {
    return 'Password must include at least one special character';
  }
  return null;
};

/**
 * Get password criteria checklist status for live UI feedback
 */
export const getPasswordCriteria = (password = '') => {
  return [
    {
      id: 'length',
      label: 'Between 8 and 16 characters',
      met: password.length >= 8 && password.length <= 16,
    },
    {
      id: 'uppercase',
      label: 'At least one uppercase letter (A-Z)',
      met: /[A-Z]/.test(password),
    },
    {
      id: 'special',
      label: 'At least one special character (!@#$%^&*)',
      met: /[!@#$%^&*(),.?":{}|<>_\-\\\/\[\]~`+=]/.test(password),
    },
  ];
};
