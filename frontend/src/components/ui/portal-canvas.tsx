"use client";

import { cn } from "@/lib/utils";

/**
 * A front-facing energy "portal" the ContextPortal wordmark sits inside:
 * a bright electric-blue flaming rim wrapped around a deep dark-navy core —
 * matching the reference vortex, shiny blue on the outside and near-black in
 * the middle, so the wordmark and tagline read cleanly on top.
 *
 * Pure CSS — no WebGL, no GPU required — so it renders identically on laptops,
 * VMs, and RDP sessions. Animation is driven by keyframes in globals.css and
 * automatically stops under prefers-reduced-motion.
 */
export const PortalCanvas = ({ className }: { className?: string }) => {
  const SPARKS = [
    { top: "10%", left: "40%", d: "0s" },
    { top: "18%", left: "68%", d: "0.6s" },
    { top: "44%", left: "14%", d: "1.1s" },
    { top: "56%", left: "86%", d: "0.3s" },
    { top: "78%", left: "34%", d: "1.5s" },
    { top: "30%", left: "60%", d: "0.9s" },
    { top: "84%", left: "62%", d: "1.8s" },
  ];

  return (
    <div className={cn("pointer-events-none relative", className)} aria-hidden>
      <div className="absolute left-1/2 top-1/2 aspect-square w-[86%] -translate-x-1/2 -translate-y-1/2">
        {/* outer atmospheric bloom */}
        <div
          className="absolute inset-[-16%] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(37,99,235,0.45), rgba(29,78,216,0.15) 55%, transparent 72%)",
          }}
        />
        {/* DARK CORE — near-black center ramping to a bright blue rim */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle, #03040f 0%, #050a26 30%, #071947 46%, #0d2f8a 57%, #2563eb 65%, rgba(59,130,246,0.40) 71%, transparent 77%)",
          }}
        />
        {/* flame swirl A — bright electric-blue tongues licking the rim */}
        <div
          className="portal-swirl-a absolute inset-0 rounded-full blur-lg mix-blend-screen"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, rgba(56,189,248,0.9) 30deg, transparent 70deg, rgba(34,211,238,0.85) 150deg, transparent 190deg, rgba(96,165,250,0.9) 260deg, transparent 300deg, rgba(129,140,248,0.85) 340deg, transparent 360deg)",
            maskImage:
              "radial-gradient(circle, transparent 44%, black 58%, black 72%, transparent 86%)",
            WebkitMaskImage:
              "radial-gradient(circle, transparent 44%, black 58%, black 72%, transparent 86%)",
          }}
        />
        {/* flame swirl B (reverse) — softer wisps */}
        <div
          className="portal-swirl-b absolute inset-0 rounded-full blur-2xl mix-blend-screen"
          style={{
            background:
              "conic-gradient(from 90deg, transparent 0deg, rgba(147,197,253,0.8) 40deg, transparent 90deg, rgba(59,130,246,0.75) 180deg, transparent 230deg, rgba(34,211,238,0.7) 300deg, transparent 350deg)",
            maskImage:
              "radial-gradient(circle, transparent 46%, black 60%, black 70%, transparent 84%)",
            WebkitMaskImage:
              "radial-gradient(circle, transparent 46%, black 60%, black 70%, transparent 84%)",
          }}
        />
        {/* bright rim ring — the defining shiny blue outline */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle, transparent 62%, rgba(147,197,253,0.4) 65%, rgba(224,242,254,1) 67.5%, rgba(96,165,250,0.95) 70%, rgba(59,130,246,0.4) 73%, transparent 78%)",
          }}
        />
        {/* rim bloom */}
        <div
          className="absolute inset-0 rounded-full blur-lg opacity-90"
          style={{
            background:
              "radial-gradient(circle, transparent 60%, rgba(56,189,248,0.7) 69%, transparent 82%)",
          }}
        />
        {/* sparks / embers */}
        {SPARKS.map((s, i) => (
          <span
            key={i}
            className="portal-spark absolute h-1 w-1 rounded-full bg-blue-50 shadow-[0_0_8px_2px_rgba(191,219,254,0.9)]"
            style={{ top: s.top, left: s.left, animationDelay: s.d }}
          />
        ))}
      </div>
    </div>
  );
};

export default PortalCanvas;
