const axios = require('axios');

async function getImpactData(origin, destination, mapsKey) {
  const url = `https://routes.googleapis.com/directions/v2:computeRoutes`;

  try {
    const response = await axios.post(url, {
      origin: { address: origin },
      destination: { address: destination },
      travelMode: "DRIVE"
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': mapsKey,
        'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters'
      }
    });

    const route = response.data.routes[0];
    const km = route.distanceMeters / 1000;

    return {
      distance: km.toFixed(2) + " km",
      co2: (km * 0.2).toFixed(2) + " kg" // Sustainability ROI
    };
  } catch (error) {
    return { error: "Maps calculation failed" };
  }
}

module.exports = { getImpactData };