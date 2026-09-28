"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * A front-facing "portal" the ContextPortal wordmark sits inside: an upright
 * oval of swirling blue plasma with a hot glowing rim and drifting sparks.
 *
 * Two rendering paths:
 *  - Real GPU  -> a three.js WebGL vortex shader (loaded lazily).
 *  - No/soft GPU (VMs, RDP, blocked WebGL) -> a pure-CSS portal that looks the
 *    same and needs no GPU at all. This is the default so it ALWAYS shows.
 */
export const PortalCanvas = ({ className }: { className?: string }) => {
  const [mode, setMode] = useState<"css" | "webgl">("css");
  const mountRef = useRef<HTMLDivElement>(null);

  // Decide once, on the client, whether a real GPU-backed WebGL context exists.
  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      const gl = (c.getContext("webgl2") ||
        c.getContext("webgl")) as WebGLRenderingContext | null;
      if (!gl) return; // stay on CSS
      const dbg = gl.getExtension("WEBGL_debug_renderer_info");
      const r = dbg
        ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL))
        : "";
      // Reject software rasterizers (SwiftShader / llvmpipe / Hyper-V etc.)
      if (/swiftshader|llvmpipe|software|basic render|microsoft/i.test(r)) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return; // CSS static-friendly path
      setMode("webgl");
    } catch {
      /* stay on CSS */
    }
  }, []);

  // WebGL path — only mounts when a real GPU was detected.
  useEffect(() => {
    if (mode !== "webgl") return;
    const mount = mountRef.current;
    if (!mount) return;

    let cancelled = false;
    let cleanup = () => {};

    import("three").then((THREE) => {
      if (cancelled || !mount) return;
      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      } catch {
        return; // CSS portal already showing underneath
      }

      const width = mount.clientWidth || 1;
      const height = mount.clientHeight || 1;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height);
      renderer.setClearColor(0x000000, 0);
      mount.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
      camera.position.set(0, 0, 2);
      camera.lookAt(0, 0, 0);

      const portalGeo = new THREE.PlaneGeometry(2, 2);
      const portalMat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: false,
        uniforms: { uTime: { value: 0 }, uAspect: { value: width / height } },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
        `,
        fragmentShader: /* glsl */ `
          precision highp float;
          varying vec2 vUv;
          uniform float uTime;
          uniform float uAspect;
          float hash(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }
          float noise(vec2 p){ vec2 i=floor(p),f=fract(p); vec2 u=f*f*(3.0-2.0*f);
            return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y); }
          float fbm(vec2 p){ float v=0.,a=.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.; a*=.5; } return v; }
          void main(){
            vec2 p=(vUv-0.5)*2.0; p.x*=uAspect; vec2 q=p; q.y/=1.18;
            float r=length(q), ang=atan(q.y,q.x);
            float swirl=ang+2.3/(r+0.32)-uTime*0.85;
            vec2 np=vec2(cos(swirl),sin(swirl))*(r*2.6);
            float turb=clamp(fbm(np+fbm(np+uTime*0.18)),0.0,1.0);
            float rim=0.82;
            float core=smoothstep(rim,0.0,r);
            float ringGlow=exp(-pow((r-rim)*6.5,2.0));
            float outerGlow=exp(-pow(max(r-rim,0.0)*3.2,2.0));
            vec3 deep=vec3(0.02,0.08,0.42),mid=vec3(0.09,0.34,0.95),bright=vec3(0.45,0.80,1.0),white=vec3(0.9,0.97,1.0);
            vec3 plasma=mix(deep,mid,turb); plasma=mix(plasma,bright,pow(turb,2.6)); plasma*=core*(0.45+turb*0.9);
            float flick=pow(0.5+0.5*sin(ang*3.0-uTime*2.2),2.0);
            vec3 col=plasma; col+=bright*ringGlow*1.7; col+=white*ringGlow*flick*0.7; col+=mid*outerGlow*0.45;
            float alpha=clamp(core*(0.35+turb*0.85)+ringGlow*1.5+outerGlow*0.4,0.0,1.0);
            gl_FragColor=vec4(col,alpha);
          }
        `,
      });
      const portal = new THREE.Mesh(portalGeo, portalMat);
      scene.add(portal);

      let raf = 0;
      let visible = true;
      const clock = new THREE.Clock();
      const frame = () => {
        portalMat.uniforms.uTime.value = clock.getElapsedTime();
        renderer.render(scene, camera);
      };
      const loop = () => {
        if (visible) frame();
        raf = requestAnimationFrame(loop);
      };
      loop();

      const io = new IntersectionObserver(
        ([e]) => (visible = e.isIntersecting),
        { threshold: 0.01 }
      );
      io.observe(mount);
      const ro = new ResizeObserver(() => {
        const w = mount.clientWidth || 1;
        const h = mount.clientHeight || 1;
        renderer.setSize(w, h);
        portalMat.uniforms.uAspect.value = w / h;
      });
      ro.observe(mount);

      cleanup = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        portalGeo.dispose();
        portalMat.dispose();
        renderer.dispose();
        if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      };
    });

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [mode]);

  if (mode === "webgl") {
    return <div ref={mountRef} className={cn("pointer-events-none", className)} aria-hidden />;
  }

  return <CssPortal className={className} />;
};

/** Pure-CSS portal — no GPU required, renders on any machine. */
const CssPortal = ({ className }: { className?: string }) => {
  const SPARKS = [
    { top: "18%", left: "30%", d: "0s" },
    { top: "26%", left: "68%", d: "0.6s" },
    { top: "44%", left: "16%", d: "1.1s" },
    { top: "58%", left: "80%", d: "0.3s" },
    { top: "72%", left: "40%", d: "1.5s" },
    { top: "38%", left: "54%", d: "0.9s" },
    { top: "80%", left: "62%", d: "1.8s" },
  ];

  return (
    <div className={cn("pointer-events-none relative", className)} aria-hidden>
      <div className="absolute left-1/2 top-1/2 aspect-square w-[78%] -translate-x-1/2 -translate-y-1/2 scale-y-110">
        {/* outer glow */}
        <div
          className="absolute inset-[-14%] rounded-full blur-2xl"
          style={{
            background:
              "radial-gradient(circle, rgba(37,99,235,0.5), rgba(37,99,235,0.16) 52%, transparent 72%)",
          }}
        />
        {/* filled plasma core */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(96,165,250,0.6) 0%, rgba(37,99,235,0.55) 38%, rgba(29,78,216,0.4) 60%, transparent 72%)",
          }}
        />
        {/* swirl A */}
        <div
          className="portal-swirl-a absolute inset-0 rounded-full mix-blend-screen blur-2xl"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, rgba(59,130,246,0.95) 45deg, transparent 100deg, rgba(34,211,238,0.85) 175deg, transparent 235deg, rgba(99,102,241,0.95) 310deg, transparent 350deg)",
            maskImage: "radial-gradient(circle, transparent 6%, black 34%, black 66%, transparent 74%)",
            WebkitMaskImage: "radial-gradient(circle, transparent 6%, black 34%, black 66%, transparent 74%)",
          }}
        />
        {/* swirl B (reverse) */}
        <div
          className="portal-swirl-b absolute inset-0 rounded-full mix-blend-screen blur-3xl"
          style={{
            background:
              "conic-gradient(from 120deg, transparent 0deg, rgba(96,165,250,0.9) 60deg, transparent 130deg, rgba(129,140,248,0.85) 220deg, transparent 300deg)",
            maskImage: "radial-gradient(circle, transparent 10%, black 40%, black 64%, transparent 73%)",
            WebkitMaskImage: "radial-gradient(circle, transparent 10%, black 40%, black 64%, transparent 73%)",
          }}
        />
        {/* bright rim ring */}
        <div
          className="absolute inset-0 rounded-full [filter:blur(1.5px)]"
          style={{
            background:
              "radial-gradient(circle, transparent 61%, rgba(191,219,254,0.95) 67%, rgba(96,165,250,0.75) 70%, transparent 77%)",
          }}
        />
        {/* rim bloom */}
        <div
          className="absolute inset-0 rounded-full blur-md opacity-80"
          style={{
            background:
              "radial-gradient(circle, transparent 60%, rgba(96,165,250,0.6) 69%, transparent 80%)",
          }}
        />
        {/* sparks */}
        {SPARKS.map((s, i) => (
          <span
            key={i}
            className="portal-spark absolute h-1 w-1 rounded-full bg-blue-100 shadow-[0_0_6px_2px_rgba(191,219,254,0.8)]"
            style={{ top: s.top, left: s.left, animationDelay: s.d }}
          />
        ))}
      </div>
    </div>
  );
};

export default PortalCanvas;
