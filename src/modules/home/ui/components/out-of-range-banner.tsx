'use client';

import { MapPinOffIcon } from 'lucide-react';
import { useLocationStore } from '@/modules/home/store/use-location-store';

interface OutOfRangeBannerProps {
  productCount: number;
}

export const OutOfRangeBanner = ({ productCount }: OutOfRangeBannerProps) => {
  const location = useLocationStore((s) => s.location);

  // Only show when customer has GPS/coords set AND no products were found
  const hasCoords = location?.lat != null && location?.lng != null;
  if (!hasCoords || productCount > 0) return null;

  const label = location?.city
    ? `${location.city}${location.state ? `, ${location.state}` : ''}`
    : location?.pincode ?? 'your location';

  return (
    <div className="flex items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 mb-4">
      <MapPinOffIcon className="size-5 shrink-0" />
      <p>
        No sellers currently deliver to <strong>{label}</strong>.{' '}
        <button
          className="underline font-medium"
          onClick={() => useLocationStore.getState().clearLocation()}
        >
          Clear your location
        </button>{' '}
        to see all available products.
      </p>
    </div>
  );
};
