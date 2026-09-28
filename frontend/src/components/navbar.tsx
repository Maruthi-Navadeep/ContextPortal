"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { GithubIcon } from "@/components/ui/icons";
import { Menu, X, Terminal, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 backdrop-blur-md",
        scrolled
          ? "border-b border-zinc-800/80 bg-zinc-950/75 shadow-sm shadow-black/40"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg overflow-hidden shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
            <img src="/logo.svg" alt="ContextPortal Logo" className="h-full w-full" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors">
                ContextPortal
              </span>
              <Badge variant="glow" className="text-[10px] px-1.5 py-0 h-4">
                v0.3.0
              </Badge>
            </div>
          </div>
        </Link>

        {/* Desktop Nav Items */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-400">
          <a
            href="#demo"
            className="hover:text-white transition-colors duration-150 hover:underline underline-offset-8 text-blue-400 font-medium"
          >
            Demo
          </a>
          <a
            href="#why"
            className="hover:text-white transition-colors duration-150 hover:underline underline-offset-8"
          >
            Why
          </a>
          <a
            href="#how"
            className="hover:text-white transition-colors duration-150 hover:underline underline-offset-8"
          >
            How it Works
          </a>
          <a
            href="#privacy"
            className="hover:text-white transition-colors duration-150 hover:underline underline-offset-8"
          >
            Security & Privacy
          </a>
          <a
            href="#mcp"
            className="hover:text-white transition-colors duration-150 hover:underline underline-offset-8"
          >
            MCP Spec
          </a>
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="https://github.com/NavadeepDj/ContextPortal"
            target="_blank"
            rel="noreferrer"
          >
            <Button variant="outline" size="sm" className="gap-2">
              <GithubIcon className="h-4 w-4" />
              <span>GitHub</span>
              <ExternalLink className="h-3 w-3 text-zinc-500" />
            </Button>
          </a>
          <a href="#install">
            <Button variant="glow" size="sm" className="gap-1.5">
              <Terminal className="h-3.5 w-3.5" />
              <span>Install CLI</span>
            </Button>
          </a>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-zinc-400 hover:text-white rounded-lg focus:outline-none"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6 text-zinc-300" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-xl px-4 py-5 flex flex-col gap-4">
          <a
            href="#demo"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-medium text-blue-400 hover:text-blue-300"
          >
            Demo
          </a>
          <a
            href="#why"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-medium text-zinc-300 hover:text-white"
          >
            Why
          </a>
          <a
            href="#how"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-medium text-zinc-300 hover:text-white"
          >
            How it Works
          </a>
          <a
            href="#privacy"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-medium text-zinc-300 hover:text-white"
          >
            Security & Privacy
          </a>
          <a
            href="#mcp"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-medium text-zinc-300 hover:text-white"
          >
            MCP Spec
          </a>
          <div className="flex flex-col gap-2 pt-2 border-t border-zinc-800">
            <a
              href="https://github.com/NavadeepDj/ContextPortal"
              target="_blank"
              rel="noreferrer"
            >
              <Button variant="outline" className="w-full justify-center gap-2">
                <GithubIcon className="h-4 w-4" />
                <span>View on GitHub</span>
              </Button>
            </a>
            <a href="#install" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="glow" className="w-full justify-center gap-2">
                <Terminal className="h-4 w-4" />
                <span>Install ContextPortal</span>
              </Button>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

