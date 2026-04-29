"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Play, X, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef, memo, useMemo } from "react";

// All media: images first, then video last
const IMAGES = [
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/pexels-vladvictoria-2682683-1-1764266256298.jpg",
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Dustbin2-1764266272236.png",
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/dustbin-1764266285457.png",
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Screenshot-2025-11-27-231932-1764266295810.png",
  "/wasteprocess.jpeg",
];
const VIDEO_SRC = "/Waste_Wizard__Smart_Waste.mp4";
const SLIDE_INTERVAL = 3500;

const StatCard = memo(({ value, label }: { value: string; label: string }) => (
  <div>
    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">{value}</div>
    <div className="text-xs sm:text-sm text-muted-foreground mt-1">{label}</div>
  </div>
));
StatCard.displayName = "StatCard";

/* ── Full-screen modal ─────────────────────────────────────────────────── */
function VideoModal({ onClose }: { onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 20 }}
          className="relative w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <video
            src={VIDEO_SRC}
            controls
            autoPlay
            className="w-full aspect-video bg-black"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Demo card ─────────────────────────────────────────────────────────── */
function DemoCard() {
  const [imgIndex, setImgIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const slideRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-slide images, then switch to video after one full cycle
  useEffect(() => {
    if (showVideo) return;

    slideRef.current = setInterval(() => {
      setImgIndex((prev) => {
        const next = (prev + 1) % IMAGES.length;
        if (next === 0) {
          // completed one cycle → switch to video
          clearInterval(slideRef.current!);
          setTimeout(() => setShowVideo(true), 400);
        }
        return next;
      });
    }, SLIDE_INTERVAL);

    return () => clearInterval(slideRef.current!);
  }, [showVideo]);

  // Progress bar for video
  useEffect(() => {
    if (!showVideo) { setProgress(0); return; }
    progressRef.current = setInterval(() => {
      if (videoRef.current) {
        const pct = videoRef.current.duration
          ? (videoRef.current.currentTime / videoRef.current.duration) * 100
          : 0;
        setProgress(pct);
      }
    }, 200);
    return () => clearInterval(progressRef.current!);
  }, [showVideo]);

  const handleCardClick = useCallback(() => setModalOpen(true), []);

  return (
    <>
      {modalOpen && <VideoModal onClose={() => setModalOpen(false)} />}

      <div className="relative w-full max-w-lg mx-auto">
        {/* Main card */}
        <div
          className="group relative rounded-[28px] overflow-hidden border-2 border-emerald-400/40 shadow-2xl cursor-pointer
            bg-gradient-to-br from-white/10 to-white/5 dark:from-white/5 dark:to-white/[0.02]
            backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-emerald-400/20 hover:shadow-2xl"
          onClick={handleCardClick}
          style={{ boxShadow: "0 0 40px rgba(34,197,94,0.12), 0 20px 60px rgba(0,0,0,0.2)" }}
        >
          {/* Media area */}
          <div className="relative aspect-video overflow-hidden bg-slate-900">

            {/* Images */}
            <AnimatePresence mode="wait">
              {!showVideo && (
                <motion.div
                  key={`img-${imgIndex}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={IMAGES[imgIndex]}
                    alt={`Waste Wizard demo ${imgIndex + 1}`}
                    fill
                    className="object-cover"
                    priority={imgIndex === 0}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Video */}
            <AnimatePresence>
              {showVideo && (
                <motion.div
                  key="video"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.7 }}
                  className="absolute inset-0"
                >
                  <video
                    ref={videoRef}
                    src={VIDEO_SRC}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

            {/* Live Demo badge */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Live Demo
            </div>

            {/* Fullscreen hint */}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-sm text-white rounded-full p-1.5">
              <Maximize2 className="w-3.5 h-3.5" />
            </div>

            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/60 flex items-center justify-center">
                <Play className="w-7 h-7 text-white fill-white ml-1" />
              </div>
            </div>

            {/* Progress bar */}
            {showVideo && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                <motion.div
                  className="h-full bg-emerald-400"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            )}

            {/* Image slide indicators */}
            {!showVideo && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {IMAGES.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setImgIndex(i); }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === imgIndex ? "w-6 bg-emerald-400" : "w-1.5 bg-white/40"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Below-video info strip */}
          <div className="flex items-center justify-between px-5 py-3 bg-white/5 dark:bg-black/20 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">See Waste Wizard in action</p>
                <p className="text-xs text-muted-foreground">Complete workflow from smart bin to real-time monitoring</p>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setModalOpen(true); }}
              className="text-xs font-semibold text-emerald-500 hover:text-emerald-400 whitespace-nowrap flex items-center gap-1 transition-colors"
            >
              Watch Full Demo <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Floating Live Alert badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="absolute -bottom-4 -right-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-3.5 flex items-center gap-3 border border-emerald-400/20 z-10"
        >
          <div className="relative bg-primary/10 rounded-full p-2.5">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-bold">Live Alert</div>
            <div className="text-xs text-muted-foreground">Bin #47 at 85%</div>
          </div>
        </motion.div>

        {/* Slide indicators below card */}
        <div className="flex justify-center gap-2 mt-8">
          {IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => { setShowVideo(false); setImgIndex(i); }}
              className={`h-2 rounded-full transition-all duration-300 ${
                !showVideo && i === imgIndex ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
            />
          ))}
          <button
            onClick={() => setShowVideo(true)}
            className={`h-2 rounded-full transition-all duration-300 ${
              showVideo ? "w-8 bg-red-500" : "w-2 bg-muted-foreground/30 hover:bg-red-400"
            }`}
            title="Video"
          />
        </div>
      </div>
    </>
  );
}

/* ── Hero ──────────────────────────────────────────────────────────────── */
export const Hero = memo(function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20 sm:pt-24 pb-12 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-background to-emerald-50/30 dark:from-emerald-950/20 dark:via-background dark:to-emerald-950/10 -z-10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-[1]">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">

          {/* Left — unchanged */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-6">
              <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">IoT-Powered Waste Management System</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6">
              Smarter Waste<br />Management for a{" "}
              <span className="text-primary">Cleaner Tomorrow</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0">
              Monitor, track, and manage your waste collection system in real-time with smart dustbins, live alerts, and advanced analytics.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/register" prefetch={false}>
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-base h-12 sm:h-14 px-8 w-full sm:w-auto">
                  Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/hardware-guide" prefetch={false}>
                <Button size="lg" variant="outline" className="text-base h-12 sm:h-14 px-8 border-2 w-full sm:w-auto gap-2">
                  <Play className="w-4 h-4 fill-current" /> Watch Live Demo
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4 sm:gap-8 mt-12 pt-8 border-t border-border/50">
              <StatCard value="500+" label="Active Dustbins" />
              <StatCard value="99.9%" label="System Uptime" />
              <StatCard value="24/7" label="Real-time Monitoring" />
            </div>
          </motion.div>

          {/* Right — upgraded demo card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="relative flex items-center justify-center"
          >
            <DemoCard />
          </motion.div>
        </div>
      </div>
    </section>
  );
});
