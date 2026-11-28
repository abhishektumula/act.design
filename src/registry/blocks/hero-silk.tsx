"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------------------------------- silk ---------------------------------- */

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

/**
 * A sheet of blue silk, as a height field of folded sine waves. Normals come
 * from the slope, and it's lit like satin: a soft diffuse, a tight specular
 * that slides along the folds, and a cool sheen at grazing angles. The pointer
 * lifts the cloth beneath it and a click drops a ripple that runs out across
 * the folds.
 */
const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uPtr;
uniform float uPush;
uniform float uEnergy;
uniform vec3 uRip[3];

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }

float field(vec2 p){
  float t = uTime;
  // Long folds that run one way, their line bent by a slow, wide warp.
  float warp = sin(p.x * 0.33 + t * 0.14) * 1.7 + sin(p.x * 0.81 - t * 0.1 + 1.3) * 0.7 + sin(p.y * 0.37 + t * 0.06) * 0.5;
  float y = p.y + warp;
  float v = sin(y * 1.35 + t * 0.22) * 0.6;
  v += sin(y * 2.6 - t * 0.17 + p.x * 0.28) * 0.24;
  v += sin(y * 5.1 + p.x * 0.55 + t * 0.38) * (0.04 + uEnergy * 0.08);
  vec2 d = p - uPtr;
  v += uPush * 0.32 * exp(-dot(d, d) * 0.35);
  // Ripples: rings that run outward from where you clicked, in a band that travels and fades.
  for (int i = 0; i < 3; i++) {
    vec3 rp = uRip[i];
    if (rp.z < 0.0) continue;
    float r = length(p - rp.xy);
    float front = rp.z * 2.2;
    float band = exp(-pow((r - front) * 1.3, 2.0)) * smoothstep(0.0, 0.15, rp.z) * exp(-rp.z * 0.75);
    v += 0.11 * sin(r * 8.0 - rp.z * 17.0) * band / (1.0 + r * 0.4);
  }
  return v;
}


void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  // Lay the folds on a diagonal.
  mat2 rot = mat2(0.86, -0.5, 0.5, 0.86);
  vec2 p = rot * uv * 3.8;
  float h = field(p);
  float e = 0.01;
  float dx = (field(p + vec2(e, 0.0)) - field(p - vec2(e, 0.0))) / (2.0 * e);
  float dy = (field(p + vec2(0.0, e)) - field(p - vec2(0.0, e))) / (2.0 * e);
  vec3 n = normalize(vec3(-dx, -dy, 0.95));

  vec3 L = normalize(vec3(-0.45, 0.55, 0.75));
  float diff = clamp(dot(n, L), 0.0, 1.0);
  float spec = pow(max(dot(reflect(-L, n), vec3(0.0, 0.0, 1.0)), 0.0), 12.0);
  float sheen = pow(1.0 - n.z, 1.6);

  vec3 deep = vec3(0.004, 0.03, 0.16);
  vec3 mid = vec3(0.09, 0.33, 0.96);
  vec3 pale = vec3(0.78, 0.89, 1.0);
  vec3 col = mix(deep, mid, smoothstep(0.0, 0.85, diff));
  // Valleys of the cloth sit in shadow.
  col *= 0.62 + 0.38 * smoothstep(-1.0, 0.9, h);
  col += pale * spec * 0.55;
  col += vec3(0.35, 0.55, 1.0) * sheen * 0.45;

  // Vignette, then grain so the gradients don't band.
  col *= 1.0 - 0.35 * dot(uv * vec2(0.8, 1.0), uv * vec2(0.8, 1.0));
  col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) * 0.03;
  gl_FragColor = vec4(max(col, 0.0), 1.0);
}
`;

type Frame = { ptr: [number, number]; push: number; rips: number[]; still: boolean };

/** Runs the shader on a canvas, pausing off screen. Returns a cleanup. */
function startSilk(el: HTMLCanvasElement, read: (dt: number) => Frame) {
  const gl = el.getContext("webgl", { antialias: false, powerPreference: "low-power" });
  if (!gl) return; // the CSS gradient behind the canvas stands in
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

  const resize = () => {
    const r = el.getBoundingClientRect();
    const k = Math.min(window.devicePixelRatio, 2) * 0.6;
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
  let time = 12;
  let last = performance.now();
  const draw = (now: number) => {
    raf = requestAnimationFrame(draw);
    const dt = Math.min(now - last, 64) / 1000;
    last = now;
    if (!visible) return;
    const f = read(dt);
    // Typing speeds the cloth up a little, as well as stirring it.
    if (!f.still) time += dt;
    gl.uniform2f(u("uRes"), el.width, el.height);
    gl.uniform1f(u("uTime"), time);
    gl.uniform2fv(u("uPtr"), f.ptr);
    gl.uniform1f(u("uPush"), f.push);
    gl.uniform1f(u("uEnergy"), 0);
    gl.uniform3fv(u("uRip[0]"), f.rips);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  draw(performance.now());
  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
  };
}

/* ---------------------------------- block --------------------------------- */

const TOOLS = ["Linear", "Figma", "GitHub", "Notion", "Slack"];

/** Pointer position in the shader's space: the same maths as `p` in the fragment shader. */
function toField(el: HTMLElement, clientX: number, clientY: number): [number, number] {
  const r = el.getBoundingClientRect();
  const x = (clientX - r.left - r.width / 2) / r.height;
  const y = -(clientY - r.top - r.height / 2) / r.height;
  return [(0.86 * x + 0.5 * y) * 3.8, (-0.5 * x + 0.86 * y) * 3.8];
}

/**
 * An agent hero on a sheet of moving silk. The cloth rises under the pointer
 * and follows it around; click anywhere and a ripple runs out across the
 * folds from that point. The headline names the tool the agent will work in.
 */
export function HeroSilk({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const canvas = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState(0);

  // What the shader reads each frame, eased toward targets set by events.
  // Three ripple slots as [x, y, age]; age -1 means empty.
  const live = useRef({ ptr: [0, 0] as [number, number], ptrTo: [0, 0] as [number, number], push: 0, pushTo: 0, rips: [0, 0, -1, 0, 0, -1, 0, 0, -1], next: 0, still: false });

  useEffect(() => {
    live.current.still = !!reduce;
  }, [reduce]);

  useEffect(() => {
    if (!canvas.current) return;
    return startSilk(canvas.current, (dt) => {
      const l = live.current;
      const k = 1 - Math.exp(-dt * 4);
      l.ptr = [l.ptr[0] + (l.ptrTo[0] - l.ptr[0]) * k, l.ptr[1] + (l.ptrTo[1] - l.ptr[1]) * k];
      l.push += (l.pushTo - l.push) * k;
      for (let i = 2; i < 9; i += 3) {
        if (l.rips[i] >= 0) l.rips[i] += dt;
        if (l.rips[i] > 5) l.rips[i] = -1;
      }
      return { ptr: l.ptr, push: l.push, rips: l.rips, still: l.still };
    });
  }, []);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setTool((t) => (t + 1) % TOOLS.length), 2400);
    return () => clearInterval(id);
  }, [reduce]);

  return (
    <section
      data-slot="hero-silk"
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        live.current.ptrTo = toField(e.currentTarget, e.clientX, e.clientY);
        live.current.pushTo = 1;
      }}
      onPointerLeave={() => (live.current.pushTo = 0)}
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest("a, button")) return;
        const l = live.current;
        const [x, y] = toField(e.currentTarget, e.clientX, e.clientY);
        // Up to three at once; a fourth click reuses the oldest slot.
        l.rips.splice(l.next * 3, 3, x, y, 0);
        l.next = (l.next + 1) % 3;
      }}
      className={cn("relative isolate flex min-h-[720px] flex-col justify-end overflow-hidden bg-[radial-gradient(120%_90%_at_30%_20%,#2563eb,#0b1d63_55%,#020617)] px-6 pt-28 pb-16 select-none sm:min-h-[800px] sm:px-10 lg:px-16", className)}
    >
      <canvas ref={canvas} aria-hidden className="absolute inset-0 -z-10 size-full" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-2/3 bg-gradient-to-t from-black/45 to-transparent" />

      <div className="mx-auto grid w-full max-w-6xl items-end gap-10 lg:grid-cols-[1fr_auto]">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-white/70">
            <span className="size-1.5 rounded-full bg-white" />
            Tide · an agent for the tools you already use
          </p>
          <h1 className="mt-5 max-w-4xl text-5xl leading-[1.02] font-semibold tracking-[-0.045em] text-balance text-white sm:text-7xl">
            Say it once. Tide does the work in{" "}
            <span className="relative inline-flex translate-y-[-0.04em] overflow-hidden rounded-[0.22em] bg-white/12 px-[0.16em] align-baseline shadow-[inset_0_0_0_1px_rgb(255_255_255/0.22)] backdrop-blur-md">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={TOOLS[tool]}
                  initial={reduce ? false : { y: "0.7em", opacity: 0, filter: "blur(6px)" }}
                  animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                  exit={{ y: "-0.7em", opacity: 0, filter: "blur(6px)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="inline-block"
                >
                  {TOOLS[tool]}
                </motion.span>
              </AnimatePresence>
            </span>
          </h1>
          <div className="mt-9 flex flex-wrap items-center gap-2.5">
            <a href="#" className="inline-flex h-12 items-center rounded-full bg-white px-6 text-[15px] font-medium text-blue-950 shadow-[0_10px_30px_-10px_rgb(0_0_0/0.6)] transition-colors hover:bg-white/90">
              Try Tide free
            </a>
            <a href="#" className="inline-flex h-12 items-center gap-2 rounded-full px-6 text-[15px] font-medium text-white shadow-[inset_0_0_0_1px_rgb(255_255_255/0.3)] backdrop-blur-md transition-colors hover:bg-white/10">
              Watch it work <ArrowRight className="size-4" />
            </a>
          </div>
        </div>
        <p aria-hidden className="text-[13px] text-white/55 lg:text-right">Move through the silk, or click to send a ripple</p>
      </div>
    </section>
  );
}

export default function Demo() {
  return <HeroSilk />;
}
