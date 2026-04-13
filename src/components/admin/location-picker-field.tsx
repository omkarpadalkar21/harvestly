'use client';

import { useField } from '@payloadcms/ui';
import { useState } from 'react';
import { MapPinIcon, LocateIcon } from 'lucide-react';

/**
 * LocationPickerField — Payload v3 custom UI field component.
 *
 * Embed this as a `type: 'ui'` field inside ANY Payload group that contains:
 *   <group>.lat, <group>.lng, <group>.city, <group>.state, <group>.pincode
 *
 * The `fieldPrefix` prop must be the dot-path of the containing group
 * (e.g. "location" for a field called `location`).
 *
 * Usage in a collection:
 *   { name: '_locationPicker', type: 'ui', admin: {
 *     components: { Field: '@/components/admin/location-picker-field#LocationPickerField' }
 *   }}
 */

interface LocationPickerFieldProps {
  /**
   * Dot-path prefix for field paths passed to useField().
   *
   * useField() in Payload v3 takes ABSOLUTE paths from the document root.
   * formState is a flat map keyed by full path, e.g. 'location.lat'.
   * The group context does NOT auto-prefix paths in useField.
   *
   * For a UI field inside the `location` group, the sibling fields are at
   * 'location.lat', 'location.lng' etc. — so fieldPrefix must be 'location'.
   */
  fieldPrefix?: string;
}

