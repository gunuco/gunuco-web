import { create } from 'zustand';
import { APP_CONFIG } from '@/config/app.config';

export interface DeliveryBand {
  id: string;
  fromKm: number;
  toKm: number;
  fee: number;
  label: string;
  active: boolean;
}

export interface ServicePin {
  id: string;
  label: string;
  lat: number;
  lng: number;
  radiusKm: number;
  active: boolean;
}

interface FulfilmentState {
  pickupEnabled: boolean;
  doorstepEnabled: boolean;
  nationwideEnabled: boolean;
  cityCookiesEnabled: boolean;
  allIndiaCookiesEnabled: boolean;
  customCakeExempt: boolean;
  maxDoorstepKm: number;
  minOrderFreeDelivery: number;
  peakSurchargePct: number;
  pickupBufferMins: number;
  sameDayCutoff: string;
  store: { lat: number; lng: number; label: string };
  pins: ServicePin[];
  bands: DeliveryBand[];
  selectedPinId: string | null;
  setPickup: (value: boolean) => void;
  setDoorstep: (value: boolean) => void;
  setNationwide: (value: boolean) => void;
  setCityCookies: (value: boolean) => void;
  setAllIndiaCookies: (value: boolean) => void;
  setCustomCakeExempt: (value: boolean) => void;
  setMaxDoorstepKm: (value: number) => void;
  setMinOrderFreeDelivery: (value: number) => void;
  setPeakSurchargePct: (value: number) => void;
  setPickupBufferMins: (value: number) => void;
  setSameDayCutoff: (value: string) => void;
  setStorePin: (lat: number, lng: number) => void;
  addPin: (pin: Omit<ServicePin, 'id'>) => void;
  updatePin: (id: string, patch: Partial<ServicePin>) => void;
  removePin: (id: string) => void;
  selectPin: (id: string | null) => void;
  saveBand: (band: DeliveryBand) => void;
  removeBand: (id: string) => void;
}

const initialBands: DeliveryBand[] = APP_CONFIG.deliveryBands.map((band, index) => ({
  id: `band_${index + 1}`,
  fromKm: band.fromKm,
  toKm: band.toKm,
  fee: band.fee,
  label: band.label,
  active: true,
}));

export const STORE_ORIGIN = { lat: 16.5062, lng: 80.648, label: APP_CONFIG.locationName };

export const useFulfilmentStore = create<FulfilmentState>((set) => ({
  pickupEnabled: true,
  doorstepEnabled: true,
  nationwideEnabled: false,
  cityCookiesEnabled: true,
  allIndiaCookiesEnabled: false,
  customCakeExempt: APP_CONFIG.customCakeDeliveryExempt,
  maxDoorstepKm: APP_CONFIG.maxDoorstepKm,
  minOrderFreeDelivery: 0,
  peakSurchargePct: 0,
  pickupBufferMins: 20,
  sameDayCutoff: '18:00',
  store: STORE_ORIGIN,
  pins: [
    {
      id: 'pin_store',
      label: 'Production house',
      lat: STORE_ORIGIN.lat,
      lng: STORE_ORIGIN.lng,
      radiusKm: APP_CONFIG.maxDoorstepKm,
      active: true,
    },
  ],
  bands: initialBands,
  selectedPinId: 'pin_store',
  setPickup: (pickupEnabled) => set({ pickupEnabled }),
  setDoorstep: (doorstepEnabled) => set({ doorstepEnabled }),
  setNationwide: (nationwideEnabled) => set({ nationwideEnabled }),
  setCityCookies: (cityCookiesEnabled) => set({ cityCookiesEnabled }),
  setAllIndiaCookies: (allIndiaCookiesEnabled) => set({ allIndiaCookiesEnabled }),
  setCustomCakeExempt: (customCakeExempt) => set({ customCakeExempt }),
  setMaxDoorstepKm: (maxDoorstepKm) =>
    set((state) => ({
      maxDoorstepKm,
      pins: state.pins.map((pin) => (pin.id === 'pin_store' ? { ...pin, radiusKm: maxDoorstepKm } : pin)),
    })),
  setMinOrderFreeDelivery: (minOrderFreeDelivery) => set({ minOrderFreeDelivery }),
  setPeakSurchargePct: (peakSurchargePct) => set({ peakSurchargePct }),
  setPickupBufferMins: (pickupBufferMins) => set({ pickupBufferMins }),
  setSameDayCutoff: (sameDayCutoff) => set({ sameDayCutoff }),
  setStorePin: (lat, lng) =>
    set((state) => ({
      store: { ...state.store, lat, lng },
      pins: state.pins.map((pin) => (pin.id === 'pin_store' ? { ...pin, lat, lng } : pin)),
    })),
  addPin: (pin) =>
    set((state) => {
      const id = `pin_${Date.now()}`;
      return { pins: [...state.pins, { ...pin, id }], selectedPinId: id };
    }),
  updatePin: (id, patch) =>
    set((state) => ({
      pins: state.pins.map((pin) => (pin.id === id ? { ...pin, ...patch } : pin)),
      store: id === 'pin_store' && (patch.lat != null || patch.lng != null)
        ? { ...state.store, lat: patch.lat ?? state.store.lat, lng: patch.lng ?? state.store.lng }
        : state.store,
      maxDoorstepKm: id === 'pin_store' && patch.radiusKm != null ? patch.radiusKm : state.maxDoorstepKm,
    })),
  removePin: (id) =>
    set((state) => {
      if (id === 'pin_store') return state;
      return {
        pins: state.pins.filter((pin) => pin.id !== id),
        selectedPinId: state.selectedPinId === id ? 'pin_store' : state.selectedPinId,
      };
    }),
  selectPin: (selectedPinId) => set({ selectedPinId }),
  saveBand: (band) =>
    set((state) => {
      const exists = state.bands.some((row) => row.id === band.id);
      const bands = exists ? state.bands.map((row) => (row.id === band.id ? band : row)) : [...state.bands, band];
      return { bands: bands.sort((a, b) => a.fromKm - b.fromKm) };
    }),
  removeBand: (id) => set((state) => ({ bands: state.bands.filter((row) => row.id !== id) })),
}));
