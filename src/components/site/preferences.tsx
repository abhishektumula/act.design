"use client";

import { Switch } from "./kit/switch";
import { setTheme, useTheme } from "./theme-toggle";

/** Site preferences, made from the components themselves. */
export function Preferences() {
  const { dark } = useTheme();

  return (
    <div className="divide-y divide-neutral-950/[0.07] dark:divide-neutral-50/[0.07]">
      <div className="flex items-center justify-between gap-6 py-5">
        <div>
          <p id="pref-dark" className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            Night mode
          </p>
          <p className="text-[13px] text-neutral-500">Graphite instead of paper.</p>
        </div>
        <Switch checked={dark} onCheckedChange={(v) => setTheme(v ? "dark" : "light")} aria-labelledby="pref-dark" />
      </div>
    </div>
  );
}