export function LocationPickerField({ fieldPrefix = 'location' }: LocationPickerFieldProps) {
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [pincode, setPincode] = useState('');

  // Payload v3: useField paths are ABSOLUTE from the document root.
  // fieldPrefix='location' => p('lat') = 'location.lat' which is the correct key
  // in Payload's flat form-state map.
  const p = (field: string) => fieldPrefix ? `${fieldPrefix}.${field}` : field;

  // Connect to the enclosing group's fields via absolute form-state paths.
  // These setValue functions write directly to Payload's React form state;
  // the user must still click Save to persist to the database.
  const { value: latValue, setValue: setLat }   = useField<number>({ path: p('lat') });
  const { value: lngValue, setValue: setLng }   = useField<number>({ path: p('lng') });
  const { setValue: setCity }  = useField<string>({ path: p('city') });
  const { setValue: setState } = useField<string>({ path: p('state') });
  const { setValue: setPin }   = useField<string>({ path: p('pincode') });

  // ── GPS ─────────────────────────────────────────────────────────────────────
  async function handleGPS() {
    if (!navigator.geolocation) {
      setStatus('❌ Geolocation is not supported by your browser.');
      return;
    }
    setIsLoading(true);
    setStatus('📡 Detecting your location…');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { 'Accept-Language': 'en', 'User-Agent': 'Harvestly/1.0' } },
          );
          const data = await res.json();
          const addr = data?.address ?? {};

          const city    = addr.city ?? addr.town ?? addr.village ?? addr.county ?? '';
          const state   = addr.state ?? '';
          const pc      = addr.postcode ?? '';

          console.log('[LocationPickerField] GPS → calling setLat/setLng', { latitude, longitude, path_lat: p('lat'), path_lng: p('lng') });
          setLat(latitude);
          setLng(longitude);
          setCity(city);
          setState(state);
          if (pc) setPin(pc);

          setStatus(
            `✅ Location set: ${city || 'Unknown'}, ${state} (${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°). Click Save to persist.`,
          );
        } catch {
          setStatus('⚠️ GPS coords captured but reverse-geocoding failed. City/state may be blank.');
        } finally {
          setIsLoading(false);
        }
      },
      (err) => {
        setStatus(
          err.code === 1
            ? '❌ Location access denied. Use the pincode option below.'
            : '❌ Could not get GPS location. Try the pincode option.',
        );
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  // ── Pincode ──────────────────────────────────────────────────────────────────
  async function handlePincode() {
    if (!/^\d{6}$/.test(pincode)) {
      setStatus('❌ Enter a valid 6-digit Indian pincode.');
      return;
    }
    setIsLoading(true);
    setStatus('🔍 Looking up pincode…');

    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await res.json();
      const po = data?.[0]?.PostOffice?.[0];
      if (!po) throw new Error('not found');

      const city  = String(po.District ?? po.Name ?? '');
      const state = String(po.State ?? '');

      let lat: number | null = null;
      let lng: number | null = null;
      const rl = po.Latitude;
      const rg = po.Longitude;
      if (rl && rl !== 'NA' && rg && rg !== 'NA') {
        const pl = parseFloat(rl), pg = parseFloat(rg);
        if (!isNaN(pl) && !isNaN(pg)) { lat = pl; lng = pg; }
      }

      // Nominatim fallback
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
        console.log('[LocationPickerField] Pincode → calling setLat/setLng', { lat, lng, path_lat: p('lat'), path_lng: p('lng') });
        setLat(lat);
        setLng(lng);
        setStatus(`✅ Location set: ${city}, ${state} (${lat.toFixed(4)}°, ${lng.toFixed(4)}°). Click Save to persist.`);
      } else {
        setStatus(`⚠️ City/state found (${city}, ${state}) but no coordinates. Try GPS instead.`);
      }
    } catch {
      setStatus('❌ Could not look up that pincode. Check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }

  // ── UI ───────────────────────────────────────────────────────────────────────
  const btnBase: React.CSSProperties = {
    border: 'none', borderRadius: 6, cursor: 'pointer',
    fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
    padding: '8px 16px', opacity: isLoading ? 0.6 : 1,
  };

  return (
    <div style={{
      border: '1px solid #d1d5db', borderRadius: 8,
      padding: 16, marginBottom: 16, background: '#f9fafb',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <MapPinIcon style={{ width: 18, height: 18, color: '#16a34a' }} />
        <strong style={{ fontSize: 14 }}>Set Location via GPS or Pincode</strong>
      </div>
      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>
        Use GPS to auto-detect your current position, or type a 6-digit pincode.
        This fills in the lat, lng, city, and state fields automatically.
        <br />
        <strong>Click Save button after setting location.</strong>
      </p>

      {/* GPS Button */}
      <button
        type="button"
        disabled={isLoading}
        onClick={handleGPS}
        style={{ ...btnBase, background: '#16a34a', color: '#fff', marginBottom: 12 }}
      >
        <LocateIcon style={{ width: 16, height: 16 }} />
        {isLoading ? 'Working…' : 'Detect my current location (GPS)'}
      </button>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
        <span style={{ fontSize: 12, color: '#9ca3af' }}>or enter pincode manually</span>
        <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
      </div>

      {/* Pincode Row */}
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
            ...btnBase,
            background: '#111', color: '#fff',
            opacity: isLoading || pincode.length !== 6 ? 0.4 : 1,
          }}
        >
          Set
        </button>
      </div>

      {/* Status */}
      {status && (
        <p style={{
          marginTop: 10, fontSize: 13,
          color: status.startsWith('✅') ? '#16a34a'
               : status.startsWith('⚠️') ? '#d97706'
               : '#dc2626',
        }}>
          {status}
        </p>
      )}

      {/* ── DIAGNOSTIC: form-state readback ─────────────────────────────────
           If latValue / lngValue are UNDEFINED here even after clicking GPS/
           pincode, the useField paths are pointing to a non-existent field.
           If they update, the paths are correct and Save will persist them.
      ─────────────────────────────────────────────────────────────────────── */}
      <div style={{
        marginTop: 10, padding: '6px 10px',
        background: '#f0fdf4', borderRadius: 6,
        border: '1px solid #bbf7d0', fontSize: 12, color: '#166534',
      }}>
        <strong>Form state check</strong> — lat:{' '}
        <code>{latValue != null ? latValue.toFixed(6) : '⚠️ undefined'}</code>{' '}|
        lng:{' '}
        <code>{lngValue != null ? lngValue.toFixed(6) : '⚠️ undefined'}</code>
        <br />
        <span style={{ color: '#6b7280' }}>
          (Updates immediately when picker writes to form state.
          If still ⚠️ undefined after GPS/pincode, click Save anyway — Payload may still persist via direct form fields below.)
        </span>
      </div>
    </div>
  );
}

/**
 * Convenience re-export for Tenants.ts (fieldPrefix defaults to "location")
 */
export { LocationPickerField as TenantLocationPicker };
