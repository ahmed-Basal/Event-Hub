import { axiosClient } from '../../../shared';
import type { User } from '../../../shared';
import type { LoginSchema, RegisterSchema } from '../../../shared/schemas';

export const accountApi = {
  login: async (creds: LoginSchema): Promise<User> => {
    const response = await axiosClient.post<any>('/account/login', creds);
    return response.data?.data ?? response.data;
  },

  register: async (creds: RegisterSchema): Promise<User> => {
    const response = await axiosClient.post<any>('/account/register', creds);
    return response.data?.data ?? response.data;
  },

  currentUser: async (): Promise<User | null> => {
    try {
      const response = await axiosClient.get<any>('/account');
      return response.data?.data ?? response.data;
    } catch {
      return null;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await axiosClient.post('/account/logout');
    } catch {
      // Ignore if server is unreachable
    }
  },
};
