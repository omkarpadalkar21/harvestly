import { z } from "zod";

export const deliveryAddressSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  addressLine1: z.string().min(5, "Address must be at least 5 characters"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
});

export type DeliveryAddress = z.infer<typeof deliveryAddressSchema>;
