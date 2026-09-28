"use client";
import React, { useRef } from "react";
import { Badge } from "@/ui/badge";
import { AnimatedBeam } from "@/ui/animated-beam";
import {
  Bot,
  Globe,
  Shield,
  FileCheck,
  Layers,
  MousePointerClick,
  X,
  Check,
} from "lucide-react";

const BROWSER_STEPS = ["Click", "Type", "Scroll", "Wait", "Click again", "Extract"];

export const SolutionSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const agentRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const httpRef = useRef<HTMLDivElement>(null);
  const browserRef = useRef<HTMLDivElement>(null);
  const markdownRef = useRef<HTMLDivElement>(null);

  return (
    <section id="how" className="relative overflow-hidden border-b border-zinc-900 py-24 sm:py-32">
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[300px] w-[550px] -translate-x-1/2 -translate-y-1/2 bg-blue-600/10 blur-[140px]" />

      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
        <Badge variant="glow" className="mb-4">
          The Solution
        </Badge>
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
          Authenticate once. Retrieve continuously.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-400 sm:text-lg">
          A two-tier engine: a fast HTTP path for public pages, and your own authenticated
          browser session for everything behind a login wall — returned as clean Markdown.
        </p>

        {/* Beam diagram */}
        <div
          ref={containerRef}
          className="relative mx-auto mt-16 w-full max-w-4xl rounded-2xl border border-zinc-800 bg-zinc-950/70 p-8 shadow-2xl backdrop-blur-xl sm:p-12"
        >
          <div className="flex flex-col items-center">
            <div
              ref={agentRef}
              className="z-10 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/40 bg-blue-950/80 shadow-lg shadow-blue-500/20"
            >
              <Bot className="h-7 w-7 text-blue-400" />
            </div>
            <span className="mt-2 font-mono text-xs font-semibold text-zinc-300">
              AI Agent (Claude / Cursor / Antigravity)
            </span>
            <span className="font-mono text-[11px] text-blue-400">
              fetch_context(&quot;https://private.site.com&quot;)
            </span>
          </div>

          <div className="my-14 flex flex-col items-center">
            <div
              ref={portalRef}
              className="z-10 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-indigo-500/60 bg-gradient-to-br from-indigo-900 to-blue-950 shadow-2xl shadow-indigo-500/30"
            >
              <Shield className="h-8 w-8 text-indigo-300" />
            </div>
            <span className="mt-2 text-base font-bold text-white">ContextPortal Core Engine</span>
            <span className="text-xs text-zinc-500">Two-tier transparent retrieval pipeline</span>
          </div>

          <div className="mx-auto grid max-w-lg grid-cols-2 gap-8">
            <div className="flex flex-col items-center">
              <div
                ref={httpRef}
                className="z-10 flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/90 shadow-md"
              >
                <Globe className="h-5 w-5 text-emerald-400" />
              </div>
              <span className="mt-2 text-xs font-semibold text-zinc-300">Tier 1: Public HTTP</span>
              <span className="font-mono text-[10px] text-zinc-500">Fast fetch via httpx</span>
            </div>
            <div className="flex flex-col items-center">
              <div
                ref={browserRef}
                className="z-10 flex h-12 w-12 items-center justify-center rounded-xl border border-amber-500/40 bg-amber-950/40 shadow-md"
              >
                <Layers className="h-5 w-5 text-amber-400" />
              </div>
              <span className="mt-2 text-xs font-semibold text-zinc-300">
                Tier 2: Authenticated Browser
              </span>
              <span className="font-mono text-[10px] text-zinc-500">Persistent local session</span>
            </div>
          </div>

          <div className="mt-14 flex flex-col items-center">
            <div
              ref={markdownRef}
              className="z-10 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/50 bg-emerald-950/80 shadow-lg shadow-emerald-500/20"
            >
              <FileCheck className="h-7 w-7 text-emerald-400" />
            </div>
            <span className="mt-2 font-mono text-xs font-semibold text-emerald-300">
              Clean, LLM-ready Markdown
            </span>
            <span className="text-[11px] text-zinc-500">Returned straight to agent context</span>
          </div>

          <AnimatedBeam containerRef={containerRef} fromRef={agentRef} toRef={portalRef} duration={3} gradientStartColor="#3b82f6" gradientStopColor="#6366f1" />
          <AnimatedBeam containerRef={containerRef} fromRef={portalRef} toRef={httpRef} duration={4} delay={0.5} gradientStartColor="#6366f1" gradientStopColor="#10b981" />
          <AnimatedBeam containerRef={containerRef} fromRef={portalRef} toRef={browserRef} duration={4} delay={1} gradientStartColor="#6366f1" gradientStopColor="#f59e0b" />
          <AnimatedBeam containerRef={containerRef} fromRef={browserRef} toRef={markdownRef} duration={3.5} delay={1.5} gradientStartColor="#f59e0b" gradientStopColor="#10b981" />
        </div>

        {/* Core promises */}
        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-4 text-left md:grid-cols-4">
          {[
            { title: "One request", desc: "No multi-turn prompting" },
            { title: "Zero screenshots", desc: "No vision-token bloat" },
            { title: "Zero copy-paste", desc: "Agent reads autonomously" },
            { title: "Zero leaked cookies", desc: "Sessions stay on local disk" },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 backdrop-blur-sm">
              <h4 className="text-sm font-semibold text-white">{item.title}</h4>
              <p className="mt-1 text-xs text-zinc-500">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Not a browser — a retrieval tool */}
        <div className="mx-auto mt-16 max-w-4xl rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 text-left shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="mb-6 text-center">
            <h3 className="text-2xl font-extrabold text-white">
              A retrieval tool, not a browser to operate.
            </h3>
            <p className="mx-auto mt-2 max-w-xl text-sm text-zinc-400">
              A browser is a tool for humans. An agent needs one semantic call — not a fragile
              click-and-scroll script that breaks on the next DOM change.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-red-900/40 bg-red-950/10 p-5">
              <span className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wide text-red-400">
                <MousePointerClick className="h-3.5 w-3.5" /> Browser agent
              </span>
              <div className="mt-3 flex flex-wrap gap-2">
                {BROWSER_STEPS.map((step) => (
                  <span key={step} className="flex items-center gap-1 rounded-md border border-red-900/40 bg-red-950/20 px-2 py-1 text-xs text-zinc-400">
                    <X className="h-3 w-3 text-red-400" /> {step}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs text-zinc-500">6 brittle operations. Any DOM change breaks it.</p>
            </div>

            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/15 p-5">
              <span className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wide text-emerald-400">
                <Check className="h-3.5 w-3.5" /> ContextPortal
              </span>
              <div className="mt-3 rounded-md border border-emerald-500/20 bg-emerald-950/20 px-3 py-2 font-mono text-xs text-emerald-300">
                fetch_context(url) → clean Markdown
              </div>
              <p className="mt-3 text-xs text-zinc-400">
                1 semantic operation. DOM-agnostic. Never breaks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
