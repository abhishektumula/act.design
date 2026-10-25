"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Check, Copy, Terminal } from "lucide-react";
import { TextStagger } from "@/components/ui/text-stagger";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

const script = [
  { kind: "cmd", text: "npx lumen deploy" },
  { kind: "out", text: "◇ Building 214 routes" },
  { kind: "out", text: "◇ Uploading assets to 38 regions" },
  { kind: "out", text: "◇ Warming edge cache" },
  { kind: "ok", text: "✓ Live at lumen.app in 4.2s" },
] as const;

function DeployTerminal() {
  const [shown, setShown] = useState(0);
  const [typed, setTyped] = useState(0);
  const cmd = script[0].text;

  // Type the command, then reveal output lines one at a time, then loop.
  useEffect(() => {
    const done = typed >= cmd.length;
    const t = setTimeout(
      () => {
        if (!done) setTyped((n) => n + 1);
        else if (shown < script.length - 1) setShown((n) => n + 1);
        else {
          setTyped(0);
          setShown(0);
        }
      },
      !done ? 55 : shown === script.length - 1 ? 3200 : 520,
    );
    return () => clearTimeout(t);
  }, [typed, shown, cmd.length]);

  return (
    <div className="overflow-hidden rounded-2xl bg-neutral-950 text-left shadow-2xl shadow-shade/60 ring-1 ring-neutral-50/10 inset-shadow-2xs inset-shadow-white/10">
      <div className="flex h-10 items-center gap-2 border-b border-neutral-50/5 px-4 text-xs text-neutral-500">
        <Terminal className="size-3.5" /> ~/lumen
      </div>
      <div className="h-56 space-y-1.5 p-5 font-mono text-[13px] leading-relaxed sm:p-6">
        <p className="text-neutral-200">
          <span className="text-emerald-400">❯</span> {cmd.slice(0, typed)}
          {typed < cmd.length && <span className="ml-px inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-neutral-300" />}
        </p>
        {script.slice(1, shown + 1).map((line) => (
          <motion.p
            key={line.text}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            className={line.kind === "ok" ? "text-emerald-400" : "text-neutral-500"}
          >
            {line.text}
          </motion.p>
        ))}
      </div>
    </div>
  );
}

function InstallPill({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard?.writeText(command);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="group inline-flex h-11 items-center gap-3 rounded-xl bg-base-950 pr-3 pl-4 font-mono text-sm text-base-300 ring-1 ring-base-50/10 inset-shadow-sm inset-shadow-shade/40 transition-colors hover:text-base-100"
    >
      <span className="text-base-600">$</span> {command}
      <span className="grid size-7 place-items-center rounded-lg text-base-500 transition-colors group-hover:bg-base-50/5 group-hover:text-base-200">
        {copied ? <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="size-3.5" />}
      </span>
    </button>
  );
}

export function HeroCentered({
  title = "Ship to the edge before your coffee cools.",
  body = "One command deploys your app to 38 regions with previews, rollbacks and logs built in. No YAML, no waiting.",
  command = "npm i -g lumen",
  className,
}: {
  title?: string;
  body?: string;
  command?: string;
  className?: string;
}) {
  return (
    <section data-slot="hero-centered" className={cn("relative isolate overflow-hidden bg-canvas px-6 pt-24 pb-20 sm:pt-32", className)}>
      {/* Grid backdrop that fades out toward the edges */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--color-base-900)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-base-900)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]" />
      <div className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-80 w-[48rem] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="mx-auto max-w-4xl text-center">
        <TextStagger
          as="h1"
          text={title}
          className="text-4xl leading-[1.04] font-semibold tracking-[-0.04em] text-balance text-base-50 sm:text-6xl lg:text-7xl"
        />
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6, ease }}
          className="mx-auto mt-7 max-w-xl text-lg leading-8 text-pretty text-base-400"
        >
          {body}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.6, ease }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <a
            href="#"
            className="group inline-flex h-11 items-center gap-2 rounded-xl bg-base-50 px-5 text-sm font-medium text-base-950 shadow-lg shadow-shade/40 inset-shadow-2xs inset-shadow-white/40 transition-transform active:scale-[0.97]"
          >
            Deploy now <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </a>
          <InstallPill command={command} />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40, rotateX: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
        transition={{ delay: 0.8, duration: 1, ease }}
        style={{ transformPerspective: 1200 }}
        className="mx-auto mt-20 max-w-3xl"
      >
        <DeployTerminal />
      </motion.div>
    </section>
  );
}

export default function Block() {
  return <HeroCentered />;
}
