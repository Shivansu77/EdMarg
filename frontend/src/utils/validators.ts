export const validators = {
  email: (email: unknown): boolean => {
    if (typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  password: (password: unknown): { valid: boolean; errors: string[] } => {
    const normalized = typeof password === 'string' ? password : '';
    const errors: string[] = [];

    if (normalized.length < 4) {
      errors.push('Password must be at least 4 characters');
    }
    if (!/[A-Z]/.test(normalized)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(normalized)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(normalized)) {
      errors.push('Password must contain at least one number');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  phone: (phone: unknown): boolean => {
    if (phone === null || phone === undefined || phone === '') return true;
    if (typeof phone !== 'string') return false;
    if (!phone) return true;
    const digits = phone.replace(/\D/g, '');
    return /^\d{10}$/.test(digits);
  },

  name: (name: unknown): boolean => {
    if (typeof name !== 'string') return false;
    return name.trim().length >= 2 && name.trim().length <= 100;
  },

  url: (url: unknown): boolean => {
    if (typeof url !== 'string' || !url.trim()) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  required: (value: unknown): boolean => {
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value !== null && value !== undefined;
  },

  minLength: (value: unknown, min: number): boolean => {
    if (typeof value !== 'string') return false;
    return value.trim().length >= min;
  },

  maxLength: (value: unknown, max: number): boolean => {
    if (typeof value !== 'string') return false;
    return value.trim().length <= max;
  },

  match: (value1: unknown, value2: unknown): boolean => {
    return String(value1 ?? '') === String(value2 ?? '');
  },
};

export const validateForm = (
  data: Record<string, unknown>,
  rules: Record<string, (value: unknown) => boolean | { valid: boolean; errors: string[] }>
): { valid: boolean; errors: Record<string, string[]> } => {
  const errors: Record<string, string[]> = {};

  Object.entries(rules).forEach(([field, rule]) => {
    try {
      const result = rule(data[field]);

      if (typeof result === 'boolean') {
        if (!result) {
          errors[field] = [`${field} is invalid`];
        }
      } else if (!result.valid) {
        errors[field] = result.errors;
      }
    } catch {
      errors[field] = [`${field} is invalid`];
    }
  });

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};
