/**
 * Pure validation functions for authentication and user inputs.
 */

import { LoginCredentials } from './models';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) {
    return 'Email is required.';
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return 'Please enter a valid email address.';
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) {
    return 'Password is required.';
  }
  if (password.length < 6) {
    return 'Password must be at least 6 characters.';
  }
  return null;
}

export interface ValidationResult {
  readonly isValid: boolean;
  readonly emailError: string | null;
  readonly passwordError: string | null;
}

export function validateLoginCredentials(credentials: LoginCredentials): ValidationResult {
  const emailError = validateEmail(credentials.email);
  const passwordError = validatePassword(credentials.password);

  return {
    isValid: emailError === null && passwordError === null,
    emailError,
    passwordError,
  };
}
