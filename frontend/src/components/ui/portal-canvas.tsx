"use client";

import { cn } from "@/lib/utils";

/**
 * A front-facing "portal" the ContextPortal wordmark sits inside: an upright
 * oval with a hot glowing blue rim and swirling plasma, kept translucent in the
 * center so the wordmark and tagline stay readable.
 *
 * Pure CSS — no WebGL, no GPU required — so it renders identically on laptops,
 * VMs, and RDP sessions. Animation is driven by keyframes in globals.css and
 * automatically stops under prefers-reduced-motion.
 */
export const PortalCanvas = ({ className }: { className?: string }) => {
  const SPARKS = [
    { top: "14%", left: "34%", d: "0s" },
    { top: "22%", left: "64%", d: "0.6s" },
    { top: "40%", left: "20%", d: "1.1s" },
    { top: "58%", left: "78%", d: "0.3s" },
    { top: "72%", left: "40%", d: "1.5s" },
    { top: "34%", left: "58%", d: "0.9s" },
    { top: "80%", left: "58%", d: "1.8s" },
  ];

  return (
    <div className={cn("pointer-events-none relative", className)} aria-hidden>
      <div className="absolute left-1/2 top-1/2 aspect-square w-[86%] -translate-x-1/2 -translate-y-1/2 scale-y-110">
        {/* outer atmospheric glow */}
        <div
          className="absolute inset-[-14%] rounded-full blur-2xl"
          style={{
            background:
              "radial-gradient(circle, rgba(37,99,235,0.4), rgba(37,99,235,0.12) 52%, transparent 72%)",
          }}
        />
        {/* translucent plasma core — dark enough that the wordmark reads clearly */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(29,78,216,0.14) 0%, rgba(37,99,235,0.30) 44%, rgba(59,130,246,0.42) 60%, rgba(37,99,235,0.22) 69%, transparent 74%)",
          }}
        />
        {/* swirl A — energy concentrated toward the rim */}
        <div
          className="portal-swirl-a absolute inset-0 rounded-full blur-xl mix-blend-screen"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, rgba(96,165,250,0.75) 45deg, transparent 105deg, rgba(34,211,238,0.7) 175deg, transparent 240deg, rgba(129,140,248,0.8) 310deg, transparent 355deg)",
            maskImage:
              "radial-gradient(circle, transparent 26%, black 44%, black 66%, transparent 73%)",
            WebkitMaskImage:
              "radial-gradient(circle, transparent 26%, black 44%, black 66%, transparent 73%)",
          }}
        />
        {/* swirl B (reverse) */}
        <div
          className="portal-swirl-b absolute inset-0 rounded-full blur-2xl mix-blend-screen"
          style={{
            background:
              "conic-gradient(from 120deg, transparent 0deg, rgba(147,197,253,0.7) 60deg, transparent 135deg, rgba(129,140,248,0.65) 225deg, transparent 300deg)",
            maskImage:
              "radial-gradient(circle, transparent 32%, black 48%, black 64%, transparent 72%)",
            WebkitMaskImage:
              "radial-gradient(circle, transparent 32%, black 48%, black 64%, transparent 72%)",
          }}
        />
        {/* bright rim ring — the defining blue outline */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle, transparent 60%, rgba(147,197,253,0.5) 64%, rgba(224,242,254,1) 67.5%, rgba(96,165,250,0.95) 70.5%, rgba(59,130,246,0.35) 74%, transparent 80%)",
          }}
        />
        {/* rim bloom */}
        <div
          className="absolute inset-0 rounded-full blur-lg opacity-90"
          style={{
            background:
              "radial-gradient(circle, transparent 58%, rgba(96,165,250,0.65) 69%, transparent 82%)",
          }}
        />
        {/* sparks */}
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
