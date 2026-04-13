import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface CustomerLocation {
  city?: string;
  state?: string;
  pincode?: string;
  lat: number | null; // null = "coords not available"
  lng: number | null; // null = "coords not available"
}

interface LocationState {
  location: CustomerLocation | null;
  hasPrompted: boolean;
  /**
   * FIX (Bug 2): Tracks whether the Zustand persist middleware has finished
   * reading from localStorage. On the very first render (SSR + CSR before
   * hydration) this is false, so location coords are treated as unknown and
   * the query fires WITHOUT coordinates — matching the server-prefetched
   * query key exactly. Once localStorage is read, it flips to true and the
   * component re-renders with the real coordinates.
   */
  _hasHydrated: boolean;
  setLocation: (loc: CustomerLocation) => void;
  clearLocation: () => void;
  setHasPrompted: () => void;
  setHasHydrated: (val: boolean) => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      location: null,
      hasPrompted: false,
      _hasHydrated: false,
      setLocation: (loc) => set({ location: loc, hasPrompted: true }),
      clearLocation: () => set({ location: null }),
      setHasPrompted: () => set({ hasPrompted: true }),
      setHasHydrated: (val) => set({ _hasHydrated: val }),
    }),
    {
      name: "harvestly-location",
      storage: createJSONStorage(() => localStorage),
      /**
       * FIX (Bug 2): Called by Zustand after it finishes reading from
       * localStorage. We flip _hasHydrated so downstream components know
       * they can now trust location.lat / location.lng.
       */
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      /**
       * Do NOT persist _hasHydrated itself — it must always start as false
       * on a fresh page load so the hydration guard works correctly.
       */
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => key !== "_hasHydrated"),
        ) as LocationState,
    },
  ),
);
