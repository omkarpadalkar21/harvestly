import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Load environment variables
dotenv.config({ path: path.resolve(dirname, "../.env") });

import { getPayload } from "payload";
import config from "@payload-config";
import fs from "fs";

async function migrateImages() {
  console.log("Starting image migration to cloud storage...");

  try {
    const payload = await getPayload({ config });

    // Fetch all media items
    const media = await payload.find({
      collection: "media",
      limit: 1000,
      pagination: false,
    });

    console.log(`Found ${media.totalDocs} media items to migrate`);

    let migratedCount = 0;
    let failedCount = 0;
    const failedItems: string[] = [];

    for (const item of media.docs) {
      try {
        // Construct local file path
        const localPath = path.join(process.cwd(), "public", item.url || "");

        console.log(
          `[${migratedCount + failedCount + 1}/${media.totalDocs}] Processing: ${item.filename}`
        );

        if (!fs.existsSync(localPath)) {
          console.warn(`  ⚠️  File not found: ${localPath}`);
          failedCount++;
          failedItems.push(`${item.filename} (file not found)`);
          continue;
        }

        // Read file from disk
        const fileBuffer = fs.readFileSync(localPath);

        // Re-upload by reading the file
        // Note: This depends on how your cloud storage adapter handles files
        // For Vercel Blob or S3, the file will be automatically uploaded
        await payload.update({
          collection: "media",
          id: item.id,
          data: {
            // Most cloud storage adapters re-upload if you provide the file path
          },
          file: {
            data: fileBuffer,
            mimetype: item.mimeType || "application/octet-stream",
            name: item.filename || "",
            size: item.filesize || 0,
          },
        });

        console.log(`  ✅ Migrated: ${item.filename}`);
        migratedCount++;
      } catch (error) {
        console.error(`  ❌ Failed to migrate ${item.filename}:`, error);
        failedCount++;
        failedItems.push(item.filename || "unknown");
      }
    }

    console.log("\n=== Migration Summary ===");
    console.log(`✅ Successfully migrated: ${migratedCount}`);
    console.log(`❌ Failed: ${failedCount}`);

    if (failedItems.length > 0) {
      console.log("\nFailed items:");
      failedItems.forEach((item) => console.log(`  - ${item}`));
    }

    console.log("Migration complete!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrateImages();
