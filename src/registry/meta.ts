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
  { slug: "switch", name: "Switch", category: "Controls", description: "A toggle with travel. The thumb stretches toward where it is going while pressed, then lands with a little bounce.", deps: [M, L, V], isNew: true },
  { slug: "segmented-control", name: "Segmented Control", category: "Controls", description: "A raised cap that glides between options and sinks a touch under your finger. Full arrow-key support.", deps: [M, L, V], isNew: true },
  { slug: "stepper", name: "Stepper", category: "Controls", description: "A number field whose digits roll in the direction you count. Hold to repeat with acceleration; hit a limit and it shakes its head.", deps: [M, L], isNew: true },

  // Actions
  { slug: "keycap", name: "Keycap", category: "Actions", description: "A button built like a physical key. The face sinks into its wall on press, and bound hotkeys press it from the keyboard.", deps: [M, L, V], isNew: true },
  { slug: "hold-to-confirm", name: "Hold to Confirm", category: "Actions", description: "For actions that deserve intent. A fill sweeps across and inverts the label; let go early and it springs back with a shake.", deps: [M, L, V] },

  // Motion
  { slug: "card-stack", name: "Card Stack", category: "Motion", description: "A deck you deal by hand. Fling the top card and it tucks itself under the pile while the rest rise to meet you.", deps: [M, L], isNew: true },
  { slug: "number-ticker", name: "Number Ticker", category: "Motion", description: "Digits that roll like an odometer whenever the value changes.", deps: [M, L] },
  { slug: "text-stagger", name: "Text Stagger", category: "Motion", description: "Words or characters that fade, blur and rise into place. Perfect for streamed model output and hero headlines.", deps: [M, L] },
  { slug: "spotlight-card", name: "Spotlight Card", category: "Motion", description: "A card lit by a soft spotlight that follows the cursor across border and surface.", deps: [L] },

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
  { slug: "hero-instrument", name: "Instrument Hero", category: "Hero", description: "A product hero whose visual is a working console. Turn the dial, slide the fader or flip the switch and the screen rewrites its copy on the spot.", deps: [M, L], uses: ["dial", "fader", "switch", "keycap"], isNew: true },
  { slug: "feature-rack", name: "Feature Rack", category: "Features", description: "Features as rack-mounted 1U modules: screws, a status LED and a live readout each, from a level meter to working role switches.", deps: [M], uses: ["switch", "stepper"], isNew: true },
  { slug: "gauges", name: "Gauges", category: "Features", description: "Proof points as analog meters. On scroll each needle swings up, overshoots and wobbles to rest while the readout rolls in.", deps: [M], uses: ["number-ticker"], isNew: true },
  { slug: "pricing-meter", name: "Metered Pricing", category: "Pricing", description: "Usage pricing as a control panel. A fader for traffic and a stepper for seats; tier lights follow and the total rolls to its new number.", deps: [M, L], uses: ["fader", "stepper", "segmented-control", "keycap"], isNew: true },
  { slug: "testimonials-deck", name: "Testimonial Deck", category: "Social proof", description: "Quotes dealt as a deck of paper, signal and ink cards you can fling, beside a rating and a grid of customer wordmarks.", deps: [M, L], uses: ["card-stack"], isNew: true },
  { slug: "waitlist-keys", name: "Keycap Waitlist", category: "Conversion", description: "A row of keys that types itself, an email well with a real keycap to submit, and a place in line that rolls into view.", deps: [M, L], uses: ["keycap", "stepper"], isNew: true },
];

export function getBlock(slug: string) {
  return blocks.find((b) => b.slug === slug);
}

export function getBlockNeighbours(slug: string) {
  const index = blocks.findIndex((b) => b.slug === slug);
  return { prev: blocks[index - 1], next: blocks[index + 1] };
}
