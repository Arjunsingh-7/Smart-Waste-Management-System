"use client";

import React from "react";
import { MapPin } from "lucide-react";

import { X } from "lucide-react";

export default function LayerSwitcher<T extends Record<string, any>>({
  layers,
  current,
  onChange,
  className = "",
  onClose,
}: {
  layers: T;
  current: keyof T | string;
  onChange: (k: keyof T | string) => void;
  className?: string;
  onClose?: () => void;
}) {
  return (
    <div className={`absolute top-24 right-4 z-[1200] ${className}`}>
      <div className="bg-white/95 dark:bg-slate-900/95 rounded-md shadow-lg ring-1 ring-border p-2 w-48">
        <div className="flex items-center justify-between mb-1">
          <div className="text-xs text-muted-foreground font-medium px-1">Map Layer</div>
          {onClose && (
            <button onClick={onClose} className="p-1 rounded hover:bg-muted">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
        <div className="flex flex-col gap-1">
          {Object.entries(layers).map(([key, layer]) => {
            const sel = String(current) === key;
            return (
              <button
                key={key}
                onClick={() => onChange(key)}
                className={`flex items-center gap-2 text-sm rounded-md px-2 py-1 text-left w-full transition-colors ${
                  sel ? "bg-accent text-accent-foreground font-semibold" : "hover:bg-muted"
                }`}
              >
                <span className="w-4 inline-block">{sel ? "✔" : ""}</span>
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="truncate">{(layer as any).name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
