"use client";

import React from "react";
import { Trash2, CloudOff, Repeat, Server } from "lucide-react";

export default function EnvironmentalImpactBanner({
  wasteCollected = 0,
  co2Reduced = 0,
  collectionsCompleted = 0,
  smartBinsActive = 0,
  impactScore = 0,
}: {
  wasteCollected?: number;
  co2Reduced?: number;
  collectionsCompleted?: number;
  smartBinsActive?: number;
  impactScore?: number;
}) {
  return (
    <section className="mt-6">
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#072116] via-[#08251b] to-[#021116] border border-white/6 p-6 backdrop-blur-sm shadow-md">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 600 200">
            <defs>
              <linearGradient id="g1" x1="0" x2="1">
                <stop offset="0%" stopColor="#074b2c" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#012018" stopOpacity="0.08" />
              </linearGradient>
            </defs>
            <rect width="600" height="200" fill="url(#g1)" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-6">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white">Environmental Impact Analytics</h3>
            <p className="text-sm text-emerald-200 mt-1">Real-time summary of waste reduction and sustainability metrics across your deployment.</p>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="p-3 rounded-2xl bg-white/3 border border-white/6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-600/20">
                    <Trash2 className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <p className="text-xs text-emerald-200">Waste Collected</p>
                    <p className="text-lg font-semibold text-white">{wasteCollected.toLocaleString()} kg</p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/3 border border-white/6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-600/10">
                    <CloudOff className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <p className="text-xs text-emerald-200">CO₂ Reduced</p>
                    <p className="text-lg font-semibold text-white">{co2Reduced.toLocaleString()} kg</p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/3 border border-white/6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-600/10">
                    <Repeat className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <p className="text-xs text-emerald-200">Collections Completed</p>
                    <p className="text-lg font-semibold text-white">{collectionsCompleted}</p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/3 border border-white/6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-600/10">
                    <Server className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <p className="text-xs text-emerald-200">Smart Bins Active</p>
                    <p className="text-lg font-semibold text-white">{smartBinsActive}</p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/3 border border-white/6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-600/10">
                    <svg width="20" height="20" viewBox="0 0 24 24" className="text-emerald-300"><circle cx="12" cy="12" r="10" fill="#16C47F" opacity="0.16"/></svg>
                  </div>
                  <div>
                    <p className="text-xs text-emerald-200">Environmental Impact</p>
                    <p className="text-lg font-semibold text-white">{impactScore}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Illustration */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="w-full h-36 rounded-2xl bg-gradient-to-br from-emerald-700/10 to-black/10 border border-white/6 flex items-center justify-center">
              {/* lightweight vector illustration */}
              <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="8" y="48" width="40" height="32" rx="4" fill="#08321e" opacity="0.6" />
                <rect x="56" y="36" width="56" height="44" rx="6" fill="#0b3d24" opacity="0.7" />
                <rect x="120" y="56" width="24" height="28" rx="4" fill="#0a2e1a" opacity="0.6" />
                <circle cx="36" cy="34" r="10" fill="#16C47F" opacity="0.9" />
                <path d="M10 92 L150 92" stroke="#08321e" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
