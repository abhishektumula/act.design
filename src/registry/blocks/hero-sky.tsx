"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/* --------------------------------- the sky -------------------------------- */

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

/**
 * A sea of cloud seen from above it. Each pixel below the horizon is projected
 * onto the cloud deck, where layered noise makes billows; they're lit by
 * comparing their height with a step toward the sun, and fade into haze with
 * distance. Above the horizon: the sky, the sun (or moon) and, at night, stars.
 */
const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uLook;
uniform vec3 uZenith, uHorizon, uSunCol, uLit, uShade;
uniform vec2 uSun;
uniform float uNight;

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 6; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
  return v;
}
// Cloud deck height at a point: warped noise, pushed into billows.
float deck(vec2 p, float t){
  vec2 q = vec2(fbm(p + vec2(0.0, t * 0.04)), fbm(p + vec2(5.2, 1.3) - t * 0.03));
  float h = fbm(p * 1.1 + 1.6 * q + vec2(t * 0.05, 0.0));
  return smoothstep(0.27, 0.74, h);
}

void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float horizon = -0.08 + uLook.y * 0.015;
  vec3 rd = normalize(vec3(uv.x + uLook.x * 0.04, uv.y - horizon - 0.0, 1.6));
  vec3 sun = normalize(vec3(uSun.x, uSun.y, 1.0));
  float sd = max(dot(rd, sun), 0.0);
  float t = uTime;

  // Sky
  float up = clamp(rd.y * 2.2, 0.0, 1.0);
  vec3 col = mix(uHorizon, uZenith, pow(up, 0.55));
  col += uSunCol * (pow(sd, 900.0 + uNight * 5000.0) * 3.0 + (pow(sd, 40.0) * 0.35 + pow(sd, 6.0) * 0.18) * (1.0 - 0.75 * uNight));
  if (uNight > 0.0) {
    vec2 g = rd.xy / max(rd.z, 0.2) * 220.0;
    vec2 id = floor(g);
    float star = step(0.985, hash(id)) * smoothstep(0.5, 0.0, length(fract(g) - 0.5)) * smoothstep(0.0, 0.1, rd.y);
    col += vec3(0.9, 0.93, 1.0) * star * uNight * (0.55 + 0.45 * sin(t * 1.7 + hash(id + 3.1) * 40.0));
  }

  if (rd.y < 0.0) {
    // The deck lies one unit below the camera.
    float dist = 1.0 / -rd.y;
    vec2 p = rd.xz * dist * 0.5 + vec2(t * 0.012, t * 0.03);
    float h = deck(p, t);
    // Self-shadowing: compare with a step toward the sun, and a second, longer one.
    vec2 toSun = normalize(sun.xz + vec2(0.0001));
    float near = deck(p + toSun * 0.05, t);
    float far = deck(p + toSun * 0.16, t);
    float lit = clamp((h - near) * 5.0 + (h - far) * 1.5 + 0.5, 0.0, 1.0);
    // Ambient occlusion: low ground between puffs sees less sky.
    float ao = mix(0.55, 1.0, h);
    vec3 cloud = mix(uShade, uLit, lit) * ao;
    // Silver lining where a puff stands up into the light.
    cloud += uSunCol * pow(lit, 6.0) * h * 0.35;
    // Through the gaps, a lower, darker layer of cloud.
    float low = fbm(p * 2.3 - t * 0.02);
    vec3 under = mix(uShade * 0.35, uShade * 0.8, low);
    vec3 ground = mix(under, cloud, smoothstep(0.02, 0.4, h));
    // The sun's path laid across the tops.
    ground += uSunCol * pow(sd, 10.0) * 0.45 * (0.4 + h);
    float haze = 1.0 - exp(-dist * 0.11);
    col = mix(ground, uHorizon, clamp(haze, 0.0, 1.0));
  }
  // Soften the horizon line itself.
  col = mix(col, uHorizon + uSunCol * pow(sd, 12.0) * 0.25, exp(-abs(rd.y) * 40.0) * 0.6);

  // A touch of grain so gradients don't band.
  col += (hash(gl_FragCoord.xy + fract(t)) - 0.5) * 0.025;
  gl_FragColor = vec4(pow(max(col, 0.0), vec3(0.95)), 1.0);
}
`;

type Rgb = [number, number, number];
type Keyframe = { at: number; zenith: Rgb; horizon: Rgb; sun: Rgb; lit: Rgb; shade: Rgb; pos: [number, number]; night: number };

/** The sky through a day, in minutes after midnight. Colours are linear-ish 0…1. */
const DAY: Keyframe[] = [
  { at: 0, zenith: [0.01, 0.015, 0.05], horizon: [0.06, 0.08, 0.18], sun: [0.32, 0.36, 0.55], lit: [0.22, 0.27, 0.45], shade: [0.03, 0.04, 0.1], pos: [0.5, 0.3], night: 1 },
  { at: 330, zenith: [0.06, 0.07, 0.2], horizon: [0.35, 0.28, 0.42], sun: [0.9, 0.55, 0.5], lit: [0.55, 0.45, 0.6], shade: [0.12, 0.1, 0.22], pos: [0.85, -0.02], night: 0.4 },
  { at: 410, zenith: [0.2, 0.24, 0.48], horizon: [1.0, 0.66, 0.52], sun: [1.0, 0.72, 0.48], lit: [1.0, 0.82, 0.74], shade: [0.42, 0.36, 0.55], pos: [0.72, 0.05], night: 0 },
  { at: 720, zenith: [0.13, 0.36, 0.78], horizon: [0.72, 0.85, 0.98], sun: [1.0, 0.97, 0.9], lit: [1.0, 1.0, 1.0], shade: [0.56, 0.66, 0.82], pos: [0.42, 0.36], night: 0 },
  { at: 1070, zenith: [0.16, 0.14, 0.38], horizon: [1.0, 0.5, 0.28], sun: [1.0, 0.55, 0.22], lit: [1.0, 0.72, 0.52], shade: [0.36, 0.22, 0.36], pos: [0.62, 0.04], night: 0 },
  { at: 1150, zenith: [0.04, 0.04, 0.14], horizon: [0.3, 0.16, 0.3], sun: [0.9, 0.35, 0.25], lit: [0.45, 0.3, 0.45], shade: [0.08, 0.06, 0.15], pos: [0.78, -0.04], night: 0.5 },
  { at: 1440, zenith: [0.01, 0.015, 0.05], horizon: [0.06, 0.08, 0.18], sun: [0.32, 0.36, 0.55], lit: [0.22, 0.27, 0.45], shade: [0.03, 0.04, 0.1], pos: [0.5, 0.3], night: 1 },
];

function skyAt(minutes: number) {
  const m = ((minutes % 1440) + 1440) % 1440;
  const i = Math.max(0, DAY.findIndex((k) => k.at > m) - 1);
  const a = DAY[i];
  const b = DAY[i + 1];
  const raw = (m - a.at) / (b.at - a.at);
  const t = raw * raw * (3 - 2 * raw);
  const mix = <T extends number[]>(x: T, y: T) => x.map((v, j) => v + (y[j] - v) * t) as T;
  return { zenith: mix(a.zenith, b.zenith), horizon: mix(a.horizon, b.horizon), sun: mix(a.sun, b.sun), lit: mix(a.lit, b.lit), shade: mix(a.shade, b.shade), pos: mix(a.pos, b.pos), night: a.night + (b.night - a.night) * t };
}

const HEADLINES: Record<string, string> = {
  Night: "Stars over the cloud deck",
  Dawn: "First light on the clouds",
  Noon: "Clear air above the deck",
  Dusk: "Gold on the cloud tops",
};

const clock = (m: number) => `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(Math.round(m % 60)).padStart(2, "0")}`;

type Frame = { minutes: number; look: [number, number]; still: boolean };

/** Runs the shader on a canvas, pausing while it's off screen. Returns a cleanup. */
function startSky(el: HTMLCanvasElement, read: (dt: number) => Frame) {
  const gl = el.getContext("webgl", { antialias: false, powerPreference: "low-power" });
  if (!gl) return; // the CSS gradient behind the canvas stands in
  {
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const attr = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(attr);
    gl.vertexAttribPointer(attr, 2, gl.FLOAT, false, 0, 0);
    const u = (n: string) => gl.getUniformLocation(prog, n);

    // Rendered under native resolution; clouds are soft, and it keeps laptops cool.
    const resize = () => {
      const r = el.getBoundingClientRect();
      const k = Math.min(window.devicePixelRatio, 2) * 0.55;
      el.width = Math.max(1, Math.round(r.width * k));
      el.height = Math.max(1, Math.round(r.height * k));
      gl.viewport(0, 0, el.width, el.height);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);

    let raf = 0;
    let time = 40;
    let last = performance.now();
    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      const dt = Math.min(now - last, 64) / 1000;
      last = now;
      if (!visible) return;
      const { minutes, look, still } = read(dt);
      if (!still) time += dt;
      const s = skyAt(minutes);
      gl.uniform2f(u("uRes"), el.width, el.height);
      gl.uniform1f(u("uTime"), time);
      gl.uniform2f(u("uLook"), look[0], look[1]);
      gl.uniform3fv(u("uZenith"), s.zenith);
      gl.uniform3fv(u("uHorizon"), s.horizon);
      gl.uniform3fv(u("uSunCol"), s.sun);
      gl.uniform3fv(u("uLit"), s.lit);
      gl.uniform3fv(u("uShade"), s.shade);
      gl.uniform2fv(u("uSun"), s.pos);
      gl.uniform1f(u("uNight"), s.night);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    // Paint straight away so there's never an empty frame, then keep going.
    draw(performance.now());
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }
}

/* ---------------------------------- block --------------------------------- */

const MOMENTS = ["Night", "Dawn", "Noon", "Dusk"] as const;

/** What to call the hour, for the headline. */
function momentOf(m: number): (typeof MOMENTS)[number] {
  if (m < 5 * 60 || m >= 20 * 60) return "Night";
  if (m < 9 * 60) return "Dawn";
  if (m < 16 * 60 + 30) return "Noon";
  return "Dusk";
}

/** Minutes of sky per second of real time while it runs on its own: a day in two minutes. */
const SPEED = 12;

/**
 * A weather hero over a live sky. A sea of cloud drifts and billows under a
 * sun that moves through the day on its own: dawn goes pink, noon goes blue,
 * dusk burns orange and night brings the stars out. Drag across the sky to
 * take the hour into your own hands; let go and the day carries on. The
 * headline names the moment and the time.
 */
export function HeroSky({ defaultMinutes = 6 * 60 + 50, className }: { defaultMinutes?: number; className?: string }) {
  const reduce = useReducedMotion();
  const canvas = useRef<HTMLCanvasElement>(null);
  // The hour shown in type, kept to whole ten-minute steps so React isn't re-rendering every frame.
  const [shown, setShown] = useState(defaultMinutes);
  const [dragging, setDragging] = useState(false);
  const live = useRef({ minutes: defaultMinutes, look: [0, 0] as [number, number], lookTo: [0, 0] as [number, number], drag: null as null | { x: number; from: number }, still: false });

  useEffect(() => {
    live.current.still = !!reduce;
  }, [reduce]);

  useEffect(() => {
    if (!canvas.current) return;
    return startSky(canvas.current, (dt) => {
      const l = live.current;
      if (!l.drag && !l.still) l.minutes = (l.minutes + dt * SPEED) % 1440;
      const k = 1 - Math.exp(-dt * 3);
      l.look = [l.look[0] + (l.lookTo[0] - l.look[0]) * k, l.look[1] + (l.lookTo[1] - l.look[1]) * k];
      const step = Math.floor(l.minutes / 10) * 10;
      setShown((prev) => (prev === step ? prev : step));
      return { minutes: l.minutes, look: l.look, still: l.still };
    });
  }, []);

  // How dark the type should be: 0 white at night, dawn and dusk, rising to ink under a bright noon.
  // It follows the sky's own colour, so it eases in and out with the hour instead of flipping.
  const s = skyAt(shown);
  const ink = Math.min(1, Math.max(0, (s.zenith[2] - 0.5) / 0.26)) * (1 - s.night);
  const tone = (a: number) => `color-mix(in oklab, #0a0a0a ${Math.round(ink * 100)}%, rgb(255 255 255 / ${a}))`;
  const moment = momentOf(shown);
  return (
    <section
      data-slot="hero-sky"
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest("a, button")) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        live.current.drag = { x: e.clientX, from: live.current.minutes };
        setDragging(true);
      }}
      onPointerMove={(e) => {
        const l = live.current;
        const r = e.currentTarget.getBoundingClientRect();
        if (l.drag) {
          // The width of the hero is half a day.
          const m = l.drag.from + ((e.clientX - l.drag.x) / r.width) * 720;
          l.minutes = ((m % 1440) + 1440) % 1440;
        }
        if (!reduce && e.pointerType === "mouse") l.lookTo = [((e.clientX - r.left) / r.width) * 2 - 1, ((e.clientY - r.top) / r.height) * 2 - 1];
      }}
      onPointerUp={() => {
        live.current.drag = null;
        setDragging(false);
      }}
      onPointerCancel={() => {
        live.current.drag = null;
        setDragging(false);
      }}
      onPointerLeave={() => (live.current.lookTo = [0, 0])}
      className={cn(
        "relative isolate flex min-h-[720px] touch-pan-y flex-col overflow-hidden bg-[linear-gradient(to_bottom,#141a3d,#e9a58a_55%,#6b5a80)] px-6 pt-24 pb-10 select-none sm:min-h-[800px] sm:px-10 sm:pt-28 lg:px-16",
        dragging ? "cursor-grabbing" : "cursor-grab",
        className,
      )}
    >
      <canvas ref={canvas} aria-hidden className="absolute inset-0 -z-10 size-full" />
      {/* Settle the top edge so the type always has something quiet to sit on */}
      <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-1/2 bg-gradient-to-b from-black/25 to-transparent" />

      <div className="max-w-5xl [transition:color_600ms_ease]" style={{ color: tone(1) }}>
        <p className="flex items-center gap-2 text-sm font-medium [transition:color_600ms_ease]" style={{ color: tone(0.7) }}>
          <span className="size-1.5 rounded-full bg-current" />
          Stratus · cloud forecasts for pilots
        </p>
        <h1 className="mt-5 text-5xl leading-[1.02] font-semibold tracking-[-0.045em] [text-shadow:0_1px_30px_rgb(0_0_0/0.12)] sm:text-7xl">
          {/* Every phrase sits in the same cell, so the slot is always as big as the longest one and nothing below it moves. */}
          <span className="grid">
            {MOMENTS.map((m) => (
              <span
                key={m}
                aria-hidden={m !== moment}
                className={cn("[grid-area:1/1] text-balance sm:whitespace-nowrap [transition:opacity_500ms_ease,filter_500ms_ease,translate_500ms_ease]", m === moment ? "opacity-100 blur-0" : "translate-y-2 opacity-0 blur-sm", reduce && "transition-none")}
              >
                {HEADLINES[m]}
              </span>
            ))}
          </span>
          <span className="block">
            at{" "}
            <span
              className="inline-flex translate-y-[-0.04em] rounded-[0.22em] px-[0.16em] tabular-nums backdrop-blur-md [transition:background-color_600ms_ease,box-shadow_600ms_ease]"
              style={{ background: `color-mix(in oklab, rgb(255 255 255 / 0.4) ${Math.round(ink * 100)}%, rgb(255 255 255 / 0.12))`, boxShadow: `inset 0 0 0 1px ${tone(0.22)}` }}
            >
              {clock(shown)}
            </span>
          </span>
        </h1>
        <p className="mt-6 max-w-md text-lg leading-8 text-pretty [transition:color_600ms_ease]" style={{ color: tone(0.75) }}>
          Cloud, wind and light, hour by hour, for wherever you&apos;re flying next.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-2.5">
          <a
            href="#"
            className="inline-flex h-12 items-center rounded-full px-6 text-[15px] font-medium shadow-[0_10px_30px_-10px_rgb(0_0_0/0.45)] [transition:background-color_600ms_ease,color_600ms_ease] hover:opacity-90"
            style={{ background: tone(1), color: `color-mix(in oklab, #ffffff ${Math.round(ink * 100)}%, #0a0a0a)` }}
          >
            Get the forecast
          </a>
          <a
            href="#"
            className="inline-flex h-12 items-center gap-2 rounded-full px-6 text-[15px] font-medium backdrop-blur-md [transition:color_600ms_ease,box-shadow_600ms_ease] hover:bg-current/10"
            style={{ boxShadow: `inset 0 0 0 1px ${tone(0.3)}` }}
          >
            See a sample route <ArrowRight className="size-4" />
          </a>
        </div>
      </div>

      {/* How to play with it, in the corner */}
      <p aria-hidden className="mt-auto self-end text-[13px] [transition:color_600ms_ease]" style={{ color: tone(0.6) }}>
        {reduce ? "Drag across the sky to change the hour" : "Drag across the sky to change the hour · let go and the day carries on"}
      </p>
    </section>
  );
}

export default function Demo() {
  return <HeroSky />;
}
