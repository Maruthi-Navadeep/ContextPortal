"use client";
import React, { useState } from "react";
import { motion } from "motion/react";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { BorderBeam } from "@/ui/border-beam";
import { Card } from "@/ui/card";
import { Copy, Check, Bot, Code2, Terminal, KeyRound, Link2 } from "lucide-react";

const STEPS = [
  {
    n: "01",
    title: "Connect your agent",
    cmd: "contextportal setup",
    desc: "Auto-detects Cursor, Google Antigravity, and Claude Desktop and registers the MCP server. Zero JSON editing.",
    tag: "Automatic setup",
    icon: Terminal,
  },
  {
    n: "02",
    title: "Log in once",
    cmd: "contextportal login",
    desc: "Log into your private sites (Jira, Confluence, SSO) in the opened browser once. Your session stays on your disk.",
    tag: "One-time human auth",
    icon: KeyRound,
  },
  {
    n: "03",
    title: "Give your agent the URL",
    cmd: "→ paste any protected URL in chat",
    desc: "ContextPortal retrieves the clean Markdown context autonomously — no screenshots, ever.",
    tag: "Autonomous flow",
    icon: Link2,
  },
];

const CODE = `# One semantic MCP call
result = await fetch_context(
    "https://confluence.corp.com/display/ENG/Q3-Roadmap"
)

# Returns a clean Markdown string:
print(result)
# ---------------------------------------------
# # Q3 Engineering Roadmap
# **Source URL**: https://confluence.corp.com/...
# **Retrieval Method**: browser (Authenticated: True)
# ---
# ## Overview ...`;

const CONFIG = `{
  "mcpServers": {
    "context-portal": {
      "command": "contextportal",
      "args": ["mcp"]
    }
  }
}`;

const CLIENTS = [
  { name: "Cursor", color: "text-blue-400", path: "Auto-detected" },
  { name: "Google Antigravity", color: "text-purple-400", path: "Auto-detected" },
  { name: "Claude Desktop", color: "text-amber-400", path: "Auto-detected" },
  { name: "VS Code / Cline", color: "text-emerald-400", path: "Manual fallback" },
];

export const ConnectSection = () => {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <section id="mcp" className="relative overflow-hidden border-b border-zinc-900 py-24 sm:py-32">
      <div className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 bg-indigo-600/8 blur-[140px]" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Badge variant="glow" className="mb-4">
            <Code2 className="mr-1 h-3 w-3" /> Connect your agent
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Three commands. One semantic tool.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-400 sm:text-lg">
            Install, connect your agent, log in once — then just give your agent the URL.
          </p>
        </div>

        {/* 3 steps */}
        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {STEPS.map((step, idx) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
            >
              <Card className="relative h-full overflow-hidden">
                <BorderBeam duration={12} size={220} delay={idx * 3} colorFrom="#6366f1" colorTo="#3b82f6" />
                <div className="flex items-center justify-between">
                  <span className="font-mono text-2xl font-extrabold text-zinc-700">{step.n}</span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-950/40">
                    <step.icon className="h-4 w-4 text-blue-400" />
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-white">{step.title}</h3>
                <div className="mt-2 rounded-md border border-zinc-800 bg-[#09090c] px-3 py-1.5 font-mono text-xs text-blue-300">
                  {step.cmd}
                </div>
                <p className="mt-3 text-sm text-zinc-400">{step.desc}</p>
                <span className="mt-4 inline-block rounded-full border border-zinc-800 bg-zinc-900/60 px-2.5 py-0.5 font-mono text-[10px] text-zinc-400">
                  {step.tag}
                </span>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Code + MCP details */}
        <div className="mt-16 grid grid-cols-1 items-start gap-8 text-left lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-[#0c0c0f] shadow-2xl"
          >
            <BorderBeam duration={15} size={300} colorFrom="#6366f1" colorTo="#3b82f6" />
            <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-4 py-3">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
                <span className="ml-2 font-mono text-xs text-zinc-500">mcp_agent.py</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => copy(CODE, "code")} className="h-7 gap-1.5 px-2 text-xs">
                {copied === "code" ? (
                  <><Check className="h-3 w-3 text-emerald-400" /><span className="text-emerald-400">Copied</span></>
                ) : (
                  <><Copy className="h-3 w-3" /><span>Copy</span></>
                )}
              </Button>
            </div>
            <div className="overflow-x-auto p-5">
              <pre className="font-mono text-sm leading-relaxed">
                <code>
                  {CODE.split("\n").map((line, i) => (
                    <div key={i} className="flex">
                      <span className="mr-4 w-6 shrink-0 select-none text-right text-xs text-zinc-700">{i + 1}</span>
                      <span
                        className={
                          line.startsWith("#")
                            ? "text-zinc-500"
                            : line.includes("fetch_context")
                            ? "text-blue-400"
                            : line.includes("print")
                            ? "text-purple-300"
                            : line.includes('"')
                            ? "text-amber-300"
                            : "text-zinc-300"
                        }
                      >
                        {line || " "}
                      </span>
                    </div>
                  ))}
                </code>
              </pre>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="space-y-6"
          >
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-sm">
              <h3 className="mb-3 text-lg font-bold text-white">Model Context Protocol (MCP)</h3>
              <p className="text-sm leading-relaxed text-zinc-400">
                ContextPortal exposes a single{" "}
                <code className="rounded bg-blue-950/40 px-1.5 py-0.5 text-xs text-blue-400">fetch_context</code>{" "}
                tool via the{" "}
                <a href="https://modelcontextprotocol.io" target="_blank" rel="noreferrer" className="text-blue-400 underline underline-offset-4 hover:text-blue-300">
                  Model Context Protocol
                </a>
                . Any MCP-compatible client can call it out of the box.
              </p>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-blue-500/30 bg-[#09090d] p-5 shadow-2xl">
              <div className="mb-3 flex items-center justify-between border-b border-zinc-800 pb-3">
                <span className="flex items-center gap-2 font-mono text-xs font-bold text-blue-400">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                  contextportal setup
                </span>
                <span className="font-mono text-[11px] text-zinc-500">Zero JSON editing</span>
              </div>
              <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-zinc-300">
{`  [+] Claude Desktop  : Configured & Ready
  [+] Cursor          : Configured & Ready
  [+] Google Antigravity : Configured & Ready

Done! Restart your AI client to load ContextPortal.`}
              </pre>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-sm">
              <h4 className="mb-3 font-mono text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Supported AI clients
              </h4>
              <div className="grid grid-cols-2 gap-2.5">
                {CLIENTS.map((c) => (
                  <div key={c.name} className="flex flex-col rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-2.5">
                    <div className="mb-1 flex items-center gap-1.5">
                      <Bot className={`h-3.5 w-3.5 ${c.color}`} />
                      <span className="text-xs font-medium text-zinc-200">{c.name}</span>
                    </div>
                    <span className="font-mono text-[10px] text-zinc-500">{c.path}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800/80 bg-[#0c0c0f] p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-mono text-[11px] text-zinc-500">{"// Manual fallback config"}</p>
                <Button variant="ghost" size="sm" onClick={() => copy(CONFIG, "config")} className="h-6 gap-1 px-1.5 text-[11px]">
                  {copied === "config" ? (
                    <><Check className="h-3 w-3 text-emerald-400" /><span className="text-emerald-400">Copied</span></>
                  ) : (
                    <><Copy className="h-3 w-3" /><span>Copy</span></>
                  )}
                </Button>
              </div>
              <pre className="overflow-x-auto font-mono text-[11px] leading-relaxed text-zinc-400">{CONFIG}</pre>
            </div>
          </motion.div>
        </div>

        {/* Day 1 / Day 2 dialogue strip */}
        <div className="mx-auto mt-20 grid max-w-4xl grid-cols-1 gap-5 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 text-left backdrop-blur-sm"
          >
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-blue-400">
              Day 1 · First time
            </span>
            <div className="mt-4 space-y-3 text-sm">
              <p className="text-zinc-400"><span className="text-zinc-500">Portal:</span> It&apos;s behind Okta SSO. Opening your browser…</p>
              <p className="text-zinc-400"><span className="text-zinc-500">You:</span> <em>Log in once in local Chromium.</em></p>
              <p className="text-emerald-300"><span className="text-zinc-500">Portal:</span> Session saved securely. Context delivered.</p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl border border-emerald-500/20 bg-emerald-950/10 p-6 text-left backdrop-blur-sm"
          >
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
              Day 2+ · Every time after
            </span>
            <div className="mt-4 space-y-3 text-sm">
              <p className="text-zinc-400"><span className="text-zinc-500">Agent:</span> Need confluence.corp.com/specs.</p>
              <p className="text-emerald-300"><span className="text-zinc-500">Portal:</span> Reused saved session. Context extracted.</p>
              <p className="text-zinc-400"><span className="text-zinc-500">Agent:</span> …no screenshots needed?</p>
              <p className="text-white">Portal: That&apos;s the whole point.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
