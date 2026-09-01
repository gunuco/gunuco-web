import type { Testimonial } from '@/types';

export const seedTestimonials: Testimonial[] = [
  {
    id: 'tm_harini',
    displayName: 'Harini P.',
    quote: 'Loved the pistachio rose flavour. Will order again.',
    imageHue: 130,
    channels: ['app', 'website'],
    displayOrder: 1,
    active: true,
    sourceFeedbackId: 'fb_harini',
  },
  {
    id: 'tm_mohit',
    displayName: 'Mohit A.',
    quote: 'Wedding cake looked exactly like the reference. Guests asked who made it.',
    imageHue: 28,
    channels: ['website'],
    displayOrder: 2,
    active: false,
    sourceFeedbackId: 'fb_mohit',
  },
];
