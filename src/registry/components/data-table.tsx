"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Row = { id: string; customer: string; email: string; status: "Paid" | "Pending" | "Refunded"; amount: number };
type SortKey = "customer" | "status" | "amount";

const status = {
  Paid: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 ring-emerald-500/20",
  Pending: "bg-amber-500/10 text-amber-600 dark:text-amber-300 ring-amber-500/20",
  Refunded: "bg-base-800 text-base-400 ring-base-50/10",
};

function Check({ checked, onChange, label }: { checked: boolean | "mixed"; onChange: () => void; label: string }) {
  return (
    <button
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`grid size-4 place-items-center rounded-[5px] ring-1 transition-colors ${
        checked ? "bg-blue-500 ring-blue-500 inset-shadow-2xs inset-shadow-white/30" : "bg-base-950 ring-base-50/15 hover:ring-base-50/30"
      }`}
    >
      {checked === "mixed" ? (
        <span className="h-0.5 w-2 rounded-full bg-white" />
      ) : (
        checked && (
          <svg viewBox="0 0 16 16" className="size-3 text-white">
            <path d="M3.5 8.5 6.5 11.5 12.5 4.5" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )
      )}
    </button>
  );
}

export function DataTable({ rows, className, rowClassName }: { rows: Row[]; className?: string; rowClassName?: string }) {
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "amount", dir: -1 });
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const sorted = useMemo(
    () => [...rows].sort((a, b) => (a[sort.key] > b[sort.key] ? 1 : a[sort.key] < b[sort.key] ? -1 : 0) * sort.dir),
    [rows, sort],
  );

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const all = selected.size === rows.length ? true : selected.size ? "mixed" : false;

  const header = (k: SortKey, label: string, className = "") => (
    <button
      onClick={() => setSort((s) => ({ key: k, dir: s.key === k ? (s.dir === 1 ? -1 : 1) : 1 }))}
      className={`flex items-center gap-1 transition-colors hover:text-base-200 ${sort.key === k ? "text-base-200" : ""} ${className}`}
    >
      {label}
      {sort.key !== k ? (
        <ChevronsUpDown className="size-3 opacity-50" />
      ) : sort.dir === 1 ? (
        <ArrowUp className="size-3" />
      ) : (
        <ArrowDown className="size-3" />
      )}
    </button>
  );

  const grid = "grid grid-cols-[1.5rem_1fr_6rem_5.5rem] items-center gap-3 px-4";

  return (
    <div role="table" data-slot="data-table" className={cn("w-full overflow-hidden rounded-2xl bg-base-950 ring-1 ring-base-50/10 inset-shadow-2xs inset-shadow-white/5", className)}>
      <div role="row" className={`${grid} h-10 border-b border-base-50/5 bg-base-900/50 text-xs text-base-500`}>
        <Check checked={all} label="Select all" onChange={() => setSelected(all === true ? new Set() : new Set(rows.map((r) => r.id)))} />
        {header("customer", "Customer")}
        {header("status", "Status")}
        {header("amount", "Amount", "justify-self-end")}
      </div>
      {sorted.map((r) => (
        <motion.div
          key={r.id}
          layout
          transition={{ type: "spring", bounce: 0.1, duration: 0.45 }}
          role="row"
          className={cn(
            grid,
            "h-14 border-b border-base-50/5 text-sm transition-colors last:border-0",
            selected.has(r.id) ? "bg-blue-500/5" : "hover:bg-base-50/[0.02]",
            rowClassName,
          )}
        >
          <Check checked={selected.has(r.id)} label={`Select ${r.customer}`} onChange={() => toggle(r.id)} />
          <div className="min-w-0">
            <p className="truncate text-base-100">{r.customer}</p>
            <p className="truncate text-xs text-base-500">{r.email}</p>
          </div>
          <span className={`w-fit rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${status[r.status]}`}>{r.status}</span>
          <span className="justify-self-end text-base-200 tabular-nums">${r.amount.toLocaleString("en-US")}</span>
        </motion.div>
      ))}
    </div>
  );
}

const rows: Row[] = [
  { id: "1", customer: "Linear", email: "billing@linear.app", status: "Paid", amount: 4200 },
  { id: "2", customer: "Raycast", email: "finance@raycast.com", status: "Pending", amount: 1280 },
  { id: "3", customer: "Vercel", email: "ap@vercel.com", status: "Paid", amount: 9650 },
  { id: "4", customer: "Arc", email: "hello@arc.net", status: "Refunded", amount: 640 },
  { id: "5", customer: "Figma", email: "pay@figma.com", status: "Paid", amount: 2310 },
];

export default function Demo() {
  return (
    <div className="w-full max-w-lg">
      <DataTable rows={rows} />
    </div>
  );
}
