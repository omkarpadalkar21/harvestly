import { getPayload } from "payload";
import config from "@payload-config";

/**
 * Script to fix malformed tenant data in existing users
 * Run with: tsx scripts/fix-user-tenants.ts
 */
async function fixUserTenants() {
  console.log("Starting user tenant data fix...");

  const payload = await getPayload({ config });

  try {
    // Get all users
    const users = await payload.find({
      collection: "users",
      limit: 1000,
      overrideAccess: true,
    });

    console.log(`Found ${users.docs.length} users to check`);

    let fixedCount = 0;

    for (const user of users.docs) {
      let needsUpdate = false;
      let newTenants: any[] = [];

      // Check if tenants field exists and is an array
      if (!user.tenants || !Array.isArray(user.tenants)) {
        needsUpdate = true;
        newTenants = [];
        console.log(`User ${user.id} (${user.email}): Missing or invalid tenants field`);
      } else {
        // Filter out any undefined or malformed entries
        newTenants = user.tenants.filter((item: any) => {
          if (!item || typeof item !== "object") {
            needsUpdate = true;
            console.log(`User ${user.id} (${user.email}): Found invalid tenant entry`);
            return false;
          }
          if (!item.tenant) {
            needsUpdate = true;
            console.log(`User ${user.id} (${user.email}): Found tenant entry without tenant field`);
            return false;
          }
          return true;
        });
      }

      if (needsUpdate) {
        await payload.update({
          collection: "users",
          id: user.id,
          data: {
            tenants: newTenants,
          },
          overrideAccess: true,
        });
        fixedCount++;
        console.log(`✓ Fixed user ${user.id} (${user.email})`);
      }
    }

    console.log(`\n✅ Complete! Fixed ${fixedCount} users`);
    console.log(`${users.docs.length - fixedCount} users had valid tenant data`);
  } catch (error) {
    console.error("Error fixing user tenants:", error);
    process.exit(1);
  }

  process.exit(0);
}

fixUserTenants();
