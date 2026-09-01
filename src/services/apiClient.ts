import axios, { type AxiosRequestConfig } from 'axios';
import type { ApiMeta, ApiResponse } from '@/types';

/**
 * Axios instance shared by every service.
 *
 * Mock → real backend:
 *   VITE_USE_MOCK=false
 *   VITE_API_BASE_URL=https://api.gunuco.example/v1
 *
 * The envelope { success, data, message, meta } stays identical.
 */
const useMock = import.meta.env.VITE_USE_MOCK !== 'false';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

if (useMock) {
  axiosInstance.defaults.adapter = async (config) => {
    const { mockAdapter } = await import('@/mocks/adapter');
    return mockAdapter(config);
  };
}

axiosInstance.interceptors.request.use((config) => {
  const raw = localStorage.getItem('gunuco-auth');
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as { state?: { token?: string } };
      if (parsed.state?.token) {
        config.headers.Authorization = `Bearer ${parsed.state.token}`;
      }
    } catch {
      /* ignore */
    }
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const err = error as { response?: { data?: { message?: string } }; message?: string };
    return Promise.reject(new Error(err.response?.data?.message ?? err.message ?? 'Request failed'));
  },
);

interface Unwrapped<T> {
  data: T;
  meta?: ApiMeta;
  message: string;
}

async function unwrap<T>(request: Promise<{ data: ApiResponse<T> }>): Promise<Unwrapped<T>> {
  const res = await request;
  const body = res.data;
  if (!body?.success) {
    throw new Error(body?.message ?? 'Request failed');
  }
  return { data: body.data, meta: body.meta, message: body.message };
}

export const apiClient = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    unwrap<T>(axiosInstance.get<ApiResponse<T>>(url, config)),
  post: <T>(url: string, payload?: unknown, config?: AxiosRequestConfig) =>
    unwrap<T>(axiosInstance.post<ApiResponse<T>>(url, payload, config)),
  patch: <T>(url: string, payload?: unknown, config?: AxiosRequestConfig) =>
    unwrap<T>(axiosInstance.patch<ApiResponse<T>>(url, payload, config)),
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    unwrap<T>(axiosInstance.delete<ApiResponse<T>>(url, config)),
};

/** @deprecated Use apiClient — kept so older imports keep compiling during the cutover. */
export const api = axiosInstance;
