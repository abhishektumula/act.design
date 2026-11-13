export const categories = ["Controls", "Actions", "Motion", "AI", "Navigation"] as const;

export type Category = (typeof categories)[number];

export type RegistryItem = {
  slug: string;
  name: string;
  category: Category;
  description: string;
  deps: string[];
  isNew?: boolean;
};

const M = "motion";
const L = "lucide-react";
const V = "class-variance-authority";

export const registry: RegistryItem[] = [
  // Controls
  { slug: "dial", name: "Dial", category: "Controls", description: "A rotary knob with a lit scale, knurled rim and real detents. Drag, scroll or use the arrow keys; Shift for fine control, double-click to reset.", deps: [M, V], isNew: true },
  { slug: "fader", name: "Fader", category: "Controls", description: "A slider drawn as a ruler. Ticks swell around the thumb like a magnifier and pulling past either end stretches it on an elastic.", deps: [M], isNew: true },
  { slug: "switch", name: "Switch", category: "Controls", description: "A toggle whose thumb and fill move together on one eased transition. Tap it, or drag the thumb across.", deps: [M, L, V], isNew: true },
  { slug: "segmented-control", name: "Segmented Control", category: "Controls", description: "A raised cap that glides between options and sinks a touch under your finger. Full arrow-key support.", deps: [M, L, V], isNew: true },
  { slug: "stepper", name: "Stepper", category: "Controls", description: "A number field whose digits roll in the direction you count. Hold to repeat with acceleration; hit a limit and it shakes its head.", deps: [M, L], isNew: true },

  // Actions
  { slug: "button", name: "Button", category: "Actions", description: "A quiet button with four tones and a minimal shadow. Bind a hotkey and the key is printed inside it, and pressing it on the keyboard clicks the button.", deps: [M, L, V] },
  { slug: "hold-to-confirm", name: "Hold to Confirm", category: "Actions", description: "For actions that deserve intent. A fill sweeps across and inverts the label; let go early and it springs back with a shake.", deps: [M, L, V] },

  // Motion
  { slug: "card-stack", name: "Card Stack", category: "Motion", description: "A deck you deal by hand. Fling the top card and it tucks itself under the pile while the rest rise to meet you.", deps: [M, L], isNew: true },
  { slug: "number-ticker", name: "Number Ticker", category: "Motion", description: "Digits that roll like an odometer whenever the value changes.", deps: [M, L] },
  { slug: "text-stagger", name: "Text Stagger", category: "Motion", description: "Headlines that rise word by word, and body copy that streams in token by token. Words never split, so it wraps cleanly at any width.", deps: [M, L] },
  { slug: "folder-card", name: "Folder Card", category: "Motion", description: "A folder you can peek into. Hover or focus it and the front flap tips open while the papers inside slide up and fan out. Tap toggles it on touch screens.", deps: [M], isNew: true },

  // AI
  { slug: "orb", name: "Orb", category: "AI", description: "A fluid orb drawn by a small WebGL shader: colour folds through itself like ink in water. Idle, listening, thinking and speaking each flow differently and melt into one another. Liquid and halo variants, and it reacts to real microphone input.", deps: [M, L], isNew: true },
  { slug: "prompt-input", name: "Prompt Input", category: "AI", description: "An agent composer with model, effort and access pickers, attachments, auto-growing textarea and a send button that morphs into stop.", deps: [M, L] },

  // Navigation
  { slug: "command-palette", name: "Command Palette", category: "Navigation", description: "A keyboard-first command menu with fuzzy filtering, groups and shortcuts.", deps: [M, L] },
];

export function getItem(slug: string) {
  return registry.find((item) => item.slug === slug);
}

export function getNeighbours(slug: string) {
  const index = registry.findIndex((item) => item.slug === slug);
  return {
    prev: index > 0 ? registry[index - 1] : undefined,
    next: index < registry.length - 1 ? registry[index + 1] : undefined,
  };
}

/** Packages every component and block needs on top of React. */
export const baseDeps = ["clsx", "tailwind-merge"];

export function installCommand(deps: string[], code?: string) {
  const all = [...new Set([...deps, ...baseDeps, ...(code?.includes("class-variance-authority") ? ["class-variance-authority"] : [])])];
  return `npm i ${all.join(" ")}`;
}

/* ---------------------------------- blocks --------------------------------- */

export const blockCategories = ["Hero", "Features", "Pricing", "Social proof", "Conversion"] as const;

export type BlockCategory = (typeof blockCategories)[number];

export type BlockItem = {
  slug: string;
  name: string;
  category: BlockCategory;
  description: string;
  deps: string[];
  /** Registry components this block imports from `@/components/ui`. */
  uses: string[];
  isNew?: boolean;
};

export const blocks: BlockItem[] = [
  { slug: "hero-monitor", name: "Monitoring Hero", category: "Hero", description: "A hero for an uptime-monitoring product whose visual is the product: an endpoint's last hour of checks. Move the alert threshold or the confirmations and it tells you how often you'd have been paged.", deps: [M, L], uses: ["button", "fader", "stepper", "switch"], isNew: true },
  { slug: "feature-rack", name: "Feature List", category: "Features", description: "Five features, each with a live readout instead of a stock icon: region latencies, a check-frequency control, an incident timeline, alert switches and a certificate countdown.", deps: [M], uses: ["segmented-control", "switch"], isNew: true },
  { slug: "gauges", name: "Gauges", category: "Features", description: "Proof points as analog meters. On scroll each needle swings up, overshoots and settles while the number rolls in.", deps: [M], uses: ["number-ticker"], isNew: true },
  { slug: "pricing-meter", name: "Usage Pricing", category: "Pricing", description: "Usage pricing as controls: monitors, check frequency and seats. Plan lights follow along and the total rolls to its new number.", deps: [M, L], uses: ["fader", "segmented-control", "stepper", "button"], isNew: true },
  { slug: "testimonials-deck", name: "Testimonial Deck", category: "Social proof", description: "Customer quotes with concrete outcomes, dealt as a deck you can fling, beside a review score and customer names.", deps: [M, L], uses: ["card-stack"], isNew: true },
  { slug: "cta-check", name: "Site Check CTA", category: "Conversion", description: "A closing call to action people actually use: type a domain, get an instant check from four regions with certificate expiry, then start monitoring it.", deps: [M, L], uses: ["button"], isNew: true },
];

export function getBlock(slug: string) {
  return blocks.find((b) => b.slug === slug);
}

export function getBlockNeighbours(slug: string) {
  const index = blocks.findIndex((b) => b.slug === slug);
  return { prev: blocks[index - 1], next: blocks[index + 1] };
}
