"use client";

import { Switch } from "@/components/ui/switch";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { accents, setAccent, useAccent, type Accent } from "./accent";
import { setTheme, useTheme } from "./theme-toggle";

/** Site preferences, made from the instruments themselves. */
export function Preferences() {
  const { dark } = useTheme();
  const accent = useAccent();

  return (
    <div className="divide-y divide-base-50/[0.07]">
      <div className="flex items-center justify-between gap-6 py-5">
        <div>
          <p id="pref-dark" className="text-sm font-medium text-base-100">
            Night mode
          </p>
          <p className="text-[13px] text-base-500">Graphite instead of paper.</p>
        </div>
        <Switch checked={dark} onCheckedChange={(v) => setTheme(v ? "dark" : "light")} aria-labelledby="pref-dark" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 py-5">
        <div>
          <p className="text-sm font-medium text-base-100">Accent</p>
          <p className="text-[13px] text-base-500">Used across the whole site.</p>
        </div>
        <SegmentedControl<Accent>
          aria-label="Accent"
          size="sm"
          value={accent}
          onValueChange={setAccent}
          options={(Object.keys(accents) as Accent[]).map((a) => ({
            value: a,
            label: <span className="capitalize max-sm:sr-only">{a}</span>,
            icon: <span className="block size-2 rounded-full" style={{ background: accents[a] }} />,
          }))}
        />
      </div>
    </div>
  );
}
