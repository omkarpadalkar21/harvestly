// scripts/reupload-media.ts
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

dotenv.config({ path: path.resolve(dirname, "../.env") });

import { getPayload } from "payload";
import config from "@payload-config";
import fs from "fs";

async function reuploadMedia() {
  console.log("🔄 Re-uploading media to Vercel Blob...\n");

  try {
    const payload = await getPayload({ config });

    // Fetch all old media items
    const media = await payload.find({
      collection: "media",
      limit: 1000,
      pagination: false,
    });

    console.log(`Found ${media.totalDocs} old media items\n`);

    for (const item of media.docs) {
      // If it's using the old API endpoint, we can't actually re-upload
      // because the files aren't stored locally anymore
      if (item.url?.includes("/api/media/file/")) {
        console.log(`⚠️  Cannot recover old file: ${item.filename}`);
        console.log(`    Files were stored in /media and may be deleted`);
      }
    }

    console.log(
      "\n✅ Recommendation: Delete old media and re-upload fresh images"
    );
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

reuploadMedia();
