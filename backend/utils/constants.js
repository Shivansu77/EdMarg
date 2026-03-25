const ROLES = {
  STUDENT: 'student',
  MENTOR: 'mentor',
  ADMIN: 'admin',
};

const APPROVAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 50,
};

const JWT_CONFIG = {
  EXPIRES_IN: '24h',
};

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 24 * 60 * 60 * 1000,
};

module.exports = {
  ROLES,
  APPROVAL_STATUS,
  PAGINATION,
  JWT_CONFIG,
  COOKIE_OPTIONS,
};
