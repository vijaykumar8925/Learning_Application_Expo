import { instantClock } from '../../src/core/config';
import { InvalidCredentialsError } from '../../src/core/errors';
import { InMemoryTokenStore } from '../../src/data/auth/tokenStore';
import {
  AppAuthRepository,
  DEMO_CREDENTIALS,
} from '../../src/data/repositories/authRepository';

describe('AppAuthRepository', () => {
  let tokenStore: InMemoryTokenStore;
  let authRepository: AppAuthRepository;

  beforeEach(() => {
    tokenStore = new InMemoryTokenStore();
    // Using instantClock with 0ms delay for fast test execution
    authRepository = new AppAuthRepository(tokenStore, instantClock, 0);
  });

  it('authenticates demo credentials successfully and stores token', async () => {
    expect(await authRepository.isAuthenticated()).toBe(false);

    const user = await authRepository.login({
      email: DEMO_CREDENTIALS.email,
      password: DEMO_CREDENTIALS.password,
    });

    expect(user.email).toBe(DEMO_CREDENTIALS.email);
    expect(user.token).toBeDefined();
    expect(await authRepository.isAuthenticated()).toBe(true);
    expect(await authRepository.getToken()).toBe(user.token);
  });

  it('rejects invalid password with InvalidCredentialsError and saves no token', async () => {
    await expect(
      authRepository.login({
        email: DEMO_CREDENTIALS.email,
        password: 'wrong_password',
      }),
    ).rejects.toThrow(InvalidCredentialsError);

    expect(await authRepository.isAuthenticated()).toBe(false);
    expect(await tokenStore.getToken()).toBeNull();
  });

  it('rejects unrecognized email address', async () => {
    await expect(
      authRepository.login({
        email: 'other@example.com',
        password: DEMO_CREDENTIALS.password,
      }),
    ).rejects.toThrow(InvalidCredentialsError);

    expect(await authRepository.isAuthenticated()).toBe(false);
  });

  it('clears token on logout', async () => {
    await authRepository.login({
      email: DEMO_CREDENTIALS.email,
      password: DEMO_CREDENTIALS.password,
    });
    expect(await authRepository.isAuthenticated()).toBe(true);

    await authRepository.logout();
    expect(await authRepository.isAuthenticated()).toBe(false);
    expect(await tokenStore.getToken()).toBeNull();
  });
});
