/**
 * Core application error classes and user message conversion.
 */

export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NetworkError extends AppError {
  constructor(message = 'Network connection failed. Please check your internet.') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class InvalidCredentialsError extends AppError {
  constructor(message = 'Invalid email or password.') {
    super(message);
    this.name = 'InvalidCredentialsError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'The requested resource was not found.') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class UnknownError extends AppError {
  constructor(message = 'An unexpected error occurred.') {
    super(message);
    this.name = 'UnknownError';
  }
}

/**
 * Maps typed or generic errors to human-friendly messages for the UI.
 */
export function toUserMessage(error: unknown): string {
  if (error instanceof NetworkError) {
    return error.message || 'Network connection failed. Showing offline data if available.';
  }
  if (error instanceof InvalidCredentialsError) {
    return 'Invalid email or password. Please verify and try again.';
  }
  if (error instanceof NotFoundError) {
    return error.message || 'The requested item was not found.';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
}

export type Result<T, E = AppError> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}
