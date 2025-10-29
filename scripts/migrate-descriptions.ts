import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables before importing modules that depend on them
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { getPayload } from "payload";
import config from "@payload-config";

/**
 * This script migrates plain text descriptions to Lexical format
 * Run with: npx tsx scripts/migrate-descriptions.ts
 */
async function migrateDescriptions() {
  const payload = await getPayload({ config });

  try {
    // Fetch all products
    const result = await payload.find({
      collection: "products",
      limit: 1000,
    });

    console.log(`Found ${result.totalDocs} products to check`);

    let migratedCount = 0;

    for (const product of result.docs) {
      // Check if description is a plain string
      const description = product.description;
      
      if (description && typeof description === "string") {
        console.log(`Migrating product: ${product.name}`);
        
        // Convert plain text to Lexical format
        const lexicalDescription = {
          root: {
            type: "root",
            format: "",
            indent: 0,
            version: 1,
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: description,
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "paragraph",
                version: 1,
              },
            ],
            direction: "ltr",
          },
        };

        // Update the product
        await payload.update({
          collection: "products",
          id: product.id,
          data: {
            description: lexicalDescription as any,
          },
        });

        migratedCount++;
        console.log(`✓ Migrated product: ${product.name}`);
      }
    }

    console.log(`\n✓ Migration complete! Migrated ${migratedCount} products`);
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    const db = payload.db;
    if (db && typeof db.destroy === "function") {
      await db.destroy();
    }
  }
}

migrateDescriptions();

