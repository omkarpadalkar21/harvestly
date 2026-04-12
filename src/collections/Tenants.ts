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
    /**
     * FIX (Bug 2 & 9): Auto-geocode lat/lng from pincode whenever the
     * location block changes (including updates from the Payload admin panel).
     * Previously there was NO hook, so sellers updating city/state from the
     * dashboard never had their coordinates updated.
     */
    beforeChange: [
      async ({ data, originalDoc }) => {
        const newPincode = data?.location?.pincode;
        const oldPincode = originalDoc?.location?.pincode;

        // Only geocode when the pincode field is actually present in the
        // incoming data AND has changed (or is being set for the first time).
        const pincodeChanged =
          newPincode &&
          /^\d{6}$/.test(newPincode) &&
          newPincode !== oldPincode;

        if (pincodeChanged) {
          const geo = await geocodePincodeServer(newPincode);
          if (geo) {
            data.location = {
              ...data.location,
              lat: geo.lat,
              lng: geo.lng,
              // If the admin left city/state blank, backfill from geocoder
              city: data.location?.city || geo.city,
              state: data.location?.state || geo.state,
            };
          } else {
            // Geocoding failed — explicitly null out stale coords so the
            // falsy-zero bug (Bug 1) does not accidentally re-surface.
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

    /**
     * FIX (Bug 3): Invalidate the in-memory LRU tenant cache whenever a
     * tenant document changes so the geo-filter always uses fresh coordinates.
     * Previously invalidateTenantCache() existed but was never called.
     */
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
              "Enter a valid 6-digit Indian pincode. Coordinates (lat/lng) will be auto-filled.",
          },
        },
        {
          name: "lat",
          type: "number",
          // FIX (Bug 9): Default is null, NOT 0. Zero is a real coordinate
          // (Gulf of Guinea) and is falsy in JavaScript, which previously caused
          // all newly-registered sellers to bypass geo-filtering entirely.
          defaultValue: null,
          admin: {
            description: "Latitude — auto-filled from pincode. Do not edit manually.",
            readOnly: true,
          },
        },
        {
          name: "lng",
          type: "number",
          defaultValue: null,
          admin: {
            description: "Longitude — auto-filled from pincode. Do not edit manually.",
            readOnly: true,
          },
        },
        {
          name: "serviceRadiusKm",
          type: "number",
          defaultValue: 50,
          min: 1,
          max: 500,
          admin: {
            description: "Maximum delivery radius in kilometres (default 50 km)",
          },
        },
      ],
    },
  ],
};
