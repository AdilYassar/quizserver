/**
 * Direct Shared DB Query Test
 * Bypass models and query directly
 */

import "dotenv/config";
import mongoose from "mongoose";

async function testDirectQuery() {
  console.log("\n╔" + "═".repeat(68) + "╗");
  console.log("║" + " DIRECT SHARED DB QUERY TEST ".padEnd(69) + "║");
  console.log("╚" + "═".repeat(68) + "╝\n");

  try {
    console.log("📡 Connecting directly to Shared DB...");
    console.log(`   URI: ${process.env.SHARED_DB_URI}`);
    
    const sharedConnection = await mongoose.createConnection(
      process.env.SHARED_DB_URI,
      {
        maxPoolSize: 10,
      }
    ).asPromise();

    console.log("✅ Connected!\n");

    // Get the database instance
    const db = sharedConnection.getClient().db();
    const dbName = sharedConnection.collections?.names?.()[0]?.split('.')[0] || 'unknown';
    
    console.log("═".repeat(70));
    console.log("📊 Database Collections:");
    const collections = await db.listCollections().toArray();
    console.log(`   Total collections: ${collections.length}\n`);
    collections.forEach(col => {
      console.log(`   • ${col.name}`);
    });

    // Query device tokens collection
    console.log("\n═".repeat(70));
    console.log("🔍 Querying 'devicetokens' collection...\n");
    
    const deviceTokensCollection = db.collection('devicetokens');
    const allTokens = await deviceTokensCollection.find({}).toArray();
    
    console.log(`✅ Found ${allTokens.length} device tokens\n`);
    
    if (allTokens.length > 0) {
      console.log("Sample tokens:");
      allTokens.forEach((token, idx) => {
        console.log(`\n   ${idx + 1}. User UUID: ${token.userUUID}`);
        console.log(`      Device: ${token.deviceName || 'Unknown'}`);
        console.log(`      Type: ${token.deviceType || 'Unknown'}`);
        console.log(`      Token: ${token.token?.substring(0, 50)}...`);
      });
    }

    // Query specific user
    console.log("\n═".repeat(70));
    console.log("🔍 Querying specific user: 9b4eef01-f86f-4e55-ad52-d36d239b4574\n");
    
    const userUUID = "9b4eef01-f86f-4e55-ad52-d36d239b4574";
    const userTokens = await deviceTokensCollection
      .find({ userUUID })
      .toArray();
    
    console.log(`Results: ${userTokens.length} tokens found for this user`);
    if (userTokens.length > 0) {
      userTokens.forEach(t => {
        console.log(`   ✓ ${t.deviceName}: ${t.token?.substring(0, 40)}...`);
      });
    } else {
      console.log(`   ❌ No tokens found`);
    }

    await sharedConnection.close();
    console.log("\n✅ Done\n");

  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error);
  }
}

testDirectQuery();
