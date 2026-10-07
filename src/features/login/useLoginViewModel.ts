import { useState, useCallback, useRef } from 'react';
import { useContainer } from '../../core/container';
import { toUserMessage } from '../../core/errors';
import { DEMO_CREDENTIALS } from '../../data/repositories/authRepository';
import {
  validateEmail,
  validateLoginCredentials,
  validatePassword,
} from '../../domain/validation';

export interface LoginUiState {
  readonly email: string;
  readonly password: string;
  readonly emailError: string | null;
  readonly passwordError: string | null;
  readonly generalError: string | null;
  readonly isLoading: boolean;
  readonly isSubmitDisabled: boolean;
}

export function useLoginViewModel() {
  const { authRepository } = useContainer();

  const [email, setEmailState] = useState('');
  const [password, setPasswordState] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Prevent concurrent submissions / double-taps
  const isSubmittingRef = useRef(false);

  const setEmail = useCallback(
    (text: string) => {
      setEmailState(text);
      setGeneralError(null);
      if (hasAttemptedSubmit) {
        setEmailError(validateEmail(text));
      }
    },
    [hasAttemptedSubmit],
  );

  const setPassword = useCallback(
    (text: string) => {
      setPasswordState(text);
      setGeneralError(null);
      if (hasAttemptedSubmit) {
        setPasswordError(validatePassword(text));
      }
    },
    [hasAttemptedSubmit],
  );

  const fillDemoCredentials = useCallback(() => {
    setEmailState(DEMO_CREDENTIALS.email);
    setPasswordState(DEMO_CREDENTIALS.password);
    setEmailError(null);
    setPasswordError(null);
    setGeneralError(null);
  }, []);

  const submit = useCallback(
    async (onSuccess: () => void): Promise<void> => {
      if (isSubmittingRef.current || isLoading) {
        return; // Guard against rapid double taps
      }

      setHasAttemptedSubmit(true);
      const validation = validateLoginCredentials({ email, password });
      setEmailError(validation.emailError);
      setPasswordError(validation.passwordError);

      if (!validation.isValid) {
        return;
      }

      isSubmittingRef.current = true;
      setIsLoading(true);
      setGeneralError(null);

      try {
        await authRepository.login({ email, password });
        // Navigation is triggered as a one-shot imperative callback
        onSuccess();
      } catch (err) {
        setGeneralError(toUserMessage(err));
      } finally {
        isSubmittingRef.current = false;
        setIsLoading(false);
      }
    },
    [authRepository, email, isLoading, password],
  );

  const uiState: LoginUiState = {
    email,
    password,
    emailError,
    passwordError,
    generalError,
    isLoading,
    isSubmitDisabled: isLoading || !email || !password,
  };

  return {
    uiState,
    setEmail,
    setPassword,
    fillDemoCredentials,
    submit,
  };
}
