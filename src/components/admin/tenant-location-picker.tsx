'use client';

import { useField } from '@payloadcms/ui';
import { useState } from 'react';
import { MapPinIcon, LocateIcon } from 'lucide-react';

export function TenantLocationPicker() {
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [pincode, setPincode] = useState('');

  // These useField hooks connect directly to the Tenant document's fields.
  // Payload v3 useField paths are ABSOLUTE from the document root.
  // formState is a flat map: key 'location.lat' maps to the lat field inside
  // the location group. The group context does NOT auto-prefix useField paths.
  // Using bare 'lat' would look for a non-existent top-level field — no-op.
  const { value: latValue, setValue: setLat }   = useField<number>({ path: 'location.lat' });
  const { value: lngValue, setValue: setLng }   = useField<number>({ path: 'location.lng' });
  const { setValue: setCity }  = useField<string>({ path: 'location.city' });
  const { setValue: setState } = useField<string>({ path: 'location.state' });
  const { setValue: setPin }   = useField<string>({ path: 'location.pincode' });

  // GPS detection — uses browser geolocation + Nominatim reverse geocode
  async function handleGPS() {
    if (!navigator.geolocation) {
      setStatus('❌ Geolocation is not supported by your browser.');
      return;
    }
    setIsLoading(true);
    setStatus('📡 Detecting location...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;

          // Reverse geocode to get city/state/pincode
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { 'Accept-Language': 'en', 'User-Agent': 'Harvestly/1.0' } },
          );
          const data = await res.json();
          const addr = data?.address ?? {};

          const detectedCity    = addr.city ?? addr.town ?? addr.village ?? addr.county ?? '';
          const detectedState   = addr.state ?? '';
          const detectedPincode = addr.postcode ?? '';

          // Write values into Payload form fields
          console.log('[TenantLocationPicker] GPS → calling setLat/setLng', { latitude, longitude });
          setLat(latitude);
          setLng(longitude);
          setCity(detectedCity);
          setState(detectedState);
          if (detectedPincode) setPin(detectedPincode);

          setStatus(
            `✅ Location set: ${detectedCity || 'Unknown'}, ${detectedState} (${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E). Click Save to persist.`,
          );
        } catch {
          setStatus('⚠️ Could not reverse-geocode. Coordinates saved, but city/state may be empty.');
        } finally {
          setIsLoading(false);
        }
      },
      (err) => {
        setStatus(
          err.code === 1
            ? '❌ Location access denied. Use the pincode option below.'
            : '❌ Could not detect location. Try the pincode option.',
        );
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  // Pincode lookup — uses postalpincode.in as primary, Nominatim as fallback
  async function handlePincode() {
    if (!/^\d{6}$/.test(pincode)) {
      setStatus('❌ Enter a valid 6-digit Indian pincode.');
      return;
    }
    setIsLoading(true);
    setStatus('🔍 Looking up pincode...');

    try {
      // Primary: api.postalpincode.in (returns coords directly)
      const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await res.json();
      const po = data?.[0]?.PostOffice?.[0];
      if (!po) throw new Error('Pincode not found');

      const city  = String(po.District ?? po.Name ?? '');
      const state = String(po.State ?? '');

      const rawLat = po.Latitude;
      const rawLng = po.Longitude;

      let lat: number | null = null;
      let lng: number | null = null;

      if (rawLat && rawLat !== 'NA' && rawLng && rawLng !== 'NA') {
        const pl = parseFloat(rawLat);
        const pg = parseFloat(rawLng);
        if (!isNaN(pl) && !isNaN(pg)) { lat = pl; lng = pg; }
      }

      // Fallback: Nominatim postcode search
      if (lat === null || lng === null) {
        const geo = await fetch(
          `https://nominatim.openstreetmap.org/search?postalcode=${pincode}&countrycodes=in&format=json&limit=1`,
          { headers: { 'Accept-Language': 'en', 'User-Agent': 'Harvestly/1.0' } },
        );
        const gd = await geo.json();
        if (gd?.[0]) { lat = parseFloat(gd[0].lat); lng = parseFloat(gd[0].lon); }
      }

      setPin(pincode);
      setCity(city);
      setState(state);

      if (lat !== null && lng !== null) {
        console.log('[TenantLocationPicker] Pincode → calling setLat/setLng', { lat, lng });
        setLat(lat);
        setLng(lng);
        setStatus(
          `✅ Location set: ${city}, ${state} (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E). Click Save to persist.`,
        );
      } else {
        setStatus(
          `⚠️ City/state found (${city}, ${state}) but no coordinates available. Try GPS instead.`,
        );
      }
    } catch {
      setStatus('❌ Could not look up that pincode. Check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={{ border: '1px solid #d1d5db', borderRadius: 8, padding: 16, marginBottom: 16, background: '#f9fafb' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <MapPinIcon style={{ width: 18, height: 18, color: '#16a34a' }} />
        <strong style={{ fontSize: 14 }}>Set Delivery Origin</strong>
      </div>

      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>
        This is the location you ship FROM (your farm, warehouse, etc.).
        It can be different from your home address.
        The service radius below determines how far you deliver.
      </p>

      {/* GPS Button */}
      <button
        type="button"
        disabled={isLoading}
        onClick={handleGPS}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#16a34a', color: '#fff', border: 'none',
          borderRadius: 6, padding: '8px 16px', cursor: 'pointer',
          fontSize: 13, fontWeight: 600, marginBottom: 12,
          opacity: isLoading ? 0.6 : 1,
        }}
      >
        <LocateIcon style={{ width: 16, height: 16 }} />
        {isLoading ? 'Detecting...' : 'Detect my current location (GPS)'}
      </button>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
        <span style={{ fontSize: 12, color: '#9ca3af' }}>or enter pincode</span>
        <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
      </div>

      {/* Pincode Input */}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={pincode}
          maxLength={6}
          placeholder="e.g. 411001"
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          style={{
            flex: 1, padding: '7px 10px',
            border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13,
          }}
        />
        <button
          type="button"
          disabled={isLoading || pincode.length !== 6}
          onClick={handlePincode}
          style={{
            background: '#111', color: '#fff', border: 'none',
            borderRadius: 6, padding: '8px 14px', cursor: 'pointer',
            fontSize: 13, opacity: isLoading || pincode.length !== 6 ? 0.5 : 1,
          }}
        >
          Set
        </button>
      </div>

      {/* Status Message */}
      {status && (
        <p style={{
          marginTop: 10, fontSize: 13,
          color: status.startsWith('✅')
            ? '#16a34a'
            : status.startsWith('⚠️')
            ? '#d97706'
            : '#dc2626',
        }}>
          {status}
        </p>
      )}

      {/* ── DIAGNOSTIC: live form-state readback ────────────────────────────
           After clicking GPS / Set pincode, latValue & lngValue should update
           IMMEDIATELY below (before you click Save). If they stay
           "⚠️ undefined", useField is pointing to the wrong path and
           the Save will NOT persist coordinates.
      ──────────────────────────────────────────────────────────────────────── */}
      <div style={{
        marginTop: 10, padding: '6px 10px',
        background: '#f0fdf4', borderRadius: 6,
        border: '1px solid #bbf7d0', fontSize: 12, color: '#166534',
      }}>
        <strong>Form state check</strong> — lat:{' '}
        <code>{latValue != null ? String(latValue) : '⚠️ undefined'}</code>{' '}|
        lng:{' '}
        <code>{lngValue != null ? String(lngValue) : '⚠️ undefined'}</code>
        <br />
        <span style={{ color: '#6b7280' }}>
          Should update as soon as the GPS/pincode picker writes to form state.
        </span>
      </div>
    </div>
  );
}
