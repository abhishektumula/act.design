"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, FileText, ImageIcon, UploadCloud, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Upload = { id: string; name: string; size: number; progress: number };

function formatSize(bytes: number) {
  return bytes > 1e6 ? `${(bytes / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1e3))} KB`;
}

export function FileDropzone({
  accept,
  onFiles,
  title = "Drop files or click to browse",
  hint = "PNG, JPG, PDF up to 10 MB",
  className,
  zoneClassName,
}: {
  accept?: string;
  onFiles?: (files: File[]) => void;
  title?: string;
  hint?: string;
  className?: string;
  zoneClassName?: string;
}) {
  const [over, setOver] = useState(false);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const input = useRef<HTMLInputElement>(null);

  const add = (files: File[]) => {
    onFiles?.(files);
    setUploads((u) => [
      ...files.map((f) => ({ id: `${f.name}-${f.size}-${f.lastModified}`, name: f.name, size: f.size, progress: 0 })),
      ...u,
    ]);
  };

  // Simulated upload progress — replace with your real upload callback.
  useEffect(() => {
    if (!uploads.some((u) => u.progress < 100)) return;
    const t = setInterval(
      () => setUploads((all) => all.map((u) => ({ ...u, progress: Math.min(100, u.progress + 4 + Math.random() * 10) }))),
      120,
    );
    return () => clearInterval(t);
  }, [uploads]);

  return (
    <div data-slot="file-dropzone" className={cn("flex w-full flex-col gap-3", className)}>
      <motion.button
        type="button"
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          add(Array.from(e.dataTransfer.files));
        }}
        animate={{ scale: over ? 1.02 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={cn(
          "flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-9 text-center outline-none transition-colors focus-visible:border-blue-500/60",
          over ? "border-blue-500/60 bg-blue-500/5" : "border-base-50/10 bg-base-900/40 hover:border-base-50/20",
          zoneClassName,
        )}
      >
        <motion.span
          animate={{ y: over ? -4 : 0 }}
          className={`grid size-11 place-items-center rounded-xl ring-1 transition-colors ${
            over ? "bg-blue-500/15 text-blue-600 dark:text-blue-300 ring-blue-500/30" : "bg-base-800 text-base-400 ring-base-50/5 inset-shadow-2xs inset-shadow-white/10"
          }`}
        >
          <UploadCloud className="size-5" />
        </motion.span>
        <span>
          <span className="block text-sm text-base-200">{over ? "Release to upload" : title}</span>
          <span className="block text-xs text-base-500">{hint}</span>
        </span>
      </motion.button>
      <input
        ref={input}
        type="file"
        multiple
        accept={accept}
        hidden
        onChange={(e) => {
          add(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />

      <ul className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {uploads.map((u) => {
            const done = u.progress >= 100;
            const Icon = /\.(png|jpe?g|gif|webp|svg)$/i.test(u.name) ? ImageIcon : FileText;
            return (
              <motion.li
                key={u.id}
                layout
                initial={{ opacity: 0, y: -6, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="flex items-center gap-3 rounded-xl bg-base-900/60 px-3 py-2.5 ring-1 ring-base-50/5"
              >
                <Icon className="size-4 shrink-0 text-base-500" />
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-2 text-xs">
                    <span className="truncate text-base-200">{u.name}</span>
                    <span className="shrink-0 text-base-500 tabular-nums">
                      {done ? formatSize(u.size) : `${Math.floor(u.progress)}%`}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-base-800">
                    <motion.div
                      className={`h-full rounded-full ${done ? "bg-emerald-400" : "bg-base-200"}`}
                      animate={{ width: `${u.progress}%` }}
                      transition={{ ease: "easeOut" }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => setUploads((all) => all.filter((x) => x.id !== u.id))}
                  aria-label={`Remove ${u.name}`}
                  className="grid size-6 place-items-center rounded-md text-base-500 hover:bg-base-50/5 hover:text-base-200"
                >
                  {done ? <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" /> : <X className="size-3.5" />}
                </button>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}

export default function Demo() {
  return (
    <div className="w-full max-w-sm">
      <FileDropzone />
    </div>
  );
}
