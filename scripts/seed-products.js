#!/usr/bin/env node

/**
 * Script to seed products for omkar-farms
 * 
 * This script will:
 * 1. Create a Stripe account for omkar-farms
 * 2. Create a tenant for omkar-farms
 * 3. Create a user with credentials: omkar-farms / omkar@gmail.com / 12345
 * 4. Create relevant tags for farm products
 * 5. Upload product images to the media collection
 * 6. Create 8 diverse farm products with proper categories and relationships
 * 
 * Usage: npm run seed:products
 */

import { seedProducts } from "./seed-products.js";

try {
  await seedProducts();
  console.log("🎉 Product seeding completed successfully!");
} catch (error) {
  console.error("💥 Seeding failed:", error);
  process.exit(1);
}
