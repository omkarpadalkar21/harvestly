"use client";

import { MapPinIcon, ChevronDownIcon } from "lucide-react";
import { useLocationStore } from "@/modules/home/store/use-location-store";

interface LocationBarProps {
  onRequestChange: () => void;
}

export const LocationBar = ({ onRequestChange }: LocationBarProps) => {
  const { location } = useLocationStore();

  if (!location) return null;

  const label = location.city
    ? `${location.city}${location.pincode ? ` – ${location.pincode}` : ""}`
    : location.pincode ?? "Unknown";

  return (
    <button
      onClick={onRequestChange}
      className="flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-black transition-colors group"
      aria-label="Change delivery location"
    >
      <MapPinIcon className="size-3.5 text-green-700 shrink-0" />
      <span className="truncate max-w-[160px]">{label}</span>
      <ChevronDownIcon className="size-3.5 text-neutral-400 group-hover:text-black transition-colors shrink-0" />
    </button>
  );
};
