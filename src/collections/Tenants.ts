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

        // ── LOG: always print the incoming location data so we can diagnose ──
        console.log('[Tenants.beforeChange] incoming data.location =', JSON.stringify(data?.location ?? null));

        // ── PRIORITY 1: GPS / picker already set coordinates ──────────────────
        // The LocationPickerField writes lat/lng directly into the form before
        // Save is clicked. If valid coords arrive in `data`, trust them as-is
        // and skip geocoding entirely — do NOT overwrite with pincode geocoding.
        const incomingLat = data?.location?.lat;
        const incomingLng = data?.location?.lng;
        const incomingHasValidCoords =
          incomingLat != null &&
          incomingLng != null &&
          !isNaN(Number(incomingLat)) &&
          !isNaN(Number(incomingLng));

        if (incomingHasValidCoords) {
          // Coordinates already set (either by GPS picker or pincode picker).
          // Preserve them exactly; do not call any geocoding API.
          console.log(
            `[Tenants.beforeChange] ✅ lat/lng present and valid (${incomingLat}, ${incomingLng}) — skipping geocode, persisting as-is.`,
          );
          return data;
        }

        // ── PRIORITY 2: Fallback — geocode from pincode ────────────────────────
        // Only reach here when the incoming data has NO coordinates
        // (e.g. seller typed into the raw pincode field without using the picker).
        const hasValidPincode = newPincode && /^\d{6}$/.test(newPincode);
        const pincodeChanged = newPincode !== oldPincode;
        const coordsMissingOnDoc =
          originalDoc?.location?.lat == null ||
          originalDoc?.location?.lng == null;

        const shouldGeocode =
          hasValidPincode && (pincodeChanged || coordsMissingOnDoc);

        if (shouldGeocode) {
          console.log(
            `[Tenants.beforeChange] No coords in data — geocoding pincode ${newPincode}.`,
          );
          const geo = await geocodePincodeServer(newPincode);
          if (geo) {
            data.location = {
              ...data.location,
              lat: geo.lat,
              lng: geo.lng,
              city: data.location?.city || geo.city,
              state: data.location?.state || geo.state,
            };
          } else {
            // Geocoding failed — null out coords so the filter hides this
            // seller rather than showing them to everyone.
            console.warn(
              `[Tenants.beforeChange] Geocoding failed for pincode ${newPincode} — nulling coords.`,
            );
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
        // ── GPS / Pincode picker UI (type:'ui' is the correct Payload v3 way) ──
        {
          name: "_locationPicker",
          type: "ui",
          admin: {
            components: {
              Field:
                "@/components/admin/location-picker-field#LocationPickerField",
            },
          },
        },
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
              "6-digit Indian pincode — also auto-filled when you use the picker above.",
          },
        },
        {
          name: "lat",
          type: "number",
          // NOT hidden — hidden fields may not be initialized in Payload's
          // form state, causing useField().setValue() to be a silent no-op.
          // Visible fields are guaranteed to be in form state.
          admin: {
            description:
              "✅ Auto-filled by the GPS / pincode picker above. Do not edit manually.",
            style: { opacity: 0.5, pointerEvents: 'none' },
          },
        },
        {
          name: "lng",
          type: "number",
          admin: {
            description:
              "✅ Auto-filled by the GPS / pincode picker above. Do not edit manually.",
            style: { opacity: 0.5, pointerEvents: 'none' },
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
              "Maximum delivery radius in kilometres (default 50 km). Customers outside this radius won't see your products.",
          },
        },
      ],
    },
  ],
};
