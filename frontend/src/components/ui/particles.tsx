"use client";
import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface Circle {
  x: number;
  y: number;
  translateX: number;
  translateY: number;
  size: number;
  alpha: number;
  targetAlpha: number;
  dx: number;
  dy: number;
  magnetism: number;
}

interface ParticlesProps {
  className?: string;
  quantity?: number;
  size?: number;
  refresh?: boolean;
  color?: string;
}

export const Particles: React.FC<ParticlesProps> = ({
  className = "",
  quantity = 30,
  size = 0.4,
  refresh = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const circles = useRef<Circle[]>([]);
  const canvasSize = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio : 1;
  const sizeRef = useRef(size);
  const quantityRef = useRef(quantity);

  function circleParams(): Circle {
    const x = Math.floor(Math.random() * canvasSize.current.w);
    const y = Math.floor(Math.random() * canvasSize.current.h);
    const pSize = Math.floor(Math.random() * 2) + sizeRef.current;
    const targetAlpha = parseFloat((Math.random() * 0.4 + 0.1).toFixed(1));
    return {
      x,
      y,
      translateX: 0,
      translateY: 0,
      size: pSize,
      alpha: 0,
      targetAlpha,
      dx: (Math.random() - 0.5) * 0.15,
      dy: (Math.random() - 0.5) * 0.15,
      magnetism: 0.1 + Math.random() * 4,
    };
  }

  function drawCircle(circle: Circle, update = false) {
    if (context.current) {
      const { x, y, translateX, translateY, size: r, alpha } = circle;
      context.current.translate(translateX, translateY);
      context.current.beginPath();
      context.current.arc(x, y, r, 0, 2 * Math.PI);
      context.current.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      context.current.fill();
      context.current.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!update) circles.current.push(circle);
    }
  }

  function drawParticles() {
    circles.current.length = 0;
    for (let i = 0; i < quantityRef.current; i++) {
      circles.current.push(circleParams());
    }
  }

  function resizeCanvas() {
    if (canvasContainerRef.current && canvasRef.current && context.current) {
      circles.current.length = 0;
      canvasSize.current.w = canvasContainerRef.current.offsetWidth;
      canvasSize.current.h = canvasContainerRef.current.offsetHeight;
      canvasRef.current.width = canvasSize.current.w * dpr;
      canvasRef.current.height = canvasSize.current.h * dpr;
      canvasRef.current.style.width = `${canvasSize.current.w}px`;
      canvasRef.current.style.height = `${canvasSize.current.h}px`;
      context.current.scale(dpr, dpr);
    }
  }

  function initCanvas() {
    resizeCanvas();
    drawParticles();
  }

  function animate() {
    if (context.current) {
      context.current.clearRect(0, 0, canvasSize.current.w, canvasSize.current.h);
      circles.current.forEach((circle: Circle, i: number) => {
        if (
          circle.x < 0 ||
          circle.x > canvasSize.current.w ||
          circle.y < 0 ||
          circle.y > canvasSize.current.h
        ) {
          circles.current[i] = circleParams();
        }
        const edge = [
          circle.x < 20 ? circle.x / 20 : 1,
          canvasSize.current.w - circle.x < 20 ? (canvasSize.current.w - circle.x) / 20 : 1,
          circle.y < 20 ? circle.y / 20 : 1,
          canvasSize.current.h - circle.y < 20 ? (canvasSize.current.h - circle.y) / 20 : 1,
        ];
        const remapClosestEdge = Math.min(...edge);
        if (circle.alpha < circle.targetAlpha) {
          circle.alpha += 0.02;
        } else if (remapClosestEdge > 1) {
          circle.alpha = circle.targetAlpha * remapClosestEdge;
        }
        circle.x += circle.dx;
        circle.y += circle.dy;
        drawCircle(circle, true);
      });
    }
    window.requestAnimationFrame(animate);
  }

  useEffect(() => {
    if (canvasRef.current) {
      context.current = canvasRef.current.getContext("2d");
    }
    initCanvas();
    animate();
    window.addEventListener("resize", initCanvas);
    return () => window.removeEventListener("resize", initCanvas);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    initCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  return (
    <div className={cn("pointer-events-none", className)} ref={canvasContainerRef} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
};
