import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addonService,
  customCakeService,
  feedbackService,
  locationService,
  offerService,
  posService,
  reportService,
  testimonialService,
} from '@/services/index';
import { queryKeys } from '@/services/queryKeys';
import { useUiStore } from '@/store/uiStore';
import type { Addon, CustomCakeRequest, Offer, Testimonial } from '@/types';

export function useAddons() {
  return useQuery({ queryKey: queryKeys.addons, queryFn: addonService.list });
}

export function useCreateAddon() {
  const client = useQueryClient();
  const notify = useUiStore((s) => s.notify);
  return useMutation({
    mutationFn: addonService.create,
    onSuccess: () => {
      notify('Add-on created');
      void client.invalidateQueries({ queryKey: queryKeys.addons });
    },
    onError: (err: Error) => notify(err.message || 'Could not create add-on', 'error'),
  });
}

export function useUpdateAddon() {
  const client = useQueryClient();
  const notify = useUiStore((s) => s.notify);
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Addon> }) =>
      addonService.update(id, payload),
    onSuccess: () => {
      notify('Add-on updated');
      void client.invalidateQueries({ queryKey: queryKeys.addons });
    },
    onError: (err: Error) => notify(err.message || 'Could not update add-on', 'error'),
  });
}

export function useLocations() {
  return useQuery({ queryKey: queryKeys.locations, queryFn: locationService.list });
}

export function useCustomCakes() {
  return useQuery({ queryKey: queryKeys.customCakes, queryFn: customCakeService.list });
}

export function useCreateCustomCake() {
  const client = useQueryClient();
  const notify = useUiStore((s) => s.notify);
  return useMutation({
    mutationFn: customCakeService.create,
    onSuccess: () => {
      notify('Custom cake enquiry added');
      void client.invalidateQueries({ queryKey: queryKeys.customCakes });
      void client.invalidateQueries({ queryKey: queryKeys.dashboard.root });
    },
    onError: (err: Error) => notify(err.message || 'Could not add enquiry', 'error'),
  });
}

export function useUpdateCustomCake() {
  const client = useQueryClient();
  const notify = useUiStore((s) => s.notify);
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CustomCakeRequest> }) =>
      customCakeService.update(id, payload),
    onSuccess: () => {
      notify('Enquiry updated');
      void client.invalidateQueries({ queryKey: queryKeys.customCakes });
    },
    onError: (err: Error) => notify(err.message || 'Could not update enquiry', 'error'),
  });
}

export function useDeleteCustomCake() {
  const client = useQueryClient();
  const notify = useUiStore((s) => s.notify);
  return useMutation({
    mutationFn: customCakeService.remove,
    onSuccess: () => {
      notify('Enquiry deleted');
      void client.invalidateQueries({ queryKey: queryKeys.customCakes });
      void client.invalidateQueries({ queryKey: queryKeys.dashboard.root });
    },
    onError: (err: Error) => notify(err.message || 'Could not delete enquiry', 'error'),
  });
}

export function useOffers() {
  return useQuery({ queryKey: queryKeys.offers, queryFn: offerService.list });
}

export function useCreateOffer() {
  const client = useQueryClient();
  const notify = useUiStore((s) => s.notify);
  return useMutation({
    mutationFn: offerService.create,
    onSuccess: () => {
      notify('Offer created');
      void client.invalidateQueries({ queryKey: queryKeys.offers });
    },
    onError: (err: Error) => notify(err.message || 'Could not create offer', 'error'),
  });
}

export function useUpdateOffer() {
  const client = useQueryClient();
  const notify = useUiStore((s) => s.notify);
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Offer> }) =>
      offerService.update(id, payload),
    onSuccess: () => {
      notify('Offer updated');
      void client.invalidateQueries({ queryKey: queryKeys.offers });
    },
    onError: (err: Error) => notify(err.message || 'Could not update offer', 'error'),
  });
}

export function useDeleteOffer() {
  const client = useQueryClient();
  const notify = useUiStore((s) => s.notify);
  return useMutation({
    mutationFn: offerService.remove,
    onSuccess: () => {
      notify('Offer deleted');
      void client.invalidateQueries({ queryKey: queryKeys.offers });
    },
    onError: (err: Error) => notify(err.message || 'Could not delete offer', 'error'),
  });
}

export function useFeedback() {
  return useQuery({ queryKey: queryKeys.feedback, queryFn: feedbackService.list });
}

export function useApproveFeedback() {
  const client = useQueryClient();
  const notify = useUiStore((s) => s.notify);
  return useMutation({
    mutationFn: ({ id, moderator }: { id: string; moderator: string }) =>
      feedbackService.approve(id, moderator),
    onSuccess: (result) => {
      notify(
        result.testimonial
          ? 'Approved — message is on the home page'
          : 'Approved internally. No home-page quote (customer did not consent).',
      );
      void client.invalidateQueries({ queryKey: queryKeys.feedback });
      void client.invalidateQueries({ queryKey: queryKeys.testimonials });
    },
    onError: (err: Error) => notify(err.message || 'Could not approve', 'error'),
  });
}

export function useRejectFeedback() {
  const client = useQueryClient();
  const notify = useUiStore((s) => s.notify);
  return useMutation({
    mutationFn: ({ id, moderator }: { id: string; moderator: string }) =>
      feedbackService.reject(id, moderator),
    onSuccess: () => {
      notify('Rejected — hidden from the home page');
      void client.invalidateQueries({ queryKey: queryKeys.feedback });
      void client.invalidateQueries({ queryKey: queryKeys.testimonials });
    },
    onError: (err: Error) => notify(err.message || 'Could not reject', 'error'),
  });
}

export function useTestimonials() {
  return useQuery({ queryKey: queryKeys.testimonials, queryFn: testimonialService.list });
}

export function useUpdateTestimonial() {
  const client = useQueryClient();
  const notify = useUiStore((s) => s.notify);
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Testimonial> }) =>
      testimonialService.update(id, payload),
    onSuccess: (_data, vars) => {
      if (vars.payload.active === false && Object.keys(vars.payload).length === 1) {
        notify('Hidden from the home page');
      } else if (vars.payload.active === true && Object.keys(vars.payload).length === 1) {
        notify('Visible on the home page');
      } else {
        notify('Testimonial updated');
      }
      void client.invalidateQueries({ queryKey: queryKeys.testimonials });
    },
    onError: (err: Error) => notify(err.message || 'Could not update testimonial', 'error'),
  });
}

export function useDeleteTestimonial() {
  const client = useQueryClient();
  const notify = useUiStore((s) => s.notify);
  return useMutation({
    mutationFn: testimonialService.remove,
    onSuccess: () => {
      notify('Testimonial deleted');
      void client.invalidateQueries({ queryKey: queryKeys.testimonials });
    },
    onError: (err: Error) => notify(err.message || 'Could not delete testimonial', 'error'),
  });
}

export function useReports() {
  return useQuery({ queryKey: queryKeys.reports, queryFn: reportService.summary });
}

export function useCheckout() {
  const notify = useUiStore((s) => s.notify);
  return useMutation({
    mutationFn: posService.checkout,
    onSuccess: (order) => notify(`POS ${order.orderNumber} paid`),
    onError: (err: Error) => notify(err.message || 'Checkout failed', 'error'),
  });
}
