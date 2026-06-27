"use client";

import { useEffect, useRef } from "react";

// Colors adapt to the active theme (the .light class on <html>).
function themeColors() {
  const light =
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("light");
  return light
    ? { fade: "238, 241, 244", streak: "20, 140, 80", bg: "#eef1f4" }
    : { fade: "7, 7, 7", streak: "140, 255, 158", bg: "#070707" };
}

export function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let colors = themeColors();
    canvas.style.background = colors.bg;

    let w = 0;
    let h = 0;
    let cx = 0;
    let cy = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const STAR_COUNT = 480;
    type Star = { x: number; y: number; z: number; pz: number };
    const stars: Star[] = [];

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      cx = w / 2;
      cy = h / 2;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function reset(s: Star) {
      s.x = (Math.random() - 0.5) * w;
      s.y = (Math.random() - 0.5) * h;
      s.z = Math.random() * w;
      s.pz = s.z;
    }

    resize();
    for (let i = 0; i < STAR_COUNT; i++) {
      const s = { x: 0, y: 0, z: 0, pz: 0 };
      reset(s);
      stars.push(s);
    }

    const speed = 0.018;
    let raf = 0;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    function frame() {
      ctx!.fillStyle = `rgba(${colors.fade}, 0.4)`;
      ctx!.fillRect(0, 0, w, h);

      for (const s of stars) {
        s.pz = s.z;
        s.z -= s.z * speed + 0.6;
        if (s.z < 1) {
          reset(s);
          continue;
        }
        const sx = cx + (s.x / s.z) * w;
        const sy = cy + (s.y / s.z) * h;
        const px = cx + (s.x / s.pz) * w;
        const py = cy + (s.y / s.pz) * h;

        if (sx < 0 || sx > w || sy < 0 || sy > h) continue;

        const size = Math.max(0, (1 - s.z / w) * 2.2);
        const alpha = Math.min(1, (1 - s.z / w) * 1.2);
        ctx!.strokeStyle = `rgba(${colors.streak}, ${alpha * 0.9})`;
        ctx!.lineWidth = size;
        ctx!.beginPath();
        ctx!.moveTo(px, py);
        ctx!.lineTo(sx, sy);
        ctx!.stroke();
      }
      raf = requestAnimationFrame(frame);
    }

    if (reduce) {
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);
    } else {
      raf = requestAnimationFrame(frame);
    }

    // React to theme switches (light/dark) live.
    const observer = new MutationObserver(() => {
      colors = themeColors();
      canvas.style.background = colors.bg;
      if (reduce) {
        ctx.fillStyle = colors.bg;
        ctx.fillRect(0, 0, w, h);
      }
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const onResize = () => resize();
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
