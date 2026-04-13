export const getRoleDashboardPath = (role?: string | null) => {
  if (role === 'admin') {
    return '/admin/dashboard';
  }

  if (role === 'mentor') {
    return '/mentor/dashboard';
  }

  if (role === 'student') {
    return '/student/dashboard';
  }

  return '/dashboard';
};

export const getSafePostAuthPath = (
  candidatePath: string | null | undefined,
  fallbackPath: string
) => {
  if (!candidatePath) {
    return fallbackPath;
  }

  const path = candidatePath.trim(); // ✅ fixed

  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) {
    return fallbackPath;
  }

  const pathnameOnly = (path.split('?')[0] || '')
    .toLowerCase()
    .replace(/\/+$/, '');

  if (pathnameOnly === '/login' || pathnameOnly === '/signup') {
    return fallbackPath;
  }

  return path; // ✅ now inside correct scope
};