"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Navigation, MapPin, Layers, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Dustbin {
  id: number;
  name: string;
  type: string;
  locationName: string;
  latitude: string;
  longitude: string;
  fillLevel: number;
  status: string;
  isActive: boolean;
  organizationName?: string;
}

interface DustbinMapProps {
  dustbins: Dustbin[];
}

interface MapLayer {
  name: string;
  url: string;
  attribution: string;
  overlay?: string;
}

const MAP_LAYERS: Record<string, MapLayer> = {
  street: {
    name: "Street",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  satellite: {
    name: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: 'Tiles &copy; Esri',
  },
  hybrid: {
    name: "Hybrid",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: 'Tiles &copy; Esri',
    overlay: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  },
  terrain: {
    name: "Terrain",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
  },
  detailed: {
    name: "Detailed",
    url: "https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
};

const getMarkerIcon = (fillLevel: number, type: string) => {
  let color: string;
  
  if (fillLevel >= 75) {
    color = type === "wet" ? "#dc2626" : "#16a34a";
  } else if (fillLevel >= 50) {
    color = "#f59e0b";
  } else if (fillLevel >= 25) {
    color = "#eab308";
  } else {
    color = "#22c55e";
  }

  const iconType = type === "wet" ? "💧" : "🗑️";

  const svgIcon = `
    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" fill="${color}" stroke="white" stroke-width="3" opacity="0.9"/>
      <text x="20" y="14" font-size="14" font-weight="bold" text-anchor="middle" fill="white">
        ${iconType}
      </text>
      <text x="20" y="28" font-size="11" font-weight="bold" text-anchor="middle" fill="white">
        ${fillLevel}%
      </text>
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    className: "custom-marker-icon",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

function MapBounds({ dustbins }: { dustbins: Dustbin[] }) {
  const map = useMap();

  useEffect(() => {
    if (dustbins.length > 0) {
      const bounds = L.latLngBounds(
        dustbins.map((bin) => [parseFloat(bin.latitude), parseFloat(bin.longitude)])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [dustbins, map]);

  return null;
}

function MapControls({
  onSearch,
  onCurrentLocation,
  searchValue,
  onSearchChange,
  onClearSearch,
  currentLayer,
  onLayerChange,
}: {
  onSearch: () => void;
  onCurrentLocation: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  currentLayer: keyof typeof MAP_LAYERS;
  onLayerChange: (layer: keyof typeof MAP_LAYERS) => void;
}) {
  return (
    <>
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] w-full max-w-2xl px-4">
        <div className="flex gap-2 items-center bg-background/95 backdrop-blur-sm rounded-lg border shadow-lg p-2">
          <Search className="h-5 w-5 text-muted-foreground ml-2" />
          <Input
            type="text"
            placeholder="Search cities, landmarks, addresses (e.g., 'Mumbai', 'India Gate')..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSearch();
              }
            }}
            className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
          />
          {searchValue && (
            <Button
              onClick={onClearSearch}
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button onClick={onSearch} className="gap-2">
            <Search className="h-4 w-4" />
            Search
          </Button>
        </div>
      </div>

      <div className="absolute top-24 right-4 z-[1000] flex flex-col gap-2">
        <Button
          onClick={onCurrentLocation}
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90"
          title="Go to current location"
        >
          <Navigation className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              className="h-12 w-12 rounded-full shadow-lg bg-background hover:bg-accent"
              title="Change map layer"
            >
              <Layers className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {Object.entries(MAP_LAYERS).map(([key, layer]) => (
              <DropdownMenuItem
                key={key}
                onClick={() => onLayerChange(key as keyof typeof MAP_LAYERS)}
                className={currentLayer === key ? "bg-accent" : ""}
              >
                <MapPin className="h-4 w-4 mr-2" />
                {layer.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}

function MapInteractions({
  searchQuery,
  onSearchComplete,
  goToLocation,
}: {
  searchQuery: string;
  onSearchComplete: () => void;
  goToLocation: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    if (searchQuery) {
      const geocodeSearch = async () => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              searchQuery
            )}&limit=1`
          );
          const data = await response.json();

          if (data && data.length > 0) {
            const { lat, lon, display_name } = data[0];
            map.setView([parseFloat(lat), parseFloat(lon)], 15);
            toast.success(`Found: ${display_name}`);
            
            const marker = L.marker([parseFloat(lat), parseFloat(lon)], {
              icon: L.divIcon({
                html: `<div style="background: #ef4444; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white;"></div>`,
                className: "search-marker",
                iconSize: [24, 24],
                iconAnchor: [12, 12],
              }),
            })
              .addTo(map)
              .bindPopup(`<b>${display_name}</b>`)
              .openPopup();

            setTimeout(() => {
              map.removeLayer(marker);
            }, 5000);
          } else {
            toast.error("Location not found. Try a different search term.");
          }
        } catch (error) {
          console.error("Geocoding error:", error);
          toast.error("Failed to search location. Please try again.");
        }
        onSearchComplete();
      };

      geocodeSearch();
    }
  }, [searchQuery, map, onSearchComplete]);

  useEffect(() => {
    if (goToLocation) {
      if ("geolocation" in navigator) {
        toast.loading("Getting your location...");
        navigator.geolocation.getCurrentPosition(
          (position) => {
            toast.dismiss();
            const { latitude, longitude } = position.coords;
            map.setView([latitude, longitude], 15);
            
            const marker = L.marker([latitude, longitude], {
              icon: L.divIcon({
                html: `<div style="background: #3b82f6; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);"></div>`,
                className: "current-location-marker",
                iconSize: [24, 24],
                iconAnchor: [12, 12],
              }),
            })
              .addTo(map)
              .bindPopup("<b>Your Current Location</b>")
              .openPopup();

            toast.success("Location found!");

            setTimeout(() => {
              map.removeLayer(marker);
            }, 5000);
          },
          (error) => {
            toast.dismiss();
            toast.error("Could not get your location. Please enable location access.");
            console.error("Geolocation error:", error);
          }
        );
      } else {
        toast.error("Geolocation is not supported by your browser.");
      }
    }
  }, [goToLocation, map]);

  return null;
}

