import React, { useState, useEffect } from 'react';
import { ShieldCheck, Truck, Leaf, AlertTriangle, Activity } from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot, doc } from 'firebase/firestore';
import { db } from './firebase';

// --- SUB-COMPONENTS ---

const SummaryCard = ({ title, value, icon: Icon, color }) => (
  <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '1rem' }}>
    <div style={{ backgroundColor: `${color}20`, padding: '12px', borderRadius: '10px' }}>
      <Icon size={24} color={color} />
    </div>
    <div>
      <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>{title}</div>
      <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{value}</div>
    </div>
  </div>
);

const IntegrityBadge = ({ hash }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#064e3b', color: '#34d399', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'mono', border: '1px solid #059669' }}>
    <ShieldCheck size={14} style={{ marginRight: '6px' }} />
    ID: {hash.substring(0, 10)}...
  </div>
);

// --- MAIN APP ---

function App() {
  const [decisions, setDecisions] = useState([]);
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'agent_decisions'), orderBy('timestamp', 'desc'), limit(10));
    const unsubscribeDecisions = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => {
        const data = doc.data();
        const timestamp = data.timestamp
          ? data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp.seconds * 1000)
          : new Date();

        return {
          id: doc.id,
          shipmentId: data.shipmentId || 'Unknown',
          suggested_route: data.suggested_route || 'Unknown route',
          analysis: data.analysis || 'No analysis available',
          metrics: data.metrics || { distance: 'N/A', co2: 'N/A' },
          integrity_hash: data.integrity_hash || 'N/A',
          status: data.status || 'Pending',
          timestamp: timestamp.toLocaleString()
        };
      });

      if (docs.length === 0) {
        setDecisions([
          {
            id: 'demo-1',
            shipmentId: 'SHIP-777',
            suggested_route: 'Pune Inland Port',
            analysis: 'Mumbai Port closure detected due to weather disruption. Reroute suggested to Pune ICD to minimize lead-time delay by 48 hours.',
            metrics: { distance: '148.5 km', co2: '29.7 kg' },
            integrity_hash: 'dda0f964cfa9aa69b0349985bc67fd322...',
            status: 'Validated',
            timestamp: new Date().toLocaleString()
          }
        ]);
      } else {
        setDecisions(docs);
      }
      setLoading(false);
    }, (err) => {
      console.error('Firestore real-time error:', err);
      setError(err.message);
      setLoading(false);
    });

    const shipmentRef = doc(db, 'final_audit_shipments', 'SHIP-777');
    const unsubscribeShipment = onSnapshot(shipmentRef, (docSnap) => {
      if (docSnap.exists()) {
        setShipment(docSnap.data());
      }
    }, (err) => {
      console.error('Shipment fetch error:', err);
    });

    return () => {
      unsubscribeDecisions();
      unsubscribeShipment();
    };
  }, []);

  if (loading) {
    return <div style={{ backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading dashboard...</div>;
  }

  if (error) {
    return <div style={{ backgroundColor: '#0f172a', color: '#ef4444', minHeight: '100vh', padding: '2rem' }}><h3>Connection Error</h3><p>Error loading data: {error}</p></div>;
  }

  return (
    <div style={{ backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh', padding: '2rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* 1. TOP ROW: Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <SummaryCard title="Active Disruptions" value="01" icon={AlertTriangle} color="#ef4444" />
        <SummaryCard title="Total CO2 Saved" value="29.7 kg" icon={Leaf} color="#10b981" />
        <SummaryCard title="Integrity Score" value="99.9%" icon={Activity} color="#38bdf8" />
      </div>

      <h2 style={{ fontSize: '1.1rem', color: '#94a3b8', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%', animation: 'pulse 2s infinite' }}></div>
        REAL-TIME SHIPMENT INSIGHTS
      </h2>

      {shipment && (
        <div style={{ backgroundColor: '#1e293b', borderRadius: '16px', padding: '2rem', marginBottom: '2rem', border: '1px solid #334155', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ backgroundColor: '#3b82f620', padding: '12px', borderRadius: '10px' }}>
                <Truck size={24} color="#3b82f6" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{shipment.id || "SHIP-777"}</h3>
                <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{shipment.cargo || "Unknown Cargo"}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#eab30820', padding: '6px 12px', borderRadius: '20px', border: '1px solid #eab30850' }}>
              <Activity size={16} color="#eab308" />
              <span style={{ color: '#eab308', fontWeight: 'bold', fontSize: '0.85rem', textTransform: 'uppercase' }}>{shipment.status || "Unknown Status"}</span>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Origin</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>{shipment.origin || "N/A"}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Destination</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>{shipment.destination || "N/A"}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Risk Level</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '600', color: shipment.risk_level === 'High' || shipment.priority === 'Critical' ? '#ef4444' : '#10b981' }}>{shipment.risk_level || shipment.priority || "Normal"}</div>
            </div>
            {shipment.last_updated && (
              <div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Last Signal</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>{new Date(shipment.last_updated).toLocaleTimeString()}</div>
              </div>
            )}
          </div>
        </div>
      )}

      <h2 style={{ fontSize: '1.1rem', color: '#94a3b8', marginBottom: '1rem' }}>REAL-TIME DECISION FEED</h2>

      {/* 2. MIDDLE SECTION: Decision Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {decisions.map((decision) => (
          <div key={decision.id} style={{ 
            backgroundColor: '#1e293b', 
            borderRadius: '16px', 
            borderLeft: '6px solid #10b981', // Emerald Green Border for AI-Verified
            padding: '2rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Reroute to {decision.suggested_route}</h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Shipment Ref: {decision.shipmentId} • {decision.timestamp}</span>
              </div>
              {/* 3. The Integrity Badge */}
              <IntegrityBadge hash={decision.integrity_hash} />
            </div>

            <p style={{ color: '#cbd5e1', lineHeight: '1.6', marginBottom: '2rem', fontSize: '1.05rem' }}>
              {decision.analysis}
            </p>

            <div style={{ display: 'flex', gap: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Truck size={18} color="#38bdf8" />
                <span style={{ fontWeight: 'bold' }}>{decision.metrics.distance}</span>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Travel Offset</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Leaf size={18} color="#10b981" />
                <span style={{ fontWeight: 'bold' }}>{decision.metrics.co2}</span>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Carbon Saved</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;