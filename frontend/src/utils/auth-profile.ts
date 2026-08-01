export interface AuthProfileUser {
  role?: 'student' | 'mentor' | 'admin' | string | null;
  emailVerification?: {
    isVerified?: boolean | null;
    lastSentAt?: string | null;
    verifiedAt?: string | null;
  } | null;
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

/**
 * A mentor whose application has NOT been approved yet is effectively still
 * a student. This helper centralises that check so every routing decision
 * stays consistent.
 */
export const isEffectivelyStudent = (user?: AuthProfileUser | null): boolean =>
  Boolean(
    user &&
      (user.role === 'student' ||
        (user.role === 'mentor' &&
          user.mentorProfile?.approvalStatus !== 'approved'))
  );

export const isProfileComplete = (user?: AuthProfileUser | null) => {
  if (!user?.role) {
    return false;
  }

  if (user.role === 'admin') {
    return true;
  }

  // Pending/rejected mentors are treated as students for profile-completeness
  if (isEffectivelyStudent(user)) {
    return hasText(user.studentProfile?.classLevel);
  }

  // Approved mentors need LinkedIn + expertise
  if (user.role === 'mentor') {
     return (
      hasText(user.mentorProfile?.linkedinUrl) &&
      hasItems(user.mentorProfile?.expertise)
    );
  }

  return false;
};

export const getDefaultAuthenticatedPath = (user?: AuthProfileUser | null) => {
  if (!user?.role) {
    return '/complete-profile';
  }

  if (!isProfileComplete(user)) {
    return '/complete-profile';
  }

  if (user.role === 'admin') {
    return '/admin/dashboard';
  }

  // Approved mentors go to mentor dashboard; everyone else goes to student
  if (user.role === 'mentor') {
    return user.mentorProfile?.approvalStatus === 'approved'
      ? '/mentor/dashboard'
      : '/student/dashboard';
  }

  if (user.role === 'student') {
    return '/student/dashboard';
  }

  return '/dashboard';
};
