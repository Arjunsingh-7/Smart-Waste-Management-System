import { NextRequest, NextResponse } from 'next/server';

// Geocoding proxy — tries Photon first (faster, no rate limit), falls back to Nominatim
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const type = searchParams.get('type') || 'search';

  try {
    // ── REVERSE GEOCODING ──────────────────────────────────────────────
    if (type === 'reverse' && lat && lon) {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1&zoom=18`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'WasteWizard/1.0 (smart-waste-management)',
          'Accept': 'application/json',
          'Accept-Language': 'en',
        },
        // No caching for reverse geocode — coordinates are always unique
        cache: 'no-store',
      });
      if (!res.ok) return NextResponse.json({ error: 'Reverse geocoding failed' }, { status: res.status });
      const data = await res.json();
      return NextResponse.json(data, {
        headers: { 'Cache-Control': 'no-store' },
      });
    }

    // ── FORWARD SEARCH ─────────────────────────────────────────────────
    if (!q) return NextResponse.json({ error: 'Missing query' }, { status: 400 });

    // Try Photon first — open source, Komoot-hosted, no API key, no rate limit
    try {
      const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=5&lang=en`;
      const photonRes = await fetch(photonUrl, {
        headers: { 'Accept': 'application/json' },
        cache: 'no-store',
      });

      if (photonRes.ok) {
        const photonData = await photonRes.json();
        if (photonData?.features?.length > 0) {
          // Convert Photon GeoJSON format to Nominatim-compatible format
          const results = photonData.features.map((f: any) => {
            const p = f.properties;
            const [lng, lat] = f.geometry.coordinates;
            const parts = [p.name, p.street, p.city || p.town || p.village, p.state, p.country].filter(Boolean);
            return {
              lat: String(lat),
              lon: String(lng),
              display_name: parts.join(', '),
              address: {
                road: p.street,
                neighbourhood: p.suburb,
                city: p.city || p.town,
                town: p.town,
                village: p.village,
                state: p.state,
                postcode: p.postcode,
                country: p.country,
              },
            };
          });
          return NextResponse.json(results, {
            headers: { 'Cache-Control': 'no-store' },
          });
        }
      }
    } catch {
      // Photon failed — fall through to Nominatim
    }

    // Fallback: Nominatim with limit=5 for better results
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&addressdetails=1&accept-language=en`;
    const nominatimRes = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'WasteWizard/1.0 (smart-waste-management)',
        'Accept': 'application/json',
        'Accept-Language': 'en',
      },
      cache: 'no-store',
    });

    if (!nominatimRes.ok) {
      return NextResponse.json({ error: 'Search failed' }, { status: nominatimRes.status });
    }

    const data = await nominatimRes.json();
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'no-store' },
    });

  } catch (error) {
    console.error('Geocoding proxy error:', error);
    return NextResponse.json({ error: 'Failed to fetch location data' }, { status: 500 });
  }
}
