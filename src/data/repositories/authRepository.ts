import { Clock, defaultClock } from '../../core/config';
import { InvalidCredentialsError } from '../../core/errors';
import { LoginCredentials, User } from '../../domain/models';
import { AuthRepository } from '../../domain/repositories';
import { TokenStore } from '../auth/tokenStore';

export const DEMO_CREDENTIALS: LoginCredentials = {
  email: 'demo@learning.com',
  password: 'password123',
};

export class AppAuthRepository implements AuthRepository {
  constructor(
    private readonly tokenStore: TokenStore,
    private readonly clock: Clock = defaultClock,
    private readonly simulatedAuthDelayMs: number = 1000,
  ) {}

  async login(credentials: LoginCredentials): Promise<User> {
    await this.clock.delay(this.simulatedAuthDelayMs);

    const isEmailMatch =
      credentials.email.trim().toLowerCase() === DEMO_CREDENTIALS.email.toLowerCase();
    const isPasswordMatch = credentials.password === DEMO_CREDENTIALS.password;

    if (!isEmailMatch || !isPasswordMatch) {
      throw new InvalidCredentialsError('Invalid email or password.');
    }

    const fakeToken = `fake_jwt_token_${Date.now()}_user_learning`;
    await this.tokenStore.saveToken(fakeToken);

    return {
      email: credentials.email.trim(),
      token: fakeToken,
    };
  }

  async logout(): Promise<void> {
    await this.tokenStore.clearToken();
  }

  async getToken(): Promise<string | null> {
    return await this.tokenStore.getToken();
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null && token.length > 0;
  }
}
