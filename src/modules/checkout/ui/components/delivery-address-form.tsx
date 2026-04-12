"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  deliveryAddressSchema,
  DeliveryAddress,
} from "@/modules/checkout/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPinIcon } from "lucide-react";

interface DeliveryAddressFormProps {
  onSubmit: (address: DeliveryAddress) => void;
}

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman & Nicobar Islands",
  "Chandigarh",
  "Dadra & Nagar Haveli and Daman & Diu",
  "Delhi",
  "Jammu & Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

const DeliveryAddressForm = ({ onSubmit }: DeliveryAddressFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DeliveryAddress>({
    resolver: zodResolver(deliveryAddressSchema),
  });

  return (
    <div className="border border-black rounded-md overflow-hidden bg-white">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-black bg-[#f4f4f4]">
        <MapPinIcon className="size-4 shrink-0" />
        <h2 className="font-semibold text-base">Delivery Address</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-4 flex flex-col gap-4">
        {/* Full Name */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            placeholder="Rahul Sharma"
            {...register("fullName")}
            className={errors.fullName ? "border-red-500" : ""}
          />
          {errors.fullName && (
            <p className="text-sm text-red-600">{errors.fullName.message}</p>
          )}
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="phone">Mobile Number *</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="9876543210"
            {...register("phone")}
            className={errors.phone ? "border-red-500" : ""}
          />
          {errors.phone && (
            <p className="text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>

        {/* Address Line 1 */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="addressLine1">Address Line 1 *</Label>
          <Input
            id="addressLine1"
            placeholder="House No., Street, Area"
            {...register("addressLine1")}
            className={errors.addressLine1 ? "border-red-500" : ""}
          />
          {errors.addressLine1 && (
            <p className="text-sm text-red-600">
              {errors.addressLine1.message}
            </p>
          )}
        </div>

        {/* Address Line 2 */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
          <Input
            id="addressLine2"
            placeholder="Landmark, Colony (optional)"
            {...register("addressLine2")}
          />
        </div>

        {/* City + Pincode */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              placeholder="Mumbai"
              {...register("city")}
              className={errors.city ? "border-red-500" : ""}
            />
            {errors.city && (
              <p className="text-sm text-red-600">{errors.city.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="pincode">Pincode *</Label>
            <Input
              id="pincode"
              placeholder="400001"
              {...register("pincode")}
              className={errors.pincode ? "border-red-500" : ""}
            />
            {errors.pincode && (
              <p className="text-sm text-red-600">{errors.pincode.message}</p>
            )}
          </div>
        </div>

        {/* State */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="state">State *</Label>
          <select
            id="state"
            {...register("state")}
            className={`flex h-10 w-full rounded-md border ${
              errors.state ? "border-red-500" : "border-input"
            } bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
          >
            <option value="">Select a state...</option>
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {errors.state && (
            <p className="text-sm text-red-600">{errors.state.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          size="lg"
          className="w-full text-base text-white bg-primary hover:bg-green-600 mt-2"
        >
          Continue to Payment →
        </Button>
      </form>
    </div>
  );
};

export default DeliveryAddressForm;
