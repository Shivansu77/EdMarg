export const validators = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  password: (password: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  phone: (phone: string): boolean => {
    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },

  name: (name: string): boolean => {
    return name.trim().length >= 2 && name.trim().length <= 100;
  },

  url: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  required: (value: string | number | boolean): boolean => {
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    return value !== null && value !== undefined;
  },

  minLength: (value: string, min: number): boolean => {
    return value.length >= min;
  },

  maxLength: (value: string, max: number): boolean => {
    return value.length <= max;
  },

  match: (value1: string, value2: string): boolean => {
    return value1 === value2;
  },
};

export const validateForm = (
  data: Record<string, unknown>,
  rules: Record<string, (value: unknown) => boolean | { valid: boolean; errors: string[] }>
): { valid: boolean; errors: Record<string, string[]> } => {
  const errors: Record<string, string[]> = {};

  Object.entries(rules).forEach(([field, rule]) => {
    const result = rule(data[field]);

    if (typeof result === 'boolean') {
      if (!result) {
        errors[field] = [`${field} is invalid`];
      }
    } else if (!result.valid) {
      errors[field] = result.errors;
    }
  });

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};
