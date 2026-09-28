"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "motion/react";
import { Badge } from "@/ui/badge";
import {
  Calculator,
  Camera,
  Bot,
  Zap,
  Clock,
  DollarSign,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Footprints,
  Frown,
  ChevronDown,
  TrendingDown,
  BarChart3,
  Sparkles,
} from "lucide-react";

// ─── Token Calculation Engine ────────────────────────────────────────

interface Scenario {
  name: string;
  label: string;
  contentTokens: number;
  screenshots: number;
  resolution: "720p" | "1080p" | "4k";
}

const SCENARIOS: Scenario[] = [
  { name: "jira", label: "Jira Ticket", contentTokens: 4000, screenshots: 3, resolution: "1080p" },
  { name: "confluence", label: "Confluence Wiki", contentTokens: 12000, screenshots: 5, resolution: "1080p" },
  { name: "github", label: "GitHub PR", contentTokens: 8000, screenshots: 4, resolution: "1080p" },
  { name: "dashboard", label: "Internal Dashboard", contentTokens: 6000, screenshots: 6, resolution: "4k" },
];

const RESOLUTION_PIXELS: Record<string, { w: number; h: number }> = {
  "720p": { w: 1280, h: 720 },
  "1080p": { w: 1920, h: 1080 },
  "4k": { w: 3840, h: 2160 },
};

interface ModelPricing {
  name: string;
  inputPerMillion: number;
  outputPerMillion: number;
}

// Approximate published list prices (USD per 1M tokens). Verify current rates
// with each provider — pricing changes over time.
const MODELS: ModelPricing[] = [
  { name: "Claude Opus 4", inputPerMillion: 15.0, outputPerMillion: 75.0 },
  { name: "Claude Sonnet 4", inputPerMillion: 3.0, outputPerMillion: 15.0 },
  { name: "Claude Haiku 3.5", inputPerMillion: 0.8, outputPerMillion: 4.0 },
  { name: "GPT-4o", inputPerMillion: 2.5, outputPerMillion: 10.0 },
  { name: "GPT-4o mini", inputPerMillion: 0.15, outputPerMillion: 0.6 },
];

function calculateMetrics(
  contentTokens: number,
  screenshots: number,
  resolution: string,
  model: ModelPricing,
  pagesPerDay: number
) {
  const res = RESOLUTION_PIXELS[resolution] || RESOLUTION_PIXELS["1080p"];

  // ─── ContextPortal ───
  const cpInput = contentTokens;
  const cpReasoning = 0;
  const cpTotal = cpInput;
  const cpCost = (cpTotal / 1_000_000) * model.inputPerMillion;
  const cpLatency = 2.5;
  const cpHumanSteps = 0;
  const cpSecurityRisk = 0;
  const cpFrustration = 1;

  // ─── Manual Screenshots ───
  const visionTokensPerImage = Math.round((res.w * res.h) / 750);
  const ssVisionTotal = visionTokensPerImage * screenshots;
  const ssReasoning = Math.round(ssVisionTotal * 0.3);
  const ssTotal = ssVisionTotal + ssReasoning;
  const ssCost =
    (ssVisionTotal / 1_000_000) * model.inputPerMillion +
    (ssReasoning / 1_000_000) * model.outputPerMillion;
  const ssLatency = 360; // 6 minutes in seconds
  const ssHumanSteps = 7;
  const ssSecurityRisk = 6;
  const ssFrustration = 9;

  // ─── Browser Agent ───
  const baNavTokensPerStep = 2000;
  const baNavSteps = 4;
  const baReasoningPerStep = 1500;
  const baNavTotal = baNavTokensPerStep * baNavSteps;
  const baReasoning = baReasoningPerStep * baNavSteps;
  const baContent = contentTokens;
  const baTotal = baNavTotal + baReasoning + baContent;
  const baCost =
    ((baNavTotal + baContent) / 1_000_000) * model.inputPerMillion +
    (baReasoning / 1_000_000) * model.outputPerMillion;
  const baLatency = 60;
  const baHumanSteps = 1; // credential sharing
  const baSecurityRisk = 8;
  const baFrustration = 6;

  // ─── Daily / Monthly Projections ───
  const dailyTokensSaved = (ssTotal + baTotal - cpTotal * 2) * pagesPerDay;
  const monthlyCostSaved = ((ssCost + baCost) / 2 - cpCost) * pagesPerDay * 22;
  const dailyTimeSaved = ((ssLatency + baLatency) / 2 - cpLatency) * pagesPerDay;

  return {
    contextportal: { input: cpInput, reasoning: cpReasoning, total: cpTotal, cost: cpCost, latency: cpLatency, humanSteps: cpHumanSteps, securityRisk: cpSecurityRisk, frustration: cpFrustration },
    screenshots: { input: ssVisionTotal, reasoning: ssReasoning, total: ssTotal, cost: ssCost, latency: ssLatency, humanSteps: ssHumanSteps, securityRisk: ssSecurityRisk, frustration: ssFrustration },
    browserAgent: { input: baNavTotal + baContent, reasoning: baReasoning, total: baTotal, cost: baCost, latency: baLatency, humanSteps: baHumanSteps, securityRisk: baSecurityRisk, frustration: baFrustration },
    projections: { dailyTokensSaved, monthlyCostSaved, dailyTimeSaved },
  };
}

