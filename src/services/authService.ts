import { apiClient } from '@/services/apiClient';
import { ENDPOINTS } from '@/services/endpoints';
import type { AuthUser } from '@/types';

export const authService = {
  login: async (email: string, password: string) =>
    (await apiClient.post<AuthUser>(ENDPOINTS.auth.login, { email, password })).data,
};
