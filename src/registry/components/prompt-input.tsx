"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUp,
  Check,
  ChevronDown,
  FileText,
  Lock,
  Mic,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Square,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Option = { id: string; name: string; hint?: string };

export const models: Option[] = [
  { id: "opus-5.5", name: "Opus 5.5", hint: "Most capable for hard work" },
  { id: "sonnet-5.5", name: "Sonnet 5.5", hint: "Smart, fast, everyday" },
  { id: "haiku-5.5", name: "Haiku 5.5", hint: "Fastest for quick answers" },
];

export const efforts: Option[] = [
  { id: "low", name: "Low", hint: "Quick replies" },
  { id: "medium", name: "Medium", hint: "Balanced" },
  { id: "high", name: "High", hint: "Thinks it through" },
  { id: "max", name: "Max", hint: "Deepest reasoning" },
];

export const accessModes: Option[] = [
  { id: "ask", name: "Ask first", hint: "Approve every action" },
  { id: "edits", name: "Auto-edit", hint: "Edits files without asking" },
  { id: "full", name: "Full access", hint: "Runs anything, no prompts" },
];

const accessIcon: Record<string, ReactNode> = {
  ask: <Lock className="size-3.5" />,
  edits: <ShieldCheck className="size-3.5" />,
  full: <ShieldAlert className="size-3.5 text-amber-600 dark:text-amber-400" />,
};

function EffortBars({ level }: { level: number }) {
  return (
    <span className="flex h-3 items-end gap-[2px]">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className={`w-[3px] rounded-full transition-colors ${i <= level ? "bg-base-200" : "bg-base-700"}`}
          style={{ height: `${40 + i * 20}%` }}
        />
      ))}
    </span>
  );
}

