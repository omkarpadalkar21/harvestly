import dotenv from "dotenv";

dotenv.config();

import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { payloadCloudPlugin } from "@payloadcms/payload-cloud";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import sharp from "sharp";
import { fileURLToPath } from "url";

import { Orders } from "@/collections/Orders";
import { Products } from "@/collections/Products";
import { Reviews } from "@/collections/Reviews";
import { Tags } from "@/collections/Tags";
import { Tenants } from "@/collections/Tenants";
import { multiTenantPlugin } from "@payloadcms/plugin-multi-tenant";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";

import { Categories } from "./collections/Categories";
import { Media } from "./collections/Media";
import { Users } from "./collections/Users";
import { isSuperAdmin } from "./lib/access";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      beforeNavLinks: ["@/components/stripe-verify#StripeVerify"],
    },
  },
  collections: [
    Users,
    Media,
    Categories,
    Products,
    Tags,
    Tenants,
    Orders,
    Reviews,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || "",
    connectOptions: {
      maxPoolSize: 10, // Maximum connections in the pool
      minPoolSize: 2, // Minimum connections maintained
      socketTimeoutMS: 45000, // Increased from default 30s
      serverSelectionTimeoutMS: 10000,
      retryWrites: true,
    },
  }),

  sharp,
  plugins: [
    payloadCloudPlugin(),
    multiTenantPlugin({
      collections: {
        products: {
          customTenantField: true,
        },
      },
      tenantsArrayField: {
        includeDefaultField: false,
      },
      userHasAccessToAllTenants: (user) => isSuperAdmin(user),
    }),
    vercelBlobStorage({
      enabled: true,
      collections: {
        media: true, // Apply to your Media collection
      },
      // Token is automatically set by Vercel when you enable Blob storage
      token: process.env.BLOB_READ_WRITE_TOKEN || "",
      // For files > 4.5MB on Vercel, use client uploads
      clientUploads: true,
      // Optional: Add random suffix to prevent filename collisions
      addRandomSuffix: true,
    }),
  ],
});
