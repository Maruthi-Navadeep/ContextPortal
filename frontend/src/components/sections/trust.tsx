"use client";
import React from "react";
import { motion } from "motion/react";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { GithubIcon } from "@/ui/icons";
import { Lock, FileText, ServerOff, ShieldCheck, ExternalLink, Check } from "lucide-react";

const PILLARS = [
  {
    icon: Lock,
    title: "Cookies never leave your machine",
    desc: "Your session lives in a local Playwright profile — never serialized, logged, or transmitted.",
  },
  {
    icon: FileText,
    title: "Agent receives sanitized Markdown only",
    desc: "ContextPortal strips scripts, styles, tracking pixels, and metadata before the agent sees anything.",
  },
  {
    icon: ServerOff,
    title: "No cloud. No proxy. Fully local.",
    desc: "No third-party servers, no cloud relays, no credential proxies. Your data never leaves localhost.",
  },
];

const CHECKS = [
  "100% open source (MIT license)",
  "Local-first architecture, zero cloud relays",
  "Standard Model Context Protocol",
  "Persistent local sessions — authenticate once",
  "Two-tier retrieval engine (HTTP → browser)",
  "Zero credential exposure to the agent",
];

export const TrustSection = () => {
  return (
    <section id="privacy" className="relative overflow-hidden border-b border-zinc-900 py-24 sm:py-32">
      <div className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 bg-emerald-600/8 blur-[140px]" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Badge variant="glow" className="mb-4">
            <ShieldCheck className="mr-1 h-3 w-3" /> Trust architecture
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Your credentials stay yours.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-400 sm:text-lg">
            The browser handles authentication. ContextPortal retrieves the resulting page —
            never your cookies, tokens, or passwords.
          </p>
        </div>

        {/* Privacy pillars */}
        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {PILLARS.map((p, idx) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 backdrop-blur-sm"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-950/40">
                <p.icon className="h-5 w-5 text-emerald-400" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-white">{p.title}</h3>
              <p className="mt-2 text-sm text-zinc-400">{p.desc}</p>
            </motion.div>
          ))}
        </div>

        <p className="mt-8 text-center font-mono text-xs uppercase tracking-widest text-zinc-500">
          Your browser holds the session. Your agent gets the page. Zero cookies leaked.
        </p>

        {/* Open source */}
        <div className="mt-20 grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
          <div>
            <Badge variant="glow" className="mb-4">Open source</Badge>
            <h3 className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
              Open source. Local-first. Built for agents.
            </h3>
            <p className="mt-3 text-sm text-zinc-400 sm:text-base">
              No proprietary lock-in. No cloud subscriptions. Just reliable retrieval infrastructure.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {CHECKS.map((c) => (
                <div key={c} className="flex items-start gap-2 text-sm text-zinc-300">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* GitHub card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-zinc-800 bg-[#0c0c0f] p-6 shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
              <GithubIcon className="h-8 w-8 text-white" />
              <div>
                <p className="font-semibold text-white">NavadeepDj / ContextPortal</p>
                <p className="text-xs text-zinc-500">The authenticated fetch layer for AI agents.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 py-4">
              {["Python 3.12+", "MCP Server", "MIT", "v0.3.0"].map((t) => (
                <span key={t} className="rounded-full border border-zinc-800 bg-zinc-900/60 px-2.5 py-0.5 font-mono text-[11px] text-zinc-400">
                  {t}
                </span>
              ))}
            </div>
            <a href="https://github.com/NavadeepDj/ContextPortal" target="_blank" rel="noreferrer">
              <Button variant="glow" className="w-full justify-center gap-2">
                <GithubIcon className="h-4 w-4" />
                <span>Star on GitHub</span>
                <ExternalLink className="h-3.5 w-3.5 text-blue-200/70" />
              </Button>
            </a>
            <p className="mt-3 text-center text-xs text-zinc-600">
              Don&apos;t trust the landing page. Read the code.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