function Picker({
  options,
  value,
  onChange,
  icon,
  align = "left",
  hideLabel,
}: {
  options: Option[];
  value: Option;
  onChange: (o: Option) => void;
  icon?: (o: Option) => ReactNode;
  align?: "left" | "right";
  hideLabel?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-base-400 transition-colors hover:bg-base-50/5 hover:text-base-100 data-[open=true]:bg-base-50/5 data-[open=true]:text-base-100"
        data-open={open}
      >
        {icon?.(value)}
        <span className={hideLabel ? "hidden @md:inline" : ""}>{value.name}</span>
        <ChevronDown className={`size-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 4, scale: 0.98, filter: "blur(2px)" }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className={`absolute bottom-full z-20 mb-2 w-56 origin-bottom rounded-xl bg-base-900 p-1 shadow-2xl shadow-shade/60 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/5 ${
              align === "right" ? "right-0" : "left-0"
            }`}
          >
            {options.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => {
                  onChange(o);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-base-50/5"
              >
                {icon && <span className="text-base-400">{icon(o)}</span>}
                <span className="flex-1">
                  <span className="block text-[13px] text-base-100">{o.name}</span>
                  {o.hint && <span className="block text-xs text-base-500">{o.hint}</span>}
                </span>
                {o.id === value.id && <Check className="size-3.5 text-base-200" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export type PromptSettings = { model: string; effort: string; access: string };

export function PromptInput({
  onSubmit,
  onStop,
  busy = false,
  placeholder = "Ask anything, @ to mention files…",
  modelOptions = models,
  effortOptions = efforts,
  accessOptions = accessModes,
  className,
  classNames,
}: {
  onSubmit?: (text: string, settings: PromptSettings, files: string[]) => void;
  onStop?: () => void;
  busy?: boolean;
  placeholder?: string;
  modelOptions?: Option[];
  effortOptions?: Option[];
  accessOptions?: Option[];
  className?: string;
  classNames?: { box?: string; textarea?: string; send?: string };
}) {
  const [value, setValue] = useState("");
  const [files, setFiles] = useState<string[]>([]);
  const [model, setModel] = useState(modelOptions[0]);
  const [effort, setEffort] = useState(effortOptions[Math.min(2, effortOptions.length - 1)]);
  const [access, setAccess] = useState(accessOptions[0]);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = textarea.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  const canSend = value.trim().length > 0 || files.length > 0;

  const submit = () => {
    if (busy) return onStop?.();
    if (!canSend) return;
    onSubmit?.(value.trim(), { model: model.id, effort: effort.id, access: access.id }, files);
    setValue("");
    setFiles([]);
  };

  return (
    <div data-slot="prompt-input" className={cn("@container w-full", className)}>
      <div className={cn("rounded-2xl bg-base-900 shadow-xl shadow-shade/50 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/5 transition-shadow focus-within:ring-base-50/20", classNames?.box)}>
        <AnimatePresence initial={false}>
          {files.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-2 px-3 pt-3">
                <AnimatePresence initial={false}>
                  {files.map((f) => (
                    <motion.span
                      key={f}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex items-center gap-2 rounded-lg bg-base-800 py-1.5 pr-1.5 pl-2 text-xs text-base-300 ring-1 ring-base-50/5"
                    >
                      <FileText className="size-3.5 text-base-500" />
                      <span className="max-w-32 truncate">{f}</span>
                      <button
                        type="button"
                        onClick={() => setFiles((fs) => fs.filter((x) => x !== f))}
                        className="rounded p-0.5 text-base-500 hover:bg-base-50/10 hover:text-base-200"
                        aria-label={`Remove ${f}`}
                      >
                        <X className="size-3" />
                      </button>
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <textarea
          ref={textarea}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={placeholder}
          className={cn("block min-h-14 w-full resize-none bg-transparent px-4 pt-4 pb-2 text-[15px] leading-6 text-base-100 outline-none placeholder:text-base-500", classNames?.textarea)}
        />

        <div className="flex items-center gap-1 px-2 pb-2">
          <input
            ref={fileInput}
            type="file"
            multiple
            hidden
            onChange={(e) => {
              const names = Array.from(e.target.files ?? []).map((f) => f.name);
              setFiles((fs) => [...new Set([...fs, ...names])]);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            aria-label="Attach files"
            className="grid size-8 place-items-center rounded-lg text-base-400 transition-colors hover:bg-base-50/5 hover:text-base-100"
          >
            <Plus className="size-4" />
          </button>
          <Picker
            options={modelOptions}
            value={model}
            onChange={setModel}
            icon={() => <Sparkles className="size-3.5" />}
          />
          <Picker
            options={effortOptions}
            value={effort}
            onChange={setEffort}
            hideLabel
            icon={(o) => <EffortBars level={effortOptions.findIndex((e) => e.id === o.id)} />}
          />

          <div className="ml-auto flex items-center gap-1">
            <Picker
              options={accessOptions}
              value={access}
              onChange={setAccess}
              align="right"
              hideLabel
              icon={(o) => accessIcon[o.id]}
            />
            <button
              type="button"
              aria-label="Dictate"
              className="grid size-8 place-items-center rounded-lg text-base-400 transition-colors hover:bg-base-50/5 hover:text-base-100"
            >
              <Mic className="size-4" />
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={!busy && !canSend}
              aria-label={busy ? "Stop" : "Send"}
              className={cn("relative grid size-8 place-items-center overflow-hidden rounded-full bg-base-50 text-base-950 shadow-md shadow-shade/40 inset-shadow-2xs inset-shadow-white transition-[background,transform] active:scale-95 disabled:bg-base-800 disabled:text-base-500 disabled:shadow-none", classNames?.send)}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={busy ? "stop" : "send"}
                  initial={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
                  transition={{ duration: 0.18 }}
                >
                  {busy ? <Square className="size-3 fill-current" /> : <ArrowUp className="size-4" strokeWidth={2.5} />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Demo() {
  const [busy, setBusy] = useState(false);
  const [last, setLast] = useState<string | null>(null);

  useEffect(() => {
    if (!busy) return;
    const t = setTimeout(() => setBusy(false), 2600);
    return () => clearTimeout(t);
  }, [busy]);

  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <AnimatePresence mode="wait">
        {last && (
          <motion.p
            key={last}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="self-end rounded-2xl rounded-br-md bg-base-800 px-3.5 py-2 text-sm text-base-100"
          >
            {last}
          </motion.p>
        )}
      </AnimatePresence>
      <PromptInput
        busy={busy}
        onStop={() => setBusy(false)}
        onSubmit={(text) => {
          setLast(text || "📎 Attached files");
          setBusy(true);
        }}
      />
    </div>
  );
}
