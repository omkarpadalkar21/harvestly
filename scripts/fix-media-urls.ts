import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

dotenv.config({ path: path.resolve(dirname, "../.env") });

import { getPayload } from "payload";
import config from "@payload-config";

async function fixMediaUrls() {
  console.log("🔄 Fixing media URLs to point to Vercel Blob...\n");

  try {
    const payload = await getPayload({ config });

    // Fetch all media items
    const media = await payload.find({
      collection: "media",
      limit: 1000,
      pagination: false,
    });

    console.log(`📦 Found ${media.totalDocs} media items\n`);

    let fixedCount = 0;

    for (const item of media.docs) {
      // Check if URL still points to old API endpoint
      if (item.url?.includes("/api/media/file/")) {
        console.log(`❌ OLD URL: ${item.filename}`);
        console.log(`   ${item.url}\n`);
        fixedCount++;
      } else if (item.url?.includes("blob.vercel-storage.com")) {
        console.log(`✅ ALREADY MIGRATED: ${item.filename}`);
      } else {
        console.log(`⚠️  UNKNOWN FORMAT: ${item.filename}`);
        console.log(`   ${item.url}\n`);
      }
    }

    console.log("\n=== Summary ===");
    console.log(`❌ Media items with old URLs: ${fixedCount}`);
    console.log(`📊 Total media items: ${media.totalDocs}`);
    console.log("\n⚠️  Old media items need to be re-uploaded!");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

fixMediaUrls();
