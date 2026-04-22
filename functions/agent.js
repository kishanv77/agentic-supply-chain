require('dotenv').config(); // Loads variables from .env
const axios = require('axios');
const { Firestore } = require('@google-cloud/firestore');
const crypto = require('crypto');

async function runPhase2Final() {
  console.log("🧠 Antigravity Brain: Initializing Phase 2...");

  try {
    // 1. Initialize Firestore using .env
    const db = new Firestore({ databaseId: process.env.FIRESTORE_DB_ID });
    
    // 2. Setup AI Endpoint
    const API_KEY = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    // 3. Fetch Shipment Data
    console.log("📂 Accessing Firestore...");
    const doc = await db.collection('shipments').doc('SHIP-777').get();
    if (!doc.exists) throw new Error("SHIP-777 not found in Firestore.");
    const shipmentData = doc.data();

    // 4. AI Reasoning (Requirement 1)
    console.log("🤖 Generating AI Insights...");
    const response = await axios.post(url, {
      contents: [{ parts: [{ text: `Shipment: ${JSON.stringify(shipmentData)}. Disruption: Port of Mumbai closed. Suggest reroute.` }] }]
    });
    const aiReasoning = response.data.candidates[0].content.parts[0].text;

    // 5. Integrity Hash (Requirement 2)
    const decisionHash = crypto.createHash('sha256').update(aiReasoning).digest('hex');

    // 6. Persistence (Requirement 3)
    console.log("💾 Saving to Audit Trail...");
    await db.collection('agent_decisions').add({
      shipmentId: 'SHIP-777',
      analysis: aiReasoning,
      integrity_hash: decisionHash,
      timestamp: new Date(),
      status: "Verified"
    });

    // --- TERMINAL OUTPUTS ---
    console.log("\n✅ PHASE 2 COMPLETE");
    console.log("-------------------------------");
    console.log(`🧠 Reasoning: ${aiReasoning.substring(0, 50)}...`);
    console.log(`🔐 Hash: ${decisionHash}`);
    console.log("-------------------------------");

  } catch (error) {
    console.error("❌ Execution Error:", error.response ? error.response.data : error.message);
  }
}

runPhase2Final();