import { NextRequest, NextResponse } from 'next/server';

// Proxy for Nominatim geocoding — avoids CORS and User-Agent issues from browser
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const type = searchParams.get('type') || 'search'; // 'search' or 'reverse'

  try {
    let url: string;

    if (type === 'reverse' && lat && lon) {
      url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1&zoom=18`;
    } else if (q) {
      url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1&addressdetails=1`;
    } else {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'WasteWizard/1.0 (smart-waste-management)',
        'Accept': 'application/json',
        'Accept-Language': 'en',
      },
      next: { revalidate: 60 }, // cache for 60s
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Geocoding service error' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Geocoding proxy error:', error);
    return NextResponse.json({ error: 'Failed to fetch location data' }, { status: 500 });
  }
}
