require('dotenv').config();
const { Firestore } = require('@google-cloud/firestore');

// Initialize Firestore using the (default) ID from your .env
const db = new Firestore({ 
  databaseId: process.env.FIRESTORE_DB_ID || '(default)' 
});

async function reseed() {
  console.log("🛠️ Seeding data into the (default) database...");
  
  const collectionName = 'final_audit_shipments'; 
  
  try {
    // This creates the document SHIP-777 inside the new collection
    await db.collection(collectionName).doc('SHIP-777').set({
      id: "SHIP-777",
      origin: "Mumbai",
      destination: "Hamburg",
      cargo: "Lithium Batteries",
      status: "In Transit",
      risk_level: "Medium",
      last_updated: new Date().toISOString()
    });

    console.log(`✅ Success! Document created in collection: ${collectionName}`);
    console.log("🚀 You are now ready to run node agent.js");
  } catch (error) {
    console.error("❌ Seed Error:", error.message);
  }
}

reseed();