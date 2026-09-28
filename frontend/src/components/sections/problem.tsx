"use client";
import React from "react";
import { motion } from "motion/react";
import { Badge } from "@/ui/badge";
import { ShieldAlert, Camera, Clock, Ban } from "lucide-react";

const PAIN_STEPS = [
  { who: "You", text: "“Agent, read this Jira ticket and summarize the blocker.”", tone: "neutral" },
  { who: "Agent", text: "Fetching the page…", tone: "neutral" },
  { who: "Login wall", text: "HTTP 401 Unauthorized — authenticate via Okta SSO.", tone: "bad" },
  { who: "Agent", text: "I can’t access this. Please upload screenshots of every tab.", tone: "bad" },
  { who: "You", text: "Screenshot → crop → upload → copy → paste → explain…", tone: "worst" },
];

const DEMO_TIMELINE = [
  { icon: ShieldAlert, title: "SSO wall encountered", desc: "The agent hits private docs behind an SSO login wall." },
  { icon: Camera, title: "Local session reused", desc: "ContextPortal connects over MCP and reuses your existing browser profile." },
  { icon: Clock, title: "Clean Markdown delivered", desc: "Protected content comes back as clean Markdown — without leaking cookies." },
];

export const ProblemSection = () => {
  return (
    <section id="why" className="relative overflow-hidden border-b border-zinc-900 py-24 sm:py-32">
      <div className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 bg-red-600/8 blur-[140px]" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Badge variant="destructive" className="mb-4">
            <Ban className="mr-1 h-3 w-3" /> The Screenshot Tax
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Every login wall turns you into your agent&apos;s screenshot intern.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-400 sm:text-lg">
            When an agent hits authenticated content, the workflow halts and the manual
            copy-paste begins. Copy-pasting is not an agent architecture.
          </p>
        </div>

        {/* Pain timeline */}
        <div className="mx-auto mt-14 max-w-2xl space-y-3">
          {PAIN_STEPS.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className={`flex items-start gap-3 rounded-xl border p-4 ${
                step.tone === "worst"
                  ? "border-red-800/50 bg-red-950/20"
                  : step.tone === "bad"
                  ? "border-amber-800/40 bg-amber-950/10"
                  : "border-zinc-800 bg-zinc-900/40"
              }`}
            >
              <span
                className={`shrink-0 rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold ${
                  step.tone === "worst"
                    ? "bg-red-500/15 text-red-300"
                    : step.tone === "bad"
                    ? "bg-amber-500/15 text-amber-300"
                    : "bg-zinc-700/40 text-zinc-300"
                }`}
              >
                {step.who}
              </span>
              <span className="text-sm text-zinc-300">{step.text}</span>
            </motion.div>
          ))}
        </div>

        {/* Demo video */}
        <div id="demo" className="mx-auto mt-24 max-w-5xl scroll-mt-24 text-center">
          <Badge variant="glow" className="mb-4">
            Watch in action
          </Badge>
          <h3 className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
            See ContextPortal clear the login wall.
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-zinc-400 sm:text-base">
            An AI agent retrieves protected enterprise content in seconds — no screenshots,
            no credentials touched.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-10 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/80 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center gap-1.5 border-b border-zinc-900 px-4 py-3">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
              <span className="ml-2 font-mono text-xs text-zinc-500">
                zero-leak session bridge
              </span>
            </div>
            <video
              src="/demo.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full"
            />
          </motion.div>

          <div className="mt-10 grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
            {DEMO_TIMELINE.map((item, idx) => (
              <div key={idx} className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-950/40">
                    <item.icon className="h-4 w-4 text-blue-400" />
                  </span>
                  <span className="font-mono text-[11px] text-zinc-500">Step {idx + 1}</span>
                </div>
                <h4 className="mt-3 text-sm font-semibold text-white">{item.title}</h4>
                <p className="mt-1 text-xs text-zinc-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
