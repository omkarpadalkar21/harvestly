/**
 * Haversine formula — returns the great-circle distance in kilometres
 * between two points on the Earth's surface.
 */
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Returns whether a seller at (sellerLat, sellerLng) with a given
 * service radius can deliver to a customer at (customerLat, customerLng).
 */
export function sellerServesLocation(
  sellerLat: number,
  sellerLng: number,
  serviceRadiusKm: number,
  customerLat: number,
  customerLng: number,
): boolean {
  return (
    haversineKm(sellerLat, sellerLng, customerLat, customerLng) <=
    serviceRadiusKm
  );
}

/**
 * Server-side pincode → (lat, lng, city, state) geocoding.
 * Uses the Indian postal API for city/state and Nominatim for coordinates.
 *
 * FIX (Bug 2 & 9): Previously only available on the client. Pulled into this
 * shared lib so Tenants.ts beforeChange hook can call it server-side when
 * a seller updates their pincode from the Payload CMS admin panel.
 *
 * Returns null when the pincode is unknown or external APIs are unreachable.
 */
export async function geocodePincodeServer(pincode: string): Promise<{
  lat: number;
  lng: number;
  city: string;
  state: string;
} | null> {
  try {
    // Step 1 — Indian postal API for city/state
    const postalRes = await fetch(
      `https://api.postalpincode.in/pincode/${pincode}`,
      { next: { revalidate: 3600 } }, // cache 1h — pincodes don't change
    );
    if (!postalRes.ok) return null;
    const postalData = await postalRes.json();
    const postOffice = postalData?.[0]?.PostOffice?.[0];
    if (!postOffice) return null;

    // Step 2 — Nominatim for coordinates
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${pincode}&countrycodes=in&format=json&limit=1`,
      {
        headers: { "Accept-Language": "en", "User-Agent": "Harvestly/1.0" },
        next: { revalidate: 3600 },
      },
    );
    if (!geoRes.ok) return null;
    const geoData = await geoRes.json();
    if (!geoData?.[0]) return null;

    return {
      lat: parseFloat(geoData[0].lat),
      lng: parseFloat(geoData[0].lon),
      city: postOffice.District ?? postOffice.Name,
      state: postOffice.State,
    };
  } catch {
    return null;
  }
}
