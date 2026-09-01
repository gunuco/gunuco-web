import { apiClient } from '@/services/apiClient';
import { ENDPOINTS } from '@/services/endpoints';
import type { Addon, CustomCakeRequest, FeedbackItem, Location, Offer, Order, Testimonial } from '@/types';

export const addonService = {
  list: async () => (await apiClient.get<Addon[]>(ENDPOINTS.addons)).data,
  create: async (payload: Partial<Addon>) =>
    (await apiClient.post<Addon>(ENDPOINTS.addons, payload)).data,
  update: async (id: string, payload: Partial<Addon>) =>
    (await apiClient.patch<Addon>(ENDPOINTS.addon(id), payload)).data,
};

export const locationService = {
  list: async () => (await apiClient.get<Location[]>(ENDPOINTS.locations)).data,
};

export const customCakeService = {
  list: async () => (await apiClient.get<CustomCakeRequest[]>(ENDPOINTS.customCakes)).data,
  create: async (payload: Partial<CustomCakeRequest>) =>
    (await apiClient.post<CustomCakeRequest>(ENDPOINTS.customCakes, payload)).data,
  update: async (id: string, payload: Partial<CustomCakeRequest>) =>
    (await apiClient.patch<CustomCakeRequest>(ENDPOINTS.customCake(id), payload)).data,
  remove: async (id: string) =>
    (await apiClient.delete<CustomCakeRequest>(ENDPOINTS.customCake(id))).data,
};

export const offerService = {
  list: async () => (await apiClient.get<Offer[]>(ENDPOINTS.offers)).data,
  create: async (payload: Partial<Offer>) =>
    (await apiClient.post<Offer>(ENDPOINTS.offers, payload)).data,
  update: async (id: string, payload: Partial<Offer>) =>
    (await apiClient.patch<Offer>(ENDPOINTS.offer(id), payload)).data,
  remove: async (id: string) =>
    (await apiClient.delete<Offer>(ENDPOINTS.offer(id))).data,
};

export const feedbackService = {
  list: async () => (await apiClient.get<FeedbackItem[]>(ENDPOINTS.feedback)).data,
  approve: async (id: string, moderator: string) =>
    (
      await apiClient.post<{ feedback: FeedbackItem; testimonial: Testimonial | null }>(
        ENDPOINTS.feedbackApprove(id),
        { moderator },
      )
    ).data,
  reject: async (id: string, moderator: string) =>
    (await apiClient.post<FeedbackItem>(ENDPOINTS.feedbackReject(id), { moderator })).data,
};

export const testimonialService = {
  list: async () => (await apiClient.get<Testimonial[]>(ENDPOINTS.testimonials)).data,
  update: async (id: string, payload: Partial<Testimonial>) =>
    (await apiClient.patch<Testimonial>(ENDPOINTS.testimonial(id), payload)).data,
  remove: async (id: string) =>
    (await apiClient.delete<Testimonial>(ENDPOINTS.testimonial(id))).data,
};

export const posService = {
  checkout: async (payload: Record<string, unknown>) =>
    (await apiClient.post<Order>(ENDPOINTS.posCheckout, payload)).data,
};

export const reportService = {
  summary: async () =>
    (
      await apiClient.get<{ orders: number; revenue: number; aov: number; delivered: number }>(
        ENDPOINTS.reportsSummary,
      )
    ).data,
};

export { authService } from '@/services/authService';

export { deliveryService } from '@/services/deliveryService';
export { orderService } from '@/services/orderService';
export { catalogService } from '@/services/catalogService';
export { categoryService } from '@/services/categoryService';
export { dashboardService } from '@/services/dashboardService';
