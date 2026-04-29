"use client";

import {
  MapContainer, TileLayer, Marker, useMapEvents, useMap, Popup,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Search, Navigation, MapPin, X, Layers, Maximize2, Minimize2,
  CircleDot, StopCircle, CheckCircle2,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

/* ── Types ─────────────────────────────────────────────────────────────── */
interface MapLocationPickerProps {
  latitude: string;
  longitude: string;
  onLocationSelect: (lat: string, lng: string, locationName?: string) => void;
}

interface Suggestion {
  name: string;
  lat: number;
  lng: number;
  source: "custom" | "osm";
  detail?: string;
}

/* ── Custom locations dataset (internal / campus locations) ─────────────
   Add your own locations here — they are searched first before Nominatim.
   ─────────────────────────────────────────────────────────────────────── */
const CUSTOM_LOCATIONS: Suggestion[] = [
  { name: "PSIT College", lat: 26.4499, lng: 80.3319, source: "custom", detail: "Kanpur, Uttar Pradesh" },
  { name: "PSIT Canteen", lat: 26.4502, lng: 80.3322, source: "custom", detail: "PSIT Campus, Kanpur" },
  { name: "PSIT Hostel Block A", lat: 26.4505, lng: 80.3325, source: "custom", detail: "PSIT Campus, Kanpur" },
  { name: "PSIT Library", lat: 26.4512, lng: 80.3331, source: "custom", detail: "PSIT Campus, Kanpur" },
  { name: "PSIT Main Gate", lat: 26.4495, lng: 80.3315, source: "custom", detail: "PSIT Campus, Kanpur" },
  { name: "PSIT Sports Ground", lat: 26.4508, lng: 80.3340, source: "custom", detail: "PSIT Campus, Kanpur" },
];

/* ── Map tile layers ────────────────────────────────────────────────────── */
const MAP_LAYERS = {
  carto: {
    name: "🗺️ Street (Fast)",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
  },
  satellite: {
    name: "🛰️ Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri",
  },
  dark: {
    name: "🌑 Dark",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
  },
  osm: {
    name: "📍 OpenStreetMap",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
};

/* ── Marker icons ───────────────────────────────────────────────────────── */
const getMarkerIcon = () =>
  L.divIcon({
    html: `<svg width="36" height="44" viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg">
      <filter id="s"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.35"/></filter>
      <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 26 18 26S36 31.5 36 18C36 8.06 27.94 0 18 0z" fill="#10b981" filter="url(#s)"/>
      <circle cx="18" cy="18" r="7" fill="white"/>
    </svg>`,
    className: "",
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -44],
  });

const getLiveIcon = () =>
  L.divIcon({
    html: `<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" fill="#3b82f6" opacity="0.25">
        <animate attributeName="r" from="8" to="18" dur="1.5s" repeatCount="indefinite"/>
        <animate attributeName="opacity" from="0.6" to="0" dur="1.5s" repeatCount="indefinite"/>
      </circle>
      <circle cx="20" cy="20" r="8" fill="#3b82f6" stroke="white" stroke-width="3"/>
    </svg>`,
    className: "",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });

/* ── MapController: handles flyTo, geolocation, live tracking ───────────── */
function MapController({
  flyTarget,
  goToLocation,
  onLocationFound,
  livePos,
}: {
  flyTarget: [number, number] | null;
  goToLocation: boolean;
  onLocationFound: (lat: number, lng: number) => void;
  livePos: [number, number] | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (flyTarget) {
      map.flyTo(flyTarget, 17, { animate: true, duration: 0.8 });
    }
  }, [flyTarget, map]);

  useEffect(() => {
    if (!goToLocation) return;
    if (!("geolocation" in navigator)) {
      toast.error("Geolocation not supported by your browser.");
      return;
    }
    const id = toast.loading("Getting your location...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        toast.dismiss(id);
        const { latitude, longitude, accuracy } = pos.coords;
        map.flyTo([latitude, longitude], 17, { animate: true, duration: 0.8 });
        onLocationFound(latitude, longitude);
        toast.success(`Location found! (±${Math.round(accuracy)}m)`);
      },
      (err) => {
        toast.dismiss(id);
        if (err.code === err.PERMISSION_DENIED) toast.error("Location permission denied.");
        else toast.error("Could not get your location.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, [goToLocation, map, onLocationFound]);

  useEffect(() => {
    if (livePos) map.panTo(livePos, { animate: true, duration: 0.4 });
  }, [livePos, map]);

  return null;
}

/* ── MapClickHandler ────────────────────────────────────────────────────── */
function MapClickHandler({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onSelect(e.latlng.lat, e.latlng.lng) });
  return null;
}

/* ── Main component ─────────────────────────────────────────────────────── */
export default function MapLocationPicker({
  latitude, longitude, onLocationSelect,
}: MapLocationPickerProps) {
  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);

  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);
  const [goToLocation, setGoToLocation] = useState(false);
  const [currentLayer, setCurrentLayer] = useState<keyof typeof MAP_LAYERS>("carto");

  const [selectedPos, setSelectedPos] = useState<[number, number] | null>(
    latitude && longitude ? [parseFloat(latitude), parseFloat(longitude)] : null
  );
  const [locationName, setLocationName] = useState("");
  const [detailedAddress, setDetailedAddress] = useState<Record<string, string> | null>(null);

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [livePos, setLivePos] = useState<[number, number] | null>(null);
  const [liveName, setLiveName] = useState("");

  const watchIdRef = useRef<number | null>(null);
  const lastGeocodeRef = useRef<number>(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  const defaultCenter: [number, number] = [26.4499, 80.3319]; // PSIT default
  const mapCenter = livePos || selectedPos || defaultCenter;

  /* ── Reverse geocode via proxy ─────────────────────────────────────── */
  const reverseGeocode = useCallback(async (lat: number, lng: number, isLive = false) => {
    try {
      const res = await fetch(`/api/geocode?type=reverse&lat=${lat}&lon=${lng}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (!data?.display_name) throw new Error();

      const a = data.address || {};
      const parts = [
        a.road, a.neighbourhood || a.suburb,
        a.city || a.town || a.village,
        a.state, a.postcode ? `PIN: ${a.postcode}` : null, a.country,
      ].filter(Boolean);
      const name = parts.join(", ") || data.display_name;

      if (isLive) {
        setLiveName(name);
        onLocationSelect(lat.toFixed(6), lng.toFixed(6), name);
      } else {
        setLocationName(name);
        setDetailedAddress(a);
        onLocationSelect(lat.toFixed(6), lng.toFixed(6), name);
      }
      return name;
    } catch {
      const fallback = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      onLocationSelect(lat.toFixed(6), lng.toFixed(6), fallback);
      return fallback;
    }
  }, [onLocationSelect]);

  /* ── Map click → select + autofill ────────────────────────────────── */
  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    setSelectedPos([lat, lng]);
    setLocationName("Fetching address...");
    // Immediately autofill coordinates
    onLocationSelect(lat.toFixed(6), lng.toFixed(6));
    await reverseGeocode(lat, lng, false);
    toast.success("Location selected!");
  }, [onLocationSelect, reverseGeocode]);

  /* ── Autocomplete: search custom + Nominatim ───────────────────────── */
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) { setSuggestions([]); return; }
    setSearching(true);

    // Layer 1: custom locations
    const custom = CUSTOM_LOCATIONS.filter((loc) =>
      loc.name.toLowerCase().includes(query.toLowerCase())
    );

    // Layer 2: Nominatim via proxy (only if query ≥ 3 chars)
    let osm: Suggestion[] = [];
    if (query.length >= 3) {
      try {
        const res = await fetch(`/api/geocode?type=search&q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          osm = (Array.isArray(data) ? data.slice(0, 4) : []).map((item: any) => ({
            name: item.display_name?.split(",")[0] ?? item.display_name,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            source: "osm" as const,
            detail: item.display_name?.split(",").slice(1, 3).join(",").trim(),
          }));
        }
      } catch { /* silent */ }
    }

    setSuggestions([...custom, ...osm].slice(0, 8));
    setSearching(false);
  }, []);

  /* ── Debounced input handler ───────────────────────────────────────── */
  const handleInputChange = (val: string) => {
    setSearchValue(val);
    setShowSuggestions(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
  };

  /* ── Select a suggestion ───────────────────────────────────────────── */
  const handleSelectSuggestion = useCallback((s: Suggestion) => {
    setSearchValue(s.name);
    setShowSuggestions(false);
    setSuggestions([]);
    setFlyTarget([s.lat, s.lng]);
    setTimeout(() => setFlyTarget(null), 100);
    handleMapClick(s.lat, s.lng);
  }, [handleMapClick]);

  /* ── Manual search (Enter / button) ───────────────────────────────── */
  const handleSearch = useCallback(async () => {
    if (!searchValue.trim()) { toast.error("Please enter a search term"); return; }
    setShowSuggestions(false);

    // Check custom first
    const custom = CUSTOM_LOCATIONS.find((l) =>
      l.name.toLowerCase().includes(searchValue.toLowerCase())
    );
    if (custom) { handleSelectSuggestion(custom); return; }

    // Nominatim fallback
    setSearching(true);
    const id = toast.loading("Searching...");
    try {
      const res = await fetch(`/api/geocode?type=search&q=${encodeURIComponent(searchValue)}`);
      const data = await res.json();
      toast.dismiss(id);
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);
        setFlyTarget([lat, lng]);
        setTimeout(() => setFlyTarget(null), 100);
        handleMapClick(lat, lng);
        toast.success(`Found: ${item.display_name?.split(",").slice(0, 2).join(", ")}`);
      } else {
        toast.error("Location not found. Try a different search term.");
      }
    } catch {
      toast.dismiss(id);
      toast.error("Search failed. Check your connection.");
    } finally {
      setSearching(false);
    }
  }, [searchValue, handleSelectSuggestion, handleMapClick]);

  /* ── Live tracking ─────────────────────────────────────────────────── */
  const startLiveTracking = useCallback(() => {
    if (!("geolocation" in navigator)) { toast.error("Geolocation not supported."); return; }
    setIsLiveTracking(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLivePos([latitude, longitude]);
        const now = Date.now();
        if (now - lastGeocodeRef.current > 5000) {
          lastGeocodeRef.current = now;
          reverseGeocode(latitude, longitude, true);
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) toast.error("Location permission denied.");
        else toast.error("Live tracking failed.");
        stopLiveTracking();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 1000 }
    );
  }, [reverseGeocode]);

  const stopLiveTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsLiveTracking(false);
    setLivePos(null);
    setLiveName("");
  }, []);

  useEffect(() => () => {
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
  }, []);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const layer = MAP_LAYERS[currentLayer];

  return (
    <div className={isFullScreen ? "fixed inset-0 z-[9999] bg-background flex flex-col" : "h-full w-full flex flex-col"}>

      {/* ── Search bar ─────────────────────────────────────────────────── */}
      <div className="bg-background border-b border-border p-3 flex-shrink-0 z-20">
        <div className="flex flex-col gap-2">

          {/* Search input + autocomplete */}
          <div ref={searchBoxRef} className="relative">
            <div className="flex gap-2 items-center bg-card rounded-xl border-2 border-border shadow-sm px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                placeholder="Search city, college, landmark, PIN code..."
                value={searchValue}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={() => searchValue && setShowSuggestions(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); handleSearch(); }
                  if (e.key === "Escape") setShowSuggestions(false);
                }}
                className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => { setSearchValue(""); setSuggestions([]); setShowSuggestions(false); }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={handleSearch}
                disabled={searching}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold transition-colors disabled:opacity-60"
              >
                {searching ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Search className="h-3.5 w-3.5" />
                )}
                Search
              </button>
            </div>

            {/* Autocomplete dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-xl z-[2000] overflow-hidden">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onMouseDown={() => handleSelectSuggestion(s)}
                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-accent text-left transition-colors border-b border-border/50 last:border-0"
                  >
                    <MapPin className={`w-4 h-4 mt-0.5 flex-shrink-0 ${s.source === "custom" ? "text-emerald-500" : "text-muted-foreground"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                      {s.detail && <p className="text-xs text-muted-foreground truncate">{s.detail}</p>}
                    </div>
                    {s.source === "custom" && (
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded flex-shrink-0">
                        Local
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action buttons row */}
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              {selectedPos
                ? <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 inline" /> {selectedPos[0].toFixed(5)}, {selectedPos[1].toFixed(5)}
                  </span>
                : "Click map or search to select location"}
            </p>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => { setGoToLocation(true); setTimeout(() => setGoToLocation(false), 200); }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-accent transition-colors"
                title="Use current location"
              >
                <Navigation className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Current</span>
              </button>

              <button
                type="button"
                onClick={() => isLiveTracking ? stopLiveTracking() : startLiveTracking()}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isLiveTracking
                    ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
                title={isLiveTracking ? "Stop tracking" : "Live track"}
              >
                {isLiveTracking ? <StopCircle className="h-3.5 w-3.5" /> : <CircleDot className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">{isLiveTracking ? "Stop" : "Live"}</span>
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-accent transition-colors"
                  >
                    <Layers className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Layer</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 z-[10000]">
                  {Object.entries(MAP_LAYERS).map(([key, l]) => (
                    <DropdownMenuItem
                      key={key}
                      onClick={() => setCurrentLayer(key as keyof typeof MAP_LAYERS)}
                      className={currentLayer === key ? "bg-accent font-semibold" : ""}
                    >
                      {l.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <button
                type="button"
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-accent transition-colors"
                title={isFullScreen ? "Exit fullscreen" : "Fullscreen"}
              >
                {isFullScreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {/* Live tracking status bar */}
          {isLiveTracking && livePos && (
            <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-lg px-3 py-2">
              <CircleDot className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Live Tracking</span>
                {liveName && <span className="text-xs text-muted-foreground ml-2 truncate">{liveName}</span>}
              </div>
              <span className="text-xs font-mono text-muted-foreground flex-shrink-0">
                {livePos[0].toFixed(5)}, {livePos[1].toFixed(5)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Map ────────────────────────────────────────────────────────── */}
      <div className="flex-1 relative">
        <MapContainer
          center={mapCenter}
          zoom={15}
          scrollWheelZoom={true}
          className="h-full w-full"
          zoomControl={true}
          preferCanvas={true}
          zoomSnap={0.25}
          zoomDelta={0.5}
          // @ts-ignore — valid Leaflet option
          zoomAnimation={true}
          fadeAnimation={true}
          markerZoomAnimation={true}
        >
          <TileLayer
            key={currentLayer}
            attribution={layer.attribution}
            url={layer.url}
            maxZoom={19}
            updateWhenIdle={false}
            keepBuffer={4}
          />

          <MapClickHandler onSelect={handleMapClick} />
          <MapController
            flyTarget={flyTarget}
            goToLocation={goToLocation}
            onLocationFound={handleMapClick}
            livePos={livePos}
          />

          {/* Selected marker */}
          {selectedPos && !isLiveTracking && (
            <Marker position={selectedPos} icon={getMarkerIcon()}>
              <Popup maxWidth={300}>
                <div className="p-2 space-y-2">
                  <p className="font-semibold text-sm flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-500" /> Selected Location
                  </p>
                  {locationName && locationName !== "Fetching address..." && (
                    <p className="text-xs text-muted-foreground">{locationName}</p>
                  )}
                  {detailedAddress && (
                    <div className="text-xs space-y-1 border-t pt-2">
                      {detailedAddress.road && <p>🛣️ {detailedAddress.road}</p>}
                      {(detailedAddress.city || detailedAddress.town) && <p>🏙️ {detailedAddress.city || detailedAddress.town}</p>}
                      {detailedAddress.state && <p>📍 {detailedAddress.state}</p>}
                      {detailedAddress.postcode && <p>📮 PIN: {detailedAddress.postcode}</p>}
                    </div>
                  )}
                  <div className="text-xs font-mono border-t pt-2 text-muted-foreground">
                    {selectedPos[0].toFixed(6)}, {selectedPos[1].toFixed(6)}
                  </div>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Live tracking marker */}
          {isLiveTracking && livePos && (
            <Marker position={livePos} icon={getLiveIcon()}>
              <Popup>
                <div className="p-2 text-xs">
                  <p className="font-semibold text-blue-500 mb-1">🔵 Live Position</p>
                  {liveName && <p className="text-muted-foreground mb-1">{liveName}</p>}
                  <p className="font-mono">{livePos[0].toFixed(6)}, {livePos[1].toFixed(6)}</p>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
}
