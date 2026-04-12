import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface CustomerLocation {
  city?: string;
  state?: string;
  pincode?: string;
  lat?: number;
  lng?: number;
}

interface LocationState {
  location: CustomerLocation | null;
  hasPrompted: boolean; // whether we've shown the location prompt
  setLocation: (loc: CustomerLocation) => void;
  clearLocation: () => void;
  setHasPrompted: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      location: null,
      hasPrompted: false,
      setLocation: (loc) => set({ location: loc, hasPrompted: true }),
      clearLocation: () => set({ location: null }),
      setHasPrompted: () => set({ hasPrompted: true }),
    }),
    {
      name: "harvestly-location",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
