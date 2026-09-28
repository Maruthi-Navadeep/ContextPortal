import React from "react";
import { Terminal } from "lucide-react";
import { GithubIcon } from "@/ui/icons";

export const Footer = () => {
  return (
    <footer className="w-full border-t border-zinc-900 bg-zinc-950/80 py-12 text-zinc-500 text-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-zinc-900 border border-zinc-800 text-xs font-mono font-bold text-zinc-300">
            CP
          </div>
          <div>
            <p className="text-zinc-300 font-medium">ContextPortal</p>
            <p className="text-xs text-zinc-500">
              The authenticated fetch layer for AI agents.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-zinc-400">
          <a
            href="https://github.com/NavadeepDj/ContextPortal"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            <GithubIcon className="h-3.5 w-3.5" />
            GitHub
          </a>
          <a
            href="https://pypi.org/project/contextportal/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            <Terminal className="h-3.5 w-3.5" />
            PyPI (v0.3.0)
          </a>
          <a
            href="https://github.com/NavadeepDj/ContextPortal/blob/main/LICENSE"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors"
          >
            MIT License
          </a>
        </div>

        <p className="text-xs text-zinc-600">
          Crafted by{" "}
          <a
            href="https://github.com/NavadeepDj"
            target="_blank"
            rel="noreferrer"
            className="text-zinc-400 hover:text-white underline underline-offset-4"
          >
            NavadeepDj
          </a>
          . Built for agents that deserve better than screenshots.
        </p>
      </div>
    </footer>
  );
};

