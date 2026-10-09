import { axiosClient } from '../../../shared';
import type { User } from '../../../shared';
import type { LoginSchema, RegisterSchema } from '../../../shared/schemas';

/**
 * Authentication and identity management API service client.
 * Manages user credential verification, session creation, token renewal, and profile queries.
 */
export const accountApi = {
  /**
   * Authenticates user with credentials and issues session tokens.
   * @param {LoginSchema} creds - Email address and password payload.
   * @returns {Promise<User>} Resolves to authenticated user profile with JWT access token.
   */
  login: async (creds: LoginSchema): Promise<User> => {
    const response = await axiosClient.post<any>('/account/login', creds);
    return response.data?.data ?? response.data;
  },

  /**
   * Registers a new developer profile on the platform.
   * @param {RegisterSchema} creds - User registration form payload.
   * @returns {Promise<User>} Resolves to created user profile and initial session token.
   */
  register: async (creds: RegisterSchema): Promise<User> => {
    const response = await axiosClient.post<any>('/account/register', creds);
    return response.data?.data ?? response.data;
  },

  /**
   * Resolves the profile of the currently authenticated developer using stored session token.
   * @returns {Promise<User | null>} Resolves to user profile if session is active, or null if unauthenticated.
   */
  currentUser: async (): Promise<User | null> => {
    try {
      const response = await axiosClient.get<any>('/account');
      return response.data?.data ?? response.data;
    } catch {
      return null;
    }
  },

  /**
   * Terminates active user session and requests server-side token revocation.
   * @returns {Promise<void>} Resolves when session is cleared.
   */
  logout: async (): Promise<void> => {
    try {
      await axiosClient.post('/account/logout');
    } catch {
      // Ignore network errors during session termination
    }
  },
};
