"use client";

import { useState } from "react";
import { MapPinIcon, LocateIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocationStore } from "@/modules/home/store/use-location-store";
import { toast } from "sonner";

interface LocationPromptProps {
  onClose: () => void;
}

export const LocationPrompt = ({ onClose }: LocationPromptProps) => {
  const [pincode, setPincode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const setLocation = useLocationStore((s) => s.setLocation);

  const handlePincodeSubmit = async () => {
    if (!/^\d{6}$/.test(pincode)) {
      toast.error("Enter a valid 6-digit Indian pincode");
      return;
    }
    setIsLoading(true);
    try {
      // ── Step 1: Postal Pincode API ─────────────────────────────────────────
      // This is fast, reliable, and already returns Latitude/Longitude per post
      // office entry. Use these coords as the primary source.
      const postalRes = await fetch(
        `https://api.postalpincode.in/pincode/${pincode}`,
      );
      const postalData = await postalRes.json();
      const postOffice = postalData?.[0]?.PostOffice?.[0];

      if (!postOffice) {
        toast.error("Could not find location for that pincode. Try again.");
        return;
      }

      const city: string = postOffice.District ?? postOffice.Name;
      const state: string = postOffice.State;

      // ── Step 2: Extract coords from postal API response ────────────────────
      // The postalpincode.in API returns Latitude and Longitude on each
      // PostOffice entry. Use them directly — no external geocoding needed.
      let lat: number | null = null;
      let lng: number | null = null;

      const rawLat = postOffice.Latitude;
      const rawLng = postOffice.Longitude;

      if (
        rawLat &&
        rawLng &&
        rawLat !== "NA" &&
        rawLng !== "NA" &&
        rawLat !== "" &&
        rawLng !== ""
      ) {
        const parsedLat = parseFloat(rawLat);
        const parsedLng = parseFloat(rawLng);
        if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
          lat = parsedLat;
          lng = parsedLng;
        }
      }

      // ── Step 3: Nominatim fallback (only if postal API lacked coords) ──────
      if (lat === null || lng === null) {
        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/search?postalcode=${pincode}&countrycodes=in&format=json&limit=1`,
            { headers: { "Accept-Language": "en" } },
          );
          const geoData = await geoRes.json();
          if (geoData?.[0]) {
            lat = parseFloat(geoData[0].lat);
            lng = parseFloat(geoData[0].lon);
          }
        } catch {
          // Nominatim failed — proceed without coords
        }
      }

      // Always persist location. If coords are still null, filtering is
      // disabled and the user sees all sellers with a warning toast.
      setLocation({
        pincode,
        city,
        state,
        lat: lat ?? undefined,
        lng: lng ?? undefined,
      });

      if (lat !== null && lng !== null) {
        toast.success(`Location set to ${city}, ${state}`);
      } else {
        toast.warning(
          `Location set to ${city} — distance filtering unavailable. Showing all sellers.`,
        );
      }
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleGPS = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          // Reverse geocode with Nominatim
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { "Accept-Language": "en" } },
          );
          const data = await res.json();
          const addr = data?.address ?? {};
          setLocation({
            lat: latitude,
            lng: longitude,
            city:
              addr.city ??
              addr.town ??
              addr.village ??
              addr.county ??
              "Unknown",
            state: addr.state ?? "",
            pincode: addr.postcode ?? "",
          });
          toast.success("Location detected successfully!");
          onClose();
        } catch {
          toast.error(
            "Could not determine your location. Try entering a pincode.",
          );
        } finally {
          setIsLoading(false);
        }
      },
      () => {
        toast.error(
          "Location access denied. Please enter your pincode manually.",
        );
        setIsLoading(false);
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white border border-black rounded-xl w-full max-w-sm overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <MapPinIcon className="size-5 text-green-700" />
            <h2 className="font-semibold text-base">Where are you?</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-neutral-400 hover:text-black transition-colors"
          >
            <XIcon className="size-5" />
          </button>
        </div>

        <p className="px-5 pb-4 text-sm text-neutral-500 leading-relaxed">
          Share your location to see fresh farm products available near you.
        </p>

        {/* GPS button */}
        <div className="px-5 pb-3">
          <Button
            variant="outline"
            className="w-full border-black gap-2"
            onClick={handleGPS}
            disabled={isLoading}
          >
            <LocateIcon className="size-4" />
            Detect my location
          </Button>
        </div>

        <div className="flex items-center gap-3 px-5 pb-3">
          <div className="flex-1 h-px bg-neutral-200" />
          <span className="text-xs text-neutral-400 shrink-0">
            or enter pincode
          </span>
          <div className="flex-1 h-px bg-neutral-200" />
        </div>

        {/* Pincode input */}
        <div className="px-5 pb-5 flex gap-2">
          <Input
            placeholder="e.g. 400001"
            value={pincode}
            onChange={(e) =>
              setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            onKeyDown={(e) => e.key === "Enter" && handlePincodeSubmit()}
            className="flex-1"
            maxLength={6}
          />
          <Button
            onClick={handlePincodeSubmit}
            disabled={isLoading || pincode.length !== 6}
            className="bg-primary text-white hover:bg-green-700"
          >
            Go
          </Button>
        </div>

        <button
          onClick={onClose}
          className="w-full text-xs text-neutral-400 hover:text-black py-2 border-t border-neutral-100 transition-colors"
        >
          Skip for now — show all sellers
        </button>
      </div>
    </div>
  );
};
