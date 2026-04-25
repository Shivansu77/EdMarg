export interface AuthProfileUser {
  role?: 'student' | 'mentor' | 'admin' | string | null;
  phoneNumber?: string | null;
  studentProfile?: {
    classLevel?: string | null;
    interests?: string[] | null;
  } | null;
  mentorProfile?: {
    linkedinUrl?: string | null;
    expertise?: string[] | null;
    approvalStatus?: 'pending' | 'approved' | 'rejected' | string | null;
  } | null;
}

const hasText = (value?: string | null) => Boolean(value && value.trim());

const hasItems = (value?: string[] | null) => Array.isArray(value) && value.length > 0;

export const isProfileComplete = (user?: AuthProfileUser | null) => {
  if (!user?.role) {
    return false;
  }

  if (user.role === 'admin') {
    return true;
  }

  if (user.role === 'student') {
    return hasText(user.studentProfile?.classLevel);
  }

  if (user.role === 'mentor') {
    return hasText(user.mentorProfile?.linkedinUrl) && hasItems(user.mentorProfile?.expertise);
  }

  return false;
};

export const getDefaultAuthenticatedPath = (user?: AuthProfileUser | null) => {
  if (!user?.role) {
    return '/login';
  }

  if (!isProfileComplete(user)) {
    return '/complete-profile';
  }

  if (user.role === 'admin') {
    return '/admin/dashboard';
  }

  if (user.role === 'mentor') {
    return user.mentorProfile?.approvalStatus === 'approved'
      ? '/mentor/dashboard'
      : '/mentor/profile';
  }

  if (user.role === 'student') {
    return '/student/dashboard';
  }

  return '/dashboard';
};
