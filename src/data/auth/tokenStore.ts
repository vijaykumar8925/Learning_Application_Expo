import * as SecureStore from 'expo-secure-store';

export const AUTH_TOKEN_KEY = 'auth_user_token';

export interface TokenStore {
  saveToken(token: string): Promise<void>;
  getToken(): Promise<string | null>;
  clearToken(): Promise<void>;
}

export class SecureTokenStore implements TokenStore {
  async saveToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED,
    });
  }

  async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  }

  async clearToken(): Promise<void> {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
  }
}

/**
 * In-memory TokenStore for headless unit testing.
 */
export class InMemoryTokenStore implements TokenStore {
  private token: string | null = null;

  async saveToken(token: string): Promise<void> {
    this.token = token;
  }

  async getToken(): Promise<string | null> {
    return this.token;
  }

  async clearToken(): Promise<void> {
    this.token = null;
  }
}
