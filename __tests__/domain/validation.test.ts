import {
  validateEmail,
  validateLoginCredentials,
  validatePassword,
} from '../../src/domain/validation';

describe('Validation rules', () => {
  describe('validateEmail', () => {
    it('accepts valid email addresses', () => {
      expect(validateEmail('demo@learning.com')).toBeNull();
      expect(validateEmail('user.name+tag@domain.co.uk')).toBeNull();
    });

    it('rejects empty or whitespace-only emails', () => {
      expect(validateEmail('')).toBe('Email is required.');
      expect(validateEmail('   ')).toBe('Email is required.');
    });

    it('rejects malformed email formats', () => {
      expect(validateEmail('demolearning.com')).toBe(
        'Please enter a valid email address.',
      );
      expect(validateEmail('demo@')).toBe('Please enter a valid email address.');
      expect(validateEmail('demo@domain')).toBe('Please enter a valid email address.');
    });
  });

  describe('validatePassword', () => {
    it('accepts passwords of 6 or more characters', () => {
      expect(validatePassword('123456')).toBeNull();
      expect(validatePassword('password123')).toBeNull();
    });

    it('rejects passwords shorter than 6 characters', () => {
      expect(validatePassword('12345')).toBe(
        'Password must be at least 6 characters.',
      );
      expect(validatePassword('')).toBe('Password is required.');
    });
  });

  describe('validateLoginCredentials', () => {
    it('returns isValid: true for valid credentials', () => {
      const result = validateLoginCredentials({
        email: 'demo@learning.com',
        password: 'password123',
      });
      expect(result.isValid).toBe(true);
      expect(result.emailError).toBeNull();
      expect(result.passwordError).toBeNull();
    });

    it('returns field-specific errors for invalid credentials', () => {
      const result = validateLoginCredentials({
        email: 'invalid-email',
        password: '123',
      });
      expect(result.isValid).toBe(false);
      expect(result.emailError).toBe('Please enter a valid email address.');
      expect(result.passwordError).toBe('Password must be at least 6 characters.');
    });
  });
});