// ─── Animated Counter Hook ──────────────────────────────────────────

function useAnimatedCounter(target: number, duration: number = 1200, active: boolean = true) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) { setCount(0); return; }
    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.round(eased * target));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration, active]);

  return count;
}

// ─── Frustration Emoji Scale ────────────────────────────────────────

function FrustrationMeter({ level, animate }: { level: number; animate: boolean }) {
  const emojis = ["😌", "🙂", "😐", "😕", "😣", "😤", "😡", "🤬", "💀", "☠️"];
  const emoji = emojis[Math.min(level - 1, emojis.length - 1)];
  const fillWidth = animate ? `${(level / 10) * 100}%` : "0%";
  const barColor =
    level <= 3 ? "bg-emerald-500" : level <= 6 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-zinc-800 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${barColor}`}
          initial={{ width: "0%" }}
          animate={{ width: fillWidth }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      <span className="text-lg" title={`Frustration: ${level}/10`}>
        {emoji}
      </span>
    </div>
  );
}

// ─── Security Badge ─────────────────────────────────────────────────

function SecurityBadge({ risk }: { risk: number }) {
  if (risk === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
        <ShieldCheck className="h-3.5 w-3.5" /> Zero Risk
      </span>
    );
  }
  if (risk <= 5) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400">
        <Shield className="h-3.5 w-3.5" /> Medium
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-400">
      <ShieldAlert className="h-3.5 w-3.5" /> High Risk
    </span>
  );
}

// ─── Token Bar Chart ────────────────────────────────────────────────

function TokenBarChart({
  ssTokens,
  baTokens,
  cpTokens,
  animate,
}: {
  ssTokens: number;
  baTokens: number;
  cpTokens: number;
  animate: boolean;
}) {
  const max = Math.max(ssTokens, baTokens, cpTokens, 1);
  const bars = [
    { label: "Screenshots", tokens: ssTokens, color: "bg-red-500", glow: "shadow-red-500/30" },
    { label: "Browser Agent", tokens: baTokens, color: "bg-amber-500", glow: "shadow-amber-500/30" },
    { label: "ContextPortal", tokens: cpTokens, color: "bg-emerald-500", glow: "shadow-emerald-500/30" },
  ];

  return (
    <div className="space-y-3">
      {bars.map((bar) => (
        <div key={bar.label} className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-400">{bar.label}</span>
            <span className="font-mono text-zinc-300">
              {animate ? bar.tokens.toLocaleString() : "0"} tokens
            </span>
          </div>
          <div className="h-3 rounded-full bg-zinc-800/80 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${bar.color} shadow-md ${bar.glow}`}
              initial={{ width: "0%" }}
              animate={{
                width: animate ? `${(bar.tokens / max) * 100}%` : "0%",
              }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Metric Row ─────────────────────────────────────────────────────

function MetricRow({
  icon: Icon,
  label,
  ssValue,
  baValue,
  cpValue,
  format = "number",
  animate,
}: {
  icon: React.ElementType;
  label: string;
  ssValue: number;
  baValue: number;
  cpValue: number;
  format?: "number" | "currency" | "time" | "steps";
  animate: boolean;
}) {
  const ssAnimated = useAnimatedCounter(ssValue, 1200, animate);
  const baAnimated = useAnimatedCounter(baValue, 1200, animate);
  const cpAnimated = useAnimatedCounter(cpValue, 1200, animate);

  function formatValue(v: number, fmt: string) {
    switch (fmt) {
      case "currency":
        return `$${v.toFixed(4)}`;
      case "time":
        return v >= 60 ? `${Math.floor(v / 60)}m ${v % 60}s` : `${v}s`;
      case "steps":
        return v === 0 ? "Zero" : `${v} steps`;
      default:
        return v.toLocaleString();
    }
  }

  // For currency, skip animated counter and use raw values
  const isCurrency = format === "currency";

  return (
    <div className="grid grid-cols-4 gap-3 items-center py-2.5 border-b border-zinc-800/50 last:border-0">
      <div className="flex items-center gap-2 text-zinc-400 text-xs">
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <span className="font-medium">{label}</span>
      </div>
      <div className="text-center font-mono text-xs text-red-400">
        {isCurrency ? formatValue(ssValue, format) : formatValue(ssAnimated, format)}
      </div>
      <div className="text-center font-mono text-xs text-amber-400">
        {isCurrency ? formatValue(baValue, format) : formatValue(baAnimated, format)}
      </div>
      <div className="text-center font-mono text-xs text-emerald-400 font-semibold">
        {isCurrency ? formatValue(cpValue, format) : formatValue(cpAnimated, format)}
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────

export const TokenCalculatorSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const [activeScenario, setActiveScenario] = useState(0);
  const [contentTokens, setContentTokens] = useState(SCENARIOS[0].contentTokens);
  const [screenshots, setScreenshots] = useState(SCENARIOS[0].screenshots);
  const [resolution, setResolution] = useState(SCENARIOS[0].resolution);
  const [modelIndex, setModelIndex] = useState(0);
  const [pagesPerDay, setPagesPerDay] = useState(10);

  // Sync sliders with scenario presets
  const selectScenario = (idx: number) => {
    setActiveScenario(idx);
    const s = SCENARIOS[idx];
    setContentTokens(s.contentTokens);
    setScreenshots(s.screenshots);
    setResolution(s.resolution);
  };

  const model = MODELS[modelIndex];
  const metrics = calculateMetrics(contentTokens, screenshots, resolution, model, pagesPerDay);

  return (
    <section
      ref={sectionRef}
      id="token-calculator"
      className="relative py-24 sm:py-32 border-b border-zinc-900 overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-emerald-600/8 blur-[160px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-blue-600/6 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <Badge variant="glow" className="mb-4">
            <Calculator className="h-3.5 w-3.5" />
            Token Savings Calculator
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            See the numbers.{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              Stop guessing.
            </span>
          </h2>
          <p className="mt-4 text-zinc-400 max-w-2xl mx-auto text-base sm:text-lg">
            How many tokens, dollars, and minutes are you burning with screenshots and browser agents?
            Adjust the sliders and see for yourself.
          </p>
          <p className="mt-3 text-xs text-zinc-600 max-w-2xl mx-auto">
            Illustrative estimates. Token math and model prices are approximate — verify current
            rates with your provider. ContextPortal itself does not count or bill tokens.
          </p>
        </div>

        {/* Controls Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 sm:p-6 shadow-xl backdrop-blur-xl mb-8"
        >
          {/* Scenario Selector */}
          <div className="mb-6">
            <label className="text-xs font-mono font-semibold text-zinc-500 uppercase tracking-wider mb-3 block">
              Scenario Preset
            </label>
            <div className="flex flex-wrap gap-2">
              {SCENARIOS.map((s, idx) => (
                <button
                  key={s.name}
                  onClick={() => selectScenario(idx)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeScenario === idx
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                      : "bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700/80 hover:text-zinc-200"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sliders Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Content Tokens */}
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-xs text-zinc-400">Page Size</label>
                <span className="text-xs font-mono text-zinc-300">{contentTokens.toLocaleString()} tokens</span>
              </div>
              <input
                type="range"
                min={1000}
                max={50000}
                step={500}
                value={contentTokens}
                onChange={(e) => setContentTokens(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none bg-zinc-800 cursor-pointer accent-blue-500"
              />
            </div>

            {/* Screenshots */}
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-xs text-zinc-400">Screenshots Needed</label>
                <span className="text-xs font-mono text-zinc-300">{screenshots}</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={screenshots}
                onChange={(e) => setScreenshots(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none bg-zinc-800 cursor-pointer accent-red-500"
              />
            </div>

            {/* Resolution */}
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-xs text-zinc-400">Screenshot Resolution</label>
                <span className="text-xs font-mono text-zinc-300">{resolution}</span>
              </div>
              <div className="flex gap-1.5">
                {(["720p", "1080p", "4k"] as const).map((res) => (
                  <button
                    key={res}
                    onClick={() => setResolution(res)}
                    className={`flex-1 px-2 py-1 rounded text-[10px] font-mono transition-all ${
                      resolution === res
                        ? "bg-zinc-700 text-white"
                        : "bg-zinc-900 text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {res}
                  </button>
                ))}
              </div>
            </div>

            {/* Pages Per Day */}
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-xs text-zinc-400">Pages / Day</label>
                <span className="text-xs font-mono text-zinc-300">{pagesPerDay}</span>
              </div>
              <input
                type="range"
                min={1}
                max={50}
                step={1}
                value={pagesPerDay}
                onChange={(e) => setPagesPerDay(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none bg-zinc-800 cursor-pointer accent-emerald-500"
              />
            </div>
          </div>

          {/* Model Selector */}
          <div className="mt-5 flex items-center gap-3">
            <label className="text-xs text-zinc-500 font-mono">Model:</label>
            <div className="relative">
              <select
                value={modelIndex}
                onChange={(e) => setModelIndex(Number(e.target.value))}
                className="appearance-none bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 pr-7 text-xs font-mono text-zinc-300 cursor-pointer focus:outline-none focus:border-blue-500/50"
              >
                {MODELS.map((m, idx) => (
                  <option key={m.name} value={idx}>
                    {m.name} (${m.inputPerMillion}/M in)
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-500 pointer-events-none" />
            </div>
          </div>
        </motion.div>

        {/* Results: Three Column Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 sm:p-6 shadow-xl backdrop-blur-xl"
        >
          {/* Column Headers */}
          <div className="grid grid-cols-4 gap-3 mb-4 pb-3 border-b border-zinc-800">
            <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Metric</div>
            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-400">
                <Camera className="h-3.5 w-3.5" />
                Screenshots
              </div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                <Bot className="h-3.5 w-3.5" />
                Browser Agent
              </div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <Zap className="h-3.5 w-3.5" />
                ContextPortal
              </div>
            </div>
          </div>

          {/* Metric Rows */}
          <MetricRow
            icon={BarChart3}
            label="Input Tokens"
            ssValue={metrics.screenshots.input}
            baValue={metrics.browserAgent.input}
            cpValue={metrics.contextportal.input}
            animate={isInView}
          />
          <MetricRow
            icon={Sparkles}
            label="Reasoning Tokens"
            ssValue={metrics.screenshots.reasoning}
            baValue={metrics.browserAgent.reasoning}
            cpValue={metrics.contextportal.reasoning}
            animate={isInView}
          />
          <MetricRow
            icon={DollarSign}
            label="Cost / Fetch"
            ssValue={metrics.screenshots.cost}
            baValue={metrics.browserAgent.cost}
            cpValue={metrics.contextportal.cost}
            format="currency"
            animate={isInView}
          />
          <MetricRow
            icon={Clock}
            label="Latency"
            ssValue={metrics.screenshots.latency}
            baValue={metrics.browserAgent.latency}
            cpValue={metrics.contextportal.latency}
            format="time"
            animate={isInView}
          />
          <MetricRow
            icon={Footprints}
            label="Human Steps"
            ssValue={metrics.screenshots.humanSteps}
            baValue={metrics.browserAgent.humanSteps}
            cpValue={metrics.contextportal.humanSteps}
            format="steps"
            animate={isInView}
          />

          {/* Security Row */}
          <div className="grid grid-cols-4 gap-3 items-center py-2.5 border-b border-zinc-800/50">
            <div className="flex items-center gap-2 text-zinc-400 text-xs">
              <Shield className="h-3.5 w-3.5 shrink-0" />
              <span className="font-medium">Security Risk</span>
            </div>
            <div className="text-center">
              <SecurityBadge risk={metrics.screenshots.securityRisk} />
            </div>
            <div className="text-center">
              <SecurityBadge risk={metrics.browserAgent.securityRisk} />
            </div>
            <div className="text-center">
              <SecurityBadge risk={metrics.contextportal.securityRisk} />
            </div>
          </div>

          {/* Frustration Row */}
          <div className="grid grid-cols-4 gap-3 items-center py-2.5">
            <div className="flex items-center gap-2 text-zinc-400 text-xs">
              <Frown className="h-3.5 w-3.5 shrink-0" />
              <span className="font-medium">Frustration</span>
            </div>
            <div className="px-2">
              <FrustrationMeter level={metrics.screenshots.frustration} animate={isInView} />
            </div>
            <div className="px-2">
              <FrustrationMeter level={metrics.browserAgent.frustration} animate={isInView} />
            </div>
            <div className="px-2">
              <FrustrationMeter level={metrics.contextportal.frustration} animate={isInView} />
            </div>
          </div>
        </motion.div>

        {/* Visual Token Comparison Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 sm:p-6 shadow-xl backdrop-blur-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-zinc-400" />
              Total Token Comparison
            </h3>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              per single fetch
            </span>
          </div>
          <TokenBarChart
            ssTokens={metrics.screenshots.total}
            baTokens={metrics.browserAgent.total}
            cpTokens={metrics.contextportal.total}
            animate={isInView}
          />
        </motion.div>

        {/* ROI Projection Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-8 rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-emerald-950/15 via-zinc-950/60 to-zinc-950 p-6 sm:p-8 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex items-center gap-2 mb-6">
            <TrendingDown className="h-5 w-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              Your Savings at {pagesPerDay} pages/day
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Tokens Saved */}
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 text-center">
              <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">
                Tokens Saved / Day
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
                {isInView ? metrics.projections.dailyTokensSaved.toLocaleString() : "0"}
              </p>
              <p className="text-[11px] text-zinc-500 mt-1">
                vs. average of screenshots + browser agent
              </p>
            </div>

            {/* Cost Saved */}
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 text-center">
              <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">
                Cost Saved / Month
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
                ${isInView ? metrics.projections.monthlyCostSaved.toFixed(2) : "0.00"}
              </p>
              <p className="text-[11px] text-zinc-500 mt-1">
                22 working days × {pagesPerDay} pages/day ({model.name})
              </p>
            </div>

            {/* Time Saved */}
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 text-center">
              <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">
                Time Saved / Day
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
                {isInView
                  ? metrics.projections.dailyTimeSaved >= 60
                    ? `${Math.floor(metrics.projections.dailyTimeSaved / 60)}m`
                    : `${Math.round(metrics.projections.dailyTimeSaved)}s`
                  : "0s"}
              </p>
              <p className="text-[11px] text-zinc-500 mt-1">
                Human time + compute latency combined
              </p>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-6 text-center">
            <p className="text-sm text-zinc-300">
              At <span className="font-bold text-white">{pagesPerDay} pages/day</span>, ContextPortal
              saves you{" "}
              <span className="font-bold text-emerald-400">
                ${metrics.projections.monthlyCostSaved.toFixed(2)}/month
              </span>{" "}
              and{" "}
              <span className="font-bold text-emerald-400">
                {Math.floor(metrics.projections.dailyTimeSaved / 60)} minutes every day
              </span>
              .
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