export default function SuperAdminMap({ dustbins }: DustbinMapProps) {
  const [searchValue, setSearchValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [goToLocation, setGoToLocation] = useState(false);
  const [currentLayer, setCurrentLayer] = useState<keyof typeof MAP_LAYERS>("detailed");

  const handleSearch = () => {
    if (searchValue.trim()) {
      setSearchQuery(searchValue);
    } else {
      toast.error("Please enter a search term");
    }
  };

  const handleClearSearch = () => {
    setSearchValue("");
    setSearchQuery("");
  };

  const handleCurrentLocation = () => {
    setGoToLocation(true);
    setTimeout(() => setGoToLocation(false), 100);
  };

  const handleSearchComplete = () => {
    setSearchQuery("");
  };

  if (dustbins.length === 0) {
    return (
      <div className="h-[500px] flex items-center justify-center bg-muted rounded-2xl border border-dashed border-border">
        <div className="text-center">
          <p className="text-muted-foreground font-medium">No smart dustbins registered yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Registered bins from all organizations will be plotted here.
          </p>
        </div>
      </div>
    );
  }

  const defaultCenter: [number, number] = [19.0760, 72.8777];
  const center: [number, number] = dustbins.length > 0
    ? [parseFloat(dustbins[0].latitude), parseFloat(dustbins[0].longitude)]
    : defaultCenter;

  const selectedLayer = MAP_LAYERS[currentLayer];

  return (
    <div className="h-[500px] rounded-2xl overflow-hidden border relative shadow-md">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full"
        zoomControl={true}
      >
        <TileLayer
          attribution={selectedLayer.attribution}
          url={selectedLayer.url}
        />
        {currentLayer === "hybrid" && selectedLayer.overlay && (
          <TileLayer
            url={selectedLayer.overlay}
            opacity={0.3}
          />
        )}
        <MapBounds dustbins={dustbins} />
        <MapInteractions
          searchQuery={searchQuery}
          onSearchComplete={handleSearchComplete}
          goToLocation={goToLocation}
        />
        {dustbins.map((dustbin) => (
          <Marker
            key={dustbin.id}
            position={[parseFloat(dustbin.latitude), parseFloat(dustbin.longitude)]}
            icon={getMarkerIcon(dustbin.fillLevel, dustbin.type)}
          >
            <Popup>
              <div className="p-2 min-w-[220px]">
                <h3 className="font-bold text-base mb-1.5 text-slate-800 dark:text-slate-100">{dustbin.name}</h3>
                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  <p>
                    <span className="font-semibold">Org:</span> <strong className="text-[#16C47F]">{dustbin.organizationName || "N/A"}</strong>
                  </p>
                  <p>
                    <span className="font-semibold">Location:</span> {dustbin.locationName}
                  </p>
                  <p>
                    <span className="font-semibold">Type:</span>{" "}
                    <span className="capitalize">
                      {dustbin.type === "wet" ? "🔴 Wet Waste" : "🟢 Dry Waste"}
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold">Fill Level:</span>{" "}
                    <span className={`font-bold ${
                      dustbin.fillLevel >= 75 ? "text-red-600" :
                      dustbin.fillLevel >= 50 ? "text-orange-500" :
                      dustbin.fillLevel >= 25 ? "text-yellow-500" :
                      "text-green-600"
                    }`}>
                      {dustbin.fillLevel}%
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold">Status:</span>{" "}
                    <span className="capitalize font-medium">
                      {dustbin.fillLevel >= 75
                        ? "🚨 Full - Collection Needed"
                        : dustbin.fillLevel >= 50
                        ? "⚠️ Half Full"
                        : "✅ Normal"}
                    </span>
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <MapControls
        onSearch={handleSearch}
        onCurrentLocation={handleCurrentLocation}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onClearSearch={handleClearSearch}
        currentLayer={currentLayer}
        onLayerChange={setCurrentLayer}
      />
    </div>
  );
}
