"use client";

import { MapPinOffIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocationStore } from "@/modules/home/store/use-location-store";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface OutOfRangeBannerProps {
  onChangeLocation: () => void;
}

export const OutOfRangeBanner = ({ onChangeLocation }: OutOfRangeBannerProps) => {
  const { location } = useLocationStore();
  const trpc = useTRPC();

  const saveNotifyMe = useMutation(
    trpc.auth.notifyLocation.mutationOptions({
      onSuccess: () => {
        toast.success("You're on the list! We'll notify you when we expand to your area.");
      },
      onError: () => {
        toast.error("Could not save your location. Please try again.");
      },
    })
  );

  const handleNotifyMe = () => {
    if (!location?.pincode) {
      toast.error("No location set. Please set your pincode first.");
      return;
    }
    saveNotifyMe.mutate({
      pincode: location.pincode,
      city: location.city,
      state: location.state,
      lat: location.lat,
      lng: location.lng,
    });
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="bg-amber-50 border border-amber-300 rounded-xl p-8 max-w-lg w-full">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-amber-100 rounded-full">
            <MapPinOffIcon className="size-8 text-amber-600" />
          </div>
        </div>
        <h2 className="text-xl font-semibold mb-2">
          Harvestly isn&apos;t in your area yet
        </h2>
        <p className="text-sm text-neutral-600 mb-6 leading-relaxed">
          We&apos;re working hard to bring fresh farm products to{" "}
          {location?.city ? (
            <strong>
              {location.city}
              {location.state ? `, ${location.state}` : ""}
            </strong>
          ) : (
            "your area"
          )}
          . We&apos;ll notify you as soon as local sellers are available nearby!
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={handleNotifyMe}
            disabled={saveNotifyMe.isPending}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            🔔 Notify Me When Available
          </Button>
          <Button variant="outline" onClick={onChangeLocation} className="border-black">
            Change Location
          </Button>
        </div>
      </div>
    </div>
  );
};
