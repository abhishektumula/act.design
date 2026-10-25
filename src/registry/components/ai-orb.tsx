"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";

export type OrbState = "idle" | "listening" | "thinking" | "speaking";

const spin: Record<OrbState, number> = { idle: 16, listening: 8, thinking: 2.4, speaking: 5 };

/** Colour palettes. Add your own — each is just three Tailwind class strings. */
export const orbPalettes = {
  ocean: {
    glow: "bg-blue-500/50",
    swirl: "bg-[conic-gradient(from_0deg,var(--color-sky-400),var(--color-blue-600),var(--color-violet-500),var(--color-fuchsia-400),var(--color-sky-400))]",
    core: "bg-[radial-gradient(circle_at_70%_65%,var(--color-indigo-500),transparent_60%)]",
  },
  sunset: {
    glow: "bg-orange-500/50",
    swirl: "bg-[conic-gradient(from_0deg,var(--color-amber-300),var(--color-orange-500),var(--color-rose-500),var(--color-pink-400),var(--color-amber-300))]",
    core: "bg-[radial-gradient(circle_at_70%_65%,var(--color-red-500),transparent_60%)]",
  },
  aurora: {
    glow: "bg-emerald-500/50",
    swirl: "bg-[conic-gradient(from_0deg,var(--color-emerald-300),var(--color-teal-500),var(--color-cyan-400),var(--color-lime-300),var(--color-emerald-300))]",
    core: "bg-[radial-gradient(circle_at_70%_65%,var(--color-teal-600),transparent_60%)]",
  },
  mono: {
    glow: "bg-white/25",
    swirl: "bg-[conic-gradient(from_0deg,var(--color-base-100),var(--color-base-500),var(--color-base-800),var(--color-base-300),var(--color-base-100))]",
    core: "bg-[radial-gradient(circle_at_70%_65%,var(--color-base-600),transparent_60%)]",
  },
};

export type OrbPalette = keyof typeof orbPalettes;

/**
 * A voice orb. Pass `level` (0–1) from a real audio source, or leave it
 * undefined and the orb simulates a level that matches its `state`.
 */
export function AIOrb({
  state = "idle",
  level,
  size = 168,
  palette = "ocean",
  className,
}: {
  state?: OrbState;
  level?: number;
  size?: number;
  palette?: OrbPalette;
  className?: string;
}) {
  const colors = orbPalettes[palette];
  const raw = useMotionValue(0);
  const smooth = useSpring(raw, { stiffness: 260, damping: 22 });
  const scale = useTransform(smooth, [0, 1], [1, 1.16]);
  const glow = useTransform(smooth, [0, 1], [0.3, 0.85]);

  useEffect(() => {
    if (level !== undefined) {
      raw.set(level);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = (now - start) / 1000;
      const value = {
        idle: 0.08 + Math.sin(t * 1.4) * 0.06,
        listening: 0.2 + Math.abs(Math.sin(t * 4.2) * Math.sin(t * 1.9)) * 0.45,
        thinking: 0.12 + Math.sin(t * 7) * 0.05,
        speaking: 0.18 + Math.abs(Math.sin(t * 8.5) * Math.cos(t * 3.1)) * 0.75,
      }[state];
      raw.set(value);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [state, level, raw]);

  const duration = spin[state];

  return (
    <div data-slot="ai-orb" className={cn("relative grid shrink-0 place-items-center", className)} style={{ width: size, height: size }}>
      <motion.div style={{ opacity: glow, scale }} className={cn("absolute inset-2 rounded-full blur-2xl", colors.glow)} />
      <motion.div style={{ scale }} className="relative size-full overflow-hidden rounded-full bg-base-950 shadow-2xl shadow-shade ring-1 ring-base-50/10">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration, repeat: Infinity, ease: "linear" }}
          className={cn("absolute -inset-1/4 opacity-90 blur-xl", colors.swirl)}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: duration * 1.7, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle_at_30%_30%,var(--color-white),transparent_55%)] opacity-60 mix-blend-overlay blur-lg"
        />
        <motion.div
          animate={{ rotate: 360, scale: state === "thinking" ? [1, 0.82, 1] : 1 }}
          transition={{
            rotate: { duration: duration * 1.2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
          }}
          className={cn("absolute inset-[18%] rounded-full blur-md", colors.core)}
        />
        {/* glass: top gloss, inner rim and soft vignette */}
        <div className="absolute inset-x-[20%] top-[5%] h-[32%] rounded-full bg-linear-to-b from-white/45 to-transparent blur-[6px]" />
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_45%,transparent_55%,var(--color-base-950)_120%)]" />
        <div className="absolute inset-0 rounded-full ring-1 ring-base-50/25 ring-inset" />
      </motion.div>
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

const dot: Record<OrbPalette, string> = {
  ocean: "bg-linear-to-br from-sky-400 to-violet-500",
  sunset: "bg-linear-to-br from-amber-300 to-rose-500",
  aurora: "bg-linear-to-br from-emerald-300 to-cyan-500",
  mono: "bg-linear-to-br from-base-100 to-base-600",
};

export default function Demo() {
  const id = useId();
  const [state, setState] = useState<OrbState>("speaking");
  const [palette, setPalette] = useState<OrbPalette>("ocean");
  const [mic, setMic] = useState(false);
  const level = useMicLevel(mic, () => setMic(false));

  return (
    <div className="flex flex-col items-center gap-10">
      <AIOrb state={mic ? "listening" : state} level={mic ? level : undefined} palette={palette} />

      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="flex rounded-full bg-base-900 p-1 ring-1 ring-base-50/10">
            {states.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setMic(false);
                  setState(s);
                }}
                className={cn(
                  "relative rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                  !mic && state === s ? "text-base-50" : "text-base-400 hover:text-base-100",
                )}
              >
                {!mic && state === s && (
                  <motion.span
                    layoutId={`${id}-pill`}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.45 }}
                    className="absolute inset-0 rounded-full bg-base-800 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/10"
                  />
                )}
                <span className="relative">{s}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setMic((m) => !m)}
            aria-label={mic ? "Stop microphone" : "Use microphone"}
            className={cn(
              "grid size-9 place-items-center rounded-full ring-1 transition-colors",
              mic ? "bg-red-500/15 text-red-600 dark:text-red-400 ring-red-500/30" : "bg-base-900 text-base-400 ring-base-50/10 hover:text-base-100",
            )}
          >
            {mic ? <MicOff className="size-4" /> : <Mic className="size-4" />}
          </button>
        </div>
        <div className="flex gap-2">
          {palettes.map((p) => (
            <button
              key={p}
              onClick={() => setPalette(p)}
              aria-label={`${p} palette`}
              className={cn(
                "size-5 rounded-full ring-2 ring-offset-2 ring-offset-base-950 transition-all",
                dot[p],
                palette === p ? "ring-base-50/70" : "ring-transparent hover:ring-base-50/20",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
