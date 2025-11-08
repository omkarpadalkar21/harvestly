import { isSuperAdmin, isSellerOrSuperAdmin } from "@/lib/access";
import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: () => true,
    admin: ({ req }) => isSellerOrSuperAdmin(req.user),
    update: ({ req }) => isSuperAdmin(req.user),
  },
  admin: {
    hidden: ({ user }) => !isSuperAdmin(user),
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
    },
  ],
  upload: {
    // Don't use staticDir - let Vercel Blob handle it
    // adminThumbnail: 'thumbnail',
    mimeTypes: ["image/*"],
  },
};
