"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";

export type OrbState = "idle" | "listening" | "thinking" | "speaking";
export type OrbVariant = "liquid" | "halo";

/** Three CSS colours each: body, highlight, depth. `accent` follows your --signal token. */
export const orbPalettes = {
  accent: ["var(--signal)", "color-mix(in oklab, var(--signal) 45%, #ffe9c4)", "color-mix(in oklab, var(--signal) 62%, #5b1648)"],
  ocean: ["#3b7cf6", "#9fe3ff", "#3a2fb8"],
  moss: ["#5d9c4c", "#e3efa6", "#17594a"],
  ink: ["#8a8378", "#f1ece2", "#24211d"],
} satisfies Record<string, [string, string, string]>;

export type OrbPalette = keyof typeof orbPalettes;

/** How each state moves: flow speed, swirl, turbulence. Uniforms ease between them, so states melt into each other. */
const motionFor: Record<OrbState, { speed: number; swirl: number; turb: number }> = {
  idle: { speed: 0.22, swirl: 0.12, turb: 0.5 },
  listening: { speed: 0.45, swirl: 0.05, turb: 0.7 },
  thinking: { speed: 0.95, swirl: 1.5, turb: 1.0 },
  speaking: { speed: 0.7, swirl: 0.3, turb: 0.85 },
};

const VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uT, uSwirl, uTurb, uLevel, uMode;
uniform vec3 uA, uB, uC;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p), u = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), u.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0., a = .5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = m * p; a *= .5; }
  return v;
}

void main(){
  float px = 2. / min(uRes.x, uRes.y);
  vec2 uv = (gl_FragCoord.xy - .5 * uRes) * px;
  float r = length(uv), t = uT;

  if (uMode > .5) {
    // Halo: ribbons of light running round a ring, displaced by flowing noise.
    float a = atan(uv.y, uv.x);
    vec2 dir = vec2(cos(a), sin(a));
    float alpha = 0.;
    vec3 col = vec3(0.);
    for (int i = 0; i < 3; i++) {
      float fi = float(i);
      float n = fbm(dir * (1.2 + fi * .45) + vec2(t * (.3 + fi * .1), fi * 7.3) + uSwirl * .5 * vec2(sin(a + t), cos(a - t)));
      float radius = .68 + (n - .5) * (.16 + .26 * uLevel) * (.6 + uTurb * .5);
      float width = .028 + .022 * fi + .05 * uLevel;
      float band = exp(-pow((r - radius) / width, 2.)) * (.62 - fi * .14);
      vec3 c = mix(mix(uA, uB, smoothstep(.35, .8, n)), uC, smoothstep(.45, .15, n) * .6);
      // Premultiplied "over": each ribbon lies on top of the last.
      col = col * (1. - band) + c * band;
      alpha = alpha * (1. - band) + band;
    }
    float fade = 1. - smoothstep(.94, 1., r);
    gl_FragColor = vec4(col * fade, alpha * fade);
    return;
  }

  // Liquid: a glass ball of slowly folding colour.
  float alpha = 1. - smoothstep(1. - px * 1.5, 1., r);
  float z = sqrt(max(0., 1. - r * r));
  vec2 p = uv / (.55 + .65 * z);
  float ang = uSwirl * (1. - r) * 2.2 + t * .12;
  p = mat2(cos(ang), -sin(ang), sin(ang), cos(ang)) * p;

  vec2 q = vec2(fbm(p * 1.3 + vec2(0., t * .35)), fbm(p * 1.3 + vec2(5.2, -t * .3)));
  vec2 w = vec2(fbm(p * 1.1 + uTurb * 2.4 * q + vec2(1.7, 9.2) + t * .22), fbm(p * 1.1 + uTurb * 2.4 * q + vec2(8.3, 2.8) - t * .18));
  float f = fbm(p + uTurb * 3. * w);

  vec3 col = mix(uC, uA, smoothstep(.22, .7, f));
  col = mix(col, uB, smoothstep(.55, 1.05, length(w)) * .9);
  col += uB * pow(q.x, 3.) * .3;
  col *= .86 + .3 * uLevel + .2 * z;

  col = mix(col, col * .6, smoothstep(.5, 1., r) * .55);
  col += mix(uB, vec3(1.), .55) * pow(1. - z, 3.) * .5;
  col += vec3(1.) * pow(smoothstep(.6, 0., length(uv - vec2(-.36, .44))), 3.) * .3;

  gl_FragColor = vec4(clamp(col, 0., 1.) * alpha, alpha);
}`;

/** Resolves any CSS colour (tokens, color-mix, oklch) to linear-ish 0–1 RGB for the shader. */
function resolveColors(el: HTMLElement, colors: readonly string[]) {
  const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
  const probe = document.createElement("span");
  el.appendChild(probe);
  const out = colors.map((c) => {
    probe.style.color = c;
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = "#888";
    ctx.fillStyle = getComputedStyle(probe).color;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return [r / 255, g / 255, b / 255] as const;
  });
  probe.remove();
  return out;
}

/**
 * A fluid orb drawn by a small WebGL shader: colour folds through itself like
 * ink in water. Each state flows differently and they blend into one another.
 * Pass `level` (0 to 1) from real audio, or leave it out and the orb simulates one.
 */
export function Orb({
  state = "idle",
  variant = "liquid",
  palette = "accent",
  level,
  size = 168,
  bezel = true,
  className,
}: {
  state?: OrbState;
  variant?: OrbVariant;
  palette?: OrbPalette | [string, string, string];
  level?: number;
  size?: number;
  /** A raised ring around the glass, like a lens set into a panel. */
  bezel?: boolean;
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  const live = useRef({ state, variant, level });
  useEffect(() => {
    live.current = { state, variant, level };
  });
  const colors = typeof palette === "string" ? orbPalettes[palette] : palette;
  const colorKey = colors.join("|");

  useEffect(() => {
    const el = canvas.current!;
    const gl = el.getContext("webgl", { premultipliedAlpha: true, antialias: false });
    if (!gl || gl.isContextLost()) return;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = (name: string) => gl.getUniformLocation(program, name);
    const U = { res: u("uRes"), t: u("uT"), swirl: u("uSwirl"), turb: u("uTurb"), level: u("uLevel"), mode: u("uMode"), a: u("uA"), b: u("uB"), c: u("uC") };

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    el.width = el.height = Math.round(size * dpr);
    gl.viewport(0, 0, el.width, el.height);
    gl.uniform2f(U.res, el.width, el.height);

    const paint = () => {
      const [a, b, c] = resolveColors(root.current!, colorKey.split("|"));
      gl.uniform3f(U.a, ...a);
      gl.uniform3f(U.b, ...b);
      gl.uniform3f(U.c, ...c);
    };
    paint();
    // Re-tint when the theme or accent changes on <html>.
    const watcher = new MutationObserver(paint);
    watcher.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });

    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0.2 : 1;
    const now = { ...motionFor[live.current.state], level: 0, mode: live.current.variant === "halo" ? 1 : 0 };
    let phase = Math.random() * 40;
    let last = performance.now();
    let frame = 0;
    let visible = true;
    const seen = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    seen.observe(el);

    const tick = (time: number) => {
      frame = requestAnimationFrame(tick);
      const dt = Math.min(0.05, Math.max(0, (time - last) / 1000));
      last = time;
      if (!visible) return;

      const { state, variant, level } = live.current;
      const target = motionFor[state];
      const s = time / 1000;
      const heard =
        level ??
        {
          idle: 0.06 + Math.sin(s * 1.3) * 0.05,
          listening: 0.18 + Math.abs(Math.sin(s * 4.2) * Math.sin(s * 1.9)) * 0.4,
          thinking: 0.14 + Math.sin(s * 2.4) * 0.08,
          speaking: 0.2 + Math.abs(Math.sin(s * 8.5) * Math.cos(s * 3.1)) * 0.7,
        }[state];

      // Ease every uniform toward its target so changes are never a cut.
      const k = 1 - Math.exp(-dt * 3.2);
      now.speed += (target.speed - now.speed) * k;
      now.swirl += (target.swirl - now.swirl) * k;
      now.turb += (target.turb - now.turb) * k;
      now.level += (heard - now.level) * (1 - Math.exp(-dt * 14));
      now.mode += ((variant === "halo" ? 1 : 0) - now.mode) * (1 - Math.exp(-dt * 20));
      phase += dt * (now.speed + now.level * 0.9) * calm;

      gl.uniform1f(U.t, phase);
      gl.uniform1f(U.swirl, now.swirl);
      gl.uniform1f(U.turb, now.turb);
      gl.uniform1f(U.level, now.level);
      gl.uniform1f(U.mode, now.mode);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      el.style.transform = `scale(${1 + now.level * 0.07})`;
      if (glow.current) glow.current.style.opacity = String(0.25 + now.level * 0.6);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      watcher.disconnect();
      seen.disconnect();
      // The canvas keeps its context across re-runs (React runs effects twice in dev), so free only what we made.
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
    };
  }, [size, colorKey]);

  const pad = bezel ? Math.max(3, Math.round(size * 0.055)) : 0;

  return (
    <div
      ref={root}
      data-slot="orb"
      role="img"
      aria-label={`Assistant is ${state}`}
      style={{ width: size + pad * 2, height: size + pad * 2, padding: pad }}
      className={cn(
        "relative grid shrink-0 place-items-center rounded-full",
        bezel &&
          "bg-linear-to-b from-white to-base-800 shadow-[0_1px_0_white_inset,0_2px_4px_rgb(0_0_0/0.12),0_18px_36px_-14px_color-mix(in_oklab,var(--color-shade)_70%,transparent)] ring-1 ring-black/10 dark:from-base-700 dark:to-base-900 dark:shadow-[0_1px_0_rgb(255_255_255/0.1)_inset,0_18px_36px_-12px_black] dark:ring-white/5",
        className,
      )}
    >
      <div ref={glow} style={{ background: colors[0] }} className="pointer-events-none absolute inset-[12%] rounded-full opacity-30 blur-2xl" />
      <div
        style={{ width: size, height: size }}
        className={cn("relative rounded-full", bezel && "bg-base-950 shadow-[inset_0_2px_6px_rgb(0_0_0/0.35)] dark:bg-black")}
      >
        <canvas ref={canvas} style={{ width: size, height: size }} className="block rounded-full will-change-transform" />
      </div>
    </div>
  );
}

/** Live microphone level (0–1) using the Web Audio API. */
export function useMicLevel(enabled: boolean, onError?: () => void) {
  const [level, setLevel] = useState(0);
  const errorRef = useRef(onError);
  useEffect(() => {
    errorRef.current = onError;
  });

  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    let cancelled = false;
    let stream: MediaStream | undefined;
    let ctx: AudioContext | undefined;

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((s) => {
        if (cancelled) return s.getTracks().forEach((t) => t.stop());
        stream = s;
        ctx = new AudioContext();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        ctx.createMediaStreamSource(s).connect(analyser);
        const data = new Uint8Array(analyser.fftSize);
        const loop = () => {
          analyser.getByteTimeDomainData(data);
          let sum = 0;
          for (const v of data) sum += ((v - 128) / 128) ** 2;
          setLevel(Math.min(1, Math.sqrt(sum / data.length) * 5));
          frame = requestAnimationFrame(loop);
        };
        loop();
      })
      .catch(() => errorRef.current?.());

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      stream?.getTracks().forEach((t) => t.stop());
      ctx?.close();
    };
  }, [enabled]);

  return enabled ? level : 0;
}

const states: OrbState[] = ["idle", "listening", "thinking", "speaking"];
const palettes = Object.keys(orbPalettes) as OrbPalette[];

function Pills<T extends string>({ value, options, onChange, id }: { value: T | null; options: readonly T[]; onChange: (v: T) => void; id: string }) {
  return (
    <div className="flex rounded-full bg-base-50/[0.06] p-1 shadow-[inset_0_1px_2px_rgb(0_0_0/0.12)] ring-1 ring-base-50/5">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={cn(
            "relative rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors",
            value === o ? "text-base-50" : "text-base-500 hover:text-base-200",
          )}
        >
          {value === o && (
            <motion.span
              layoutId={id}
              transition={{ type: "spring", stiffness: 520, damping: 34 }}
              className="absolute inset-0 rounded-full bg-linear-to-b from-white to-base-950 shadow-[0_1px_0_white_inset,0_1px_2px_rgb(0_0_0/0.14)] ring-1 ring-black/5 dark:from-base-700 dark:to-base-800 dark:shadow-[0_1px_0_rgb(255_255_255/0.1)_inset] dark:ring-white/5"
            />
          )}
          <span className="relative">{o}</span>
        </button>
      ))}
    </div>
  );
}

export default function Demo() {
  const [state, setState] = useState<OrbState>("thinking");
  const [variant, setVariant] = useState<OrbVariant>("liquid");
  const [palette, setPalette] = useState<OrbPalette>("accent");
  const [mic, setMic] = useState(false);
  const level = useMicLevel(mic, () => setMic(false));

  return (
    <div className="flex flex-col items-center gap-8">
      <Orb state={mic ? "listening" : state} variant={variant} palette={palette} level={mic ? level : undefined} />

      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          <Pills
            id="orb-state"
            value={mic ? null : state}
            options={states}
            onChange={(s) => {
              setMic(false);
              setState(s);
            }}
          />
          <button
            onClick={() => setMic((m) => !m)}
            aria-label={mic ? "Stop microphone" : "Use microphone"}
            className={cn(
              "grid size-9 place-items-center rounded-full ring-1 transition-colors [&_svg]:size-4",
              mic ? "bg-signal/15 text-signal ring-signal/30" : "text-base-400 ring-base-50/10 hover:text-base-100",
            )}
          >
            {mic ? <MicOff /> : <Mic />}
          </button>
        </div>
        <div className="flex items-center gap-4">
          <Pills id="orb-variant" value={variant} options={["liquid", "halo"] as const} onChange={setVariant} />
          <div className="flex gap-2">
            {palettes.map((p) => (
              <button
                key={p}
                onClick={() => setPalette(p)}
                aria-label={`${p} palette`}
                style={{ background: `linear-gradient(135deg, ${orbPalettes[p][1]}, ${orbPalettes[p][0]} 55%, ${orbPalettes[p][2]})` }}
                className={cn(
                  "size-5 rounded-full ring-2 ring-offset-2 ring-offset-base-950 transition-shadow",
                  palette === p ? "ring-base-50/60" : "ring-transparent hover:ring-base-50/20",
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
