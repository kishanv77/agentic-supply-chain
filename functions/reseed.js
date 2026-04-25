require('dotenv').config();
const { Firestore } = require('@google-cloud/firestore');

// Initialize Firestore using the (default) ID from your .env
const db = new Firestore({ 
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "agentic-ai-494018",
  databaseId: process.env.FIRESTORE_DB_ID || '(default)' 
});

async function reseed() {
  console.log("🛠️ Seeding rich data into the database...");
  
  const shipmentsCollection = 'final_audit_shipments';
  const decisionsCollection = 'agent_decisions';
  
  try {
    const timestamp = new Date();

    // 1. Seed Multiple Shipments
    const shipments = [
      {
        id: "SHIP-777",
        origin: "Mumbai, India",
        destination: "Hamburg, Germany",
        cargo: "Lithium Batteries",
        status: "In Transit",
        risk_level: "High",
        priority: "Critical",
        temperature: 28.5, // High temp for batteries
        humidity: 65,
        eta: new Date(timestamp.getTime() + 48 * 60 * 60 * 1000).toISOString(), // +48 hours
        last_updated: timestamp.toISOString()
      },
      {
        id: "SHIP-404",
        origin: "Shenzhen, China",
        destination: "Los Angeles, USA",
        cargo: "Consumer Electronics",
        status: "Delayed",
        risk_level: "Medium",
        priority: "Normal",
        temperature: 22.0,
        humidity: 50,
        eta: new Date(timestamp.getTime() + 120 * 60 * 60 * 1000).toISOString(),
        last_updated: timestamp.toISOString()
      },
      {
        id: "SHIP-101",
        origin: "Rotterdam, Netherlands",
        destination: "New York, USA",
        cargo: "Pharmaceuticals",
        status: "In Transit",
        risk_level: "Low",
        priority: "High",
        temperature: 4.5, // Cold chain
        humidity: 40,
        eta: new Date(timestamp.getTime() + 72 * 60 * 60 * 1000).toISOString(),
        last_updated: timestamp.toISOString()
      }
    ];

    for (const ship of shipments) {
      await db.collection(shipmentsCollection).doc(ship.id).set(ship);
      console.log(`✅ Seeded Shipment: ${ship.id}`);
    }

    // 2. Seed Agent Decisions
    const decisions = [
      {
        shipmentId: "SHIP-777",
        suggested_route: "Suez Canal Bypass - Cape of Good Hope",
        analysis: "High temperature anomaly detected in container. Original route delayed by port congestion. Rerouting via Cape of Good Hope reduces ambient heat exposure by 15% and avoids 4-day port queue.",
        metrics: { distance: "+3,200 km", co2: "+120 kg", time_saved: "48 hrs" },
        integrity_hash: "a9f8b7c6d5e4f3g2h1...",
        status: "Validated",
        timestamp: timestamp
      },
      {
        shipmentId: "SHIP-404",
        suggested_route: "Air Freight - Direct",
        analysis: "Significant delay detected at origin port. Expediting high-value consumer electronics via air freight to meet seasonal demand window.",
        metrics: { distance: "Direct", co2: "+850 kg", time_saved: "14 days" },
        integrity_hash: "z1y2x3w4v5u6t7s8...",
        status: "Pending User Approval",
        timestamp: new Date(timestamp.getTime() - 3600000) // 1 hour ago
      }
    ];

    for (let i = 0; i < decisions.length; i++) {
      await db.collection(decisionsCollection).doc(`DECISION-${i}`).set(decisions[i]);
      console.log(`✅ Seeded Decision: DECISION-${i}`);
    }

    console.log("🚀 Data seeding complete. The dashboard should now show rich real-time insights!");
  } catch (error) {
    console.error("❌ Seed Error:", error.message);
  }
}

reseed();