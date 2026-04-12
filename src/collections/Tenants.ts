import { isSuperAdmin, isSellerOrSuperAdmin } from "@/lib/access";
import { invalidateTenantCache } from "@/lib/cache-invalidation";
import { geocodePincodeServer } from "@/lib/geo";
import type { CollectionConfig } from "payload";

export const Tenants: CollectionConfig = {
  slug: "tenants",
  admin: {
    useAsTitle: "subdomain",
  },
  access: {
    create: ({ req }) => isSuperAdmin(req.user),
    read: () => true,
    update: ({ req }) => isSellerOrSuperAdmin(req.user),
    delete: ({ req }) => isSuperAdmin(req.user),
    admin: ({ req }) => isSellerOrSuperAdmin(req.user),
  },
  // ─── HOOKS ────────────────────────────────────────────────────────────────
  hooks: {
    beforeChange: [
      async ({ data, originalDoc }) => {
        const newPincode = data?.location?.pincode;
        const oldPincode = originalDoc?.location?.pincode;

        // FIX: Geocode when:
        //   (a) a valid 6-digit pincode is present in the incoming data, AND
        //   (b) EITHER the pincode has changed OR lat/lng are currently null.
        //
        // Previously the condition only checked newPincode !== oldPincode, so
        // sellers who already had the correct pincode saved but still had
        // lat: null (e.g. from a failed geocode on first save) were never
        // re-geocoded — the hook silently skipped them every time.
        const hasValidPincode = newPincode && /^\d{6}$/.test(newPincode);
        const pincodeChanged = newPincode !== oldPincode;
        const coordsMissing =
          originalDoc?.location?.lat == null ||
          originalDoc?.location?.lng == null;

        const shouldGeocode =
          hasValidPincode && (pincodeChanged || coordsMissing);

        if (shouldGeocode) {
          const geo = await geocodePincodeServer(newPincode);
          if (geo) {
            data.location = {
              ...data.location,
              lat: geo.lat,
              lng: geo.lng,
              // Backfill city/state from geocoder if admin left them blank
              city: data.location?.city || geo.city,
              state: data.location?.state || geo.state,
            };
          } else {
            // Geocoding failed — null out coords so the filter hides this
            // seller rather than showing them to everyone.
            data.location = {
              ...data.location,
              lat: null,
              lng: null,
            };
          }
        }

        return data;
      },
    ],

    afterChange: [
      ({ doc }) => {
        invalidateTenantCache(doc.subdomain as string);
      },
    ],
  },
  // ─── FIELDS ───────────────────────────────────────────────────────────────
  fields: [
    {
      name: "name",
      required: true,
      type: "text",
      label: "Store Name",
      admin: {
        description: "This is the name of the store e.g. Farm Fresh Stores",
      },
    },
    {
      name: "subdomain",
      type: "text",
      index: true,
      required: true,
      unique: true,
      admin: {
        description:
          "This is the subdomain for the store e.g. subdomain.harvestly.com",
      },
      access: {
        update: ({ req }) => isSuperAdmin(req.user),
      },
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "stripeAccountId",
      type: "text",
      required: true,
      access: {
        update: ({ req }) => isSuperAdmin(req.user),
      },
      admin: {
        description: "Stripe account id associated with your shop",
      },
    },
    {
      name: "stripeDetailsSubmitted",
      type: "checkbox",
      access: {
        update: ({ req }) => isSuperAdmin(req.user),
      },
      admin: {
        description:
          "You cannot create products until you submit your Stripe details",
      },
    },
    {
      name: "location",
      type: "group",
      label: "Shop Location",
      fields: [
        {
          name: "address",
          type: "text",
          label: "Full Address",
        },
        {
          name: "city",
          type: "text",
          required: true,
          defaultValue: "Unknown",
        },
        {
          name: "state",
          type: "text",
          required: true,
          defaultValue: "Unknown",
        },
        {
          name: "pincode",
          type: "text",
          required: true,
          defaultValue: "000000",
          admin: {
            description:
              "Enter a valid 6-digit Indian pincode. Coordinates (lat/lng) will be auto-filled on save.",
          },
        },
        {
          name: "lat",
          type: "number",
          // FIX: No defaultValue — Payload stores null automatically when
          // no value is present for a number field. Specifying `null` here
          // causes a TypeScript error because DefaultValue only accepts
          // number | (() => number) | undefined.
          // FIX: Do NOT use readOnly here. Payload's readOnly flag prevents
          // the field from being written via the API, which means the
          // beforeChange hook's lat/lng mutations are silently discarded
          // before they reach the database. We hide the field in the UI
          // using admin.hidden instead — it stays writable server-side.
          admin: {
            description:
              "Latitude — auto-filled from pincode. Do not edit manually.",
            hidden: true,
          },
        },
        {
          name: "lng",
          type: "number",
          // No defaultValue — same reason as lat above.
          admin: {
            description:
              "Longitude — auto-filled from pincode. Do not edit manually.",
            hidden: true,
          },
        },
        {
          name: "serviceRadiusKm",
          type: "number",
          defaultValue: 50,
          min: 1,
          max: 500,
          admin: {
            description:
              "Maximum delivery radius in kilometres (default 50 km)",
          },
        },
      ],
    },
  ],
};
