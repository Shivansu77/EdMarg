exports.validateEmail = (email) => {
  const normalizedEmail = String(email || '').toLowerCase().trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new Error('Invalid email format');
  }

  return normalizedEmail;
};

exports.validatePassword = (password) => {
  if (password.length < 4) {
    throw new Error('Password must be at least 4 characters');
  }
  if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    throw new Error('Password must contain uppercase and numbers');
  }
  return password;
};

exports.validatePhoneNumber = (phone) => {
  if (!phone) {
    return phone;
  }

  const digits = String(phone).replace(/\D/g, '');
  if (digits.length !== 10) {
    throw new Error('Phone number must be exactly 10 digits');
  }
  return digits;
};
