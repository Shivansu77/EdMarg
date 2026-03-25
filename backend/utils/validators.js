const validator = require('validator');

exports.validateEmail = (email) => {
  if (!validator.isEmail(email)) {
    throw new Error('Invalid email format');
  }
  return email.toLowerCase().trim();
};

exports.validatePassword = (password) => {
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    throw new Error('Password must contain uppercase and numbers');
  }
  return password;
};

exports.validatePhoneNumber = (phone) => {
  if (phone && !validator.isMobilePhone(phone)) {
    throw new Error('Invalid phone number');
  }
  return phone;
};
