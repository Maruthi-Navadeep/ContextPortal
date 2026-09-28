"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { Button } from "@/ui/button";
import { ShimmerButton } from "@/ui/shimmer-button";
import { GithubIcon } from "@/components/ui/icons";
import {
  ArrowRight,
  Terminal,
  Play,
  ShieldCheck,
  Bot,
  Lock,
  Sparkles,
} from "lucide-react";

const PortalCanvas = dynamic(
  () => import("@/ui/portal-canvas").then((m) => m.PortalCanvas),
  { ssr: false }
);

const PILLS = ["Open source", "Local-first", "MCP-native", "Zero credential exposure"];

// Authentic `contextportal fetch` run — mirrors the real CLI output shape.
const FETCH_STEPS = [
  "$ contextportal fetch https://jira.internal.company.com/browse/ENG-4291",
  "Attempting normal public fetch...",
  "Public fetch hit 401/403 — SSO login wall detected.",
  "Falling back to your authorized browser session...",
  "Login detected! Page returned to target domain.",
  "Extracting content with Readability + Markdownify...",
  "",
  "================================================================",
  "Title: ENG-4291 · Checkout latency regression",
  "Retrieval Method: browser (Authenticated: True)",
  "================================================================",
  "# ENG-4291 · Checkout latency regression",
  "**Source URL**: https://jira.internal.company.com/browse/ENG-4291",
  "Delivered clean, LLM-ready Markdown. Zero cookies passed to the agent.",
];

export const HeroSection = () => {
  const [fetchingState, setFetchingState] = useState<"idle" | "fetching" | "success">("idle");
  const [fetchLog, setFetchLog] = useState<string[]>([]);

  const handleSimulateFetch = () => {
    if (fetchingState === "fetching") return;
    setFetchingState("fetching");
    setFetchLog([]);
    FETCH_STEPS.forEach((step, i) => {
      setTimeout(() => {
        setFetchLog((prev) => [...prev, step]);
        if (i === FETCH_STEPS.length - 1) setFetchingState("success");
      }, (i + 1) * 360);
    });
  };

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden border-b border-zinc-900/60 pt-24 pb-20">
      {/* Ambient gradient wash */}
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.10),transparent_55%)]" />

      {/* WebGL portal behind the wordmark */}
      <div className="pointer-events-none absolute left-1/2 top-[36%] -z-10 h-[720px] w-[720px] -translate-x-1/2 -translate-y-1/2 [mask-image:radial-gradient(circle,black_70%,transparent_92%)]">
        <PortalCanvas className="h-full w-full" />
      </div>

      <div className="mx-auto flex max-w-5xl flex-col items-center px-4 text-center sm:px-6 lg:px-8">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-medium text-blue-300 backdrop-blur-sm"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span className="font-semibold">The authenticated fetch layer for AI agents</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-300">v0.3.0</span>
        </motion.div>

        {/* Wordmark overlapping the portal */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="bg-gradient-to-br from-white via-blue-100 to-purple-200 bg-clip-text text-6xl font-extrabold tracking-tight text-transparent drop-shadow-[0_0_40px_rgba(129,140,248,0.35)] sm:text-7xl md:text-8xl"
        >
          ContextPortal
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-300 sm:text-xl"
        >
          Give your AI agent access to authenticated web pages{" "}
          <span className="font-medium text-white">
            — without giving it your credentials.
          </span>{" "}
          Log in once in your browser; your agent retrieves the page as clean Markdown, forever.
        </motion.p>

        {/* Pill badges */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-7 flex flex-wrap items-center justify-center gap-2.5"
        >
          {PILLS.map((pill) => (
            <span
              key={pill}
              className="rounded-full border border-zinc-800 bg-zinc-900/60 px-3.5 py-1.5 text-xs font-medium text-zinc-300 backdrop-blur-sm"
            >
              {pill}
            </span>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-4"
        >
          <a href="#install">
            <ShimmerButton
              shimmerColor="#60a5fa"
              className="gap-2 px-6 py-3.5 text-sm font-medium shadow-blue-500/20"
            >
              <Terminal className="h-4 w-4 text-blue-400" />
              <span>uv tool install contextportal</span>
            </ShimmerButton>
          </a>
          <a href="#demo">
            <Button variant="outline" size="lg" className="gap-2 border-zinc-800 bg-zinc-900/60 hover:border-zinc-700">
              <Play className="h-4 w-4 fill-blue-400 text-blue-400" />
              <span>Watch Demo</span>
            </Button>
          </a>
          <a href="https://github.com/NavadeepDj/ContextPortal" target="_blank" rel="noreferrer">
            <Button variant="outline" size="lg" className="gap-2">
              <GithubIcon className="h-4 w-4" />
              <span>GitHub</span>
            </Button>
          </a>
        </motion.div>

        {/* Real terminal panel */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-14 w-full max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3 shadow-2xl backdrop-blur-xl sm:p-5"
        >
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3 font-mono text-xs text-zinc-500">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
              <span className="ml-2">contextportal — fetch</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-zinc-400">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
              <span>Authenticated session</span>
            </div>
          </div>

          <div className="mt-3.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
              <Lock className="h-4 w-4 text-amber-400" />
              <span>jira.internal.company.com/browse/ENG-4291</span>
            </div>
            <Button
              onClick={handleSimulateFetch}
              disabled={fetchingState === "fetching"}
              variant="glow"
              className="gap-2 px-5 text-sm"
            >
              {fetchingState === "fetching" ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  <span>Fetching...</span>
                </>
              ) : (
                <>
                  <span>Run fetch</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          <div className="mt-4 flex min-h-[190px] flex-col justify-start overflow-hidden rounded-lg border border-zinc-900 bg-[#050507] p-4 text-left font-mono text-xs text-zinc-300">
            {fetchLog.length === 0 ? (
              <div className="my-auto flex flex-col items-center justify-center py-6 text-zinc-500">
                <Bot className="mb-2 h-7 w-7 text-zinc-600" />
                <p>Click &quot;Run fetch&quot; to watch ContextPortal clear a login wall.</p>
              </div>
            ) : (
              <div className="max-h-56 space-y-1 overflow-y-auto">
                {fetchLog.map((log, index) => (
                  <div
                    key={index}
                    className={
                      log.startsWith("$")
                        ? "text-zinc-500"
                        : log.includes("401/403")
                        ? "text-amber-400"
                        : log.includes("browser") || log.includes("authorized")
                        ? "text-blue-400"
                        : log.startsWith("#") || log.startsWith("**") || log.includes("Zero cookies")
                        ? "text-emerald-400"
                        : "text-zinc-300"
                    }
                  >
                    {log || " "}
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
