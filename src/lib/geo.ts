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
 *
 * FIX (Bug 2 & 9): Uses api.postalpincode.in as the PRIMARY coordinate source
 * because it returns accurate Latitude/Longitude directly for Indian pincodes.
 * Nominatim is kept only as a last-resort fallback — its Indian coverage is
 * too poor to be relied upon.
 *
 * Returns null when the pincode is unknown or all external APIs are unreachable.
 */
export async function geocodePincodeServer(
  pincode: string,
): Promise<{ lat: number; lng: number; city: string; state: string } | null> {
  try {
    const postalRes = await fetch(
      `https://api.postalpincode.in/pincode/${pincode}`,
      { next: { revalidate: 3600 } },
    );
    if (!postalRes.ok) return null;

    const postalData = await postalRes.json();
    const postOffice = postalData?.[0]?.PostOffice?.[0];
    if (!postOffice) return null;

    const city: string = postOffice.District ?? postOffice.Name;
    const state: string = postOffice.State;

    // Primary: lat/lng directly from postal API
    const rawLat = postOffice.Latitude;
    const rawLng = postOffice.Longitude;
    if (rawLat && rawLat !== "NA" && rawLng && rawLng !== "NA") {
      return { lat: parseFloat(rawLat), lng: parseFloat(rawLng), city, state };
    }

    // Fallback 1: Nominatim by postcode (last resort)
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${pincode}&countrycodes=in&format=json&limit=1`,
      {
        headers: { "Accept-Language": "en", "User-Agent": "Harvestly/1.0" },
        next: { revalidate: 3600 },
      },
    );
    const geoData = await geoRes.json();
    if (geoData?.[0]) {
      return {
        lat: parseFloat(geoData[0].lat),
        lng: parseFloat(geoData[0].lon),
        city,
        state,
      };
    }

    // Fallback 2: Nominatim by city+state name (absolute last resort)
    if (city && state) {
      const q = encodeURIComponent(`${city}, ${state}, India`);
      const geoRes2 = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${q}&countrycodes=in&format=json&limit=1`,
        {
          headers: { "Accept-Language": "en", "User-Agent": "Harvestly/1.0" },
          next: { revalidate: 3600 },
        },
      );
      const geoData2 = await geoRes2.json();
      if (geoData2?.[0]) {
        return {
          lat: parseFloat(geoData2[0].lat),
          lng: parseFloat(geoData2[0].lon),
          city,
          state,
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}
