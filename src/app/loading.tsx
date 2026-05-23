import React from "react";

export default function Loading() {
  return (
    <div className="p-6 space-y-6 animate-pulse max-w-7xl mx-auto">
      <div className="h-8 w-64 bg-muted rounded" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="h-32 bg-muted rounded-2xl" />
        <div className="h-32 bg-muted rounded-2xl" />
        <div className="h-32 bg-muted rounded-2xl" />
        <div className="h-32 bg-muted rounded-2xl" />
      </div>
      <div className="h-80 bg-muted rounded-2xl" />
    </div>
  );
}
