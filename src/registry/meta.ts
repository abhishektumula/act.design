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
  { slug: "dial", name: "Dial", category: "Controls", description: "A rotary knob with a lit scale, knurled rim and real detents. Drag, scroll or use the arrow keys; Shift for fine control, double-click to reset.", deps: [M, V] },
  { slug: "fader", name: "Fader", category: "Controls", description: "A slider drawn as a ruler. Ticks swell around the thumb like a magnifier and pulling past either end stretches it on an elastic.", deps: [M] },
  { slug: "switch", name: "Switch", category: "Controls", description: "A toggle whose thumb and fill move together on one eased transition. Tap it, or drag the thumb across.", deps: [M, L, V] },
  { slug: "segmented-control", name: "Segmented Control", category: "Controls", description: "A raised cap that glides between options and sinks a touch under your finger. Full arrow-key support.", deps: [M, L, V] },
  { slug: "stepper", name: "Stepper", category: "Controls", description: "A number field whose digits roll in the direction you count. Hold to repeat with acceleration; hit a limit and it shakes its head.", deps: [M, L] },
  { slug: "code-input", name: "Code Input", category: "Controls", description: "A one-time-code field. Digits rise into their slots behind a blinking caret, paste and SMS autofill fill it in one go, and on the last digit it checks: a ripple while it waits, a pop when it passes, a shake and clear when it doesn't.", deps: [M, L] },
  { slug: "compare-slider", name: "Compare Slider", category: "Controls", description: "Two views of one thing split by a divider you drag: before and after, light and dark, old and new. It takes anything, an image or a live component. The divider bends with the speed you move it, the views smear with motion blur as they go, and when you let go they glitch for a beat: bands tear sideways and the colour splits before it snaps clean. Click anywhere to glide it there, or use the arrow keys.", deps: [M, L], isNew: true },

  // Actions
  { slug: "button", name: "Button", category: "Actions", description: "A quiet button with four tones and a minimal shadow. Bind a hotkey and the key is printed inside it, and pressing it on the keyboard clicks the button.", deps: [M, L, V] },
  { slug: "hold-to-confirm", name: "Hold to Confirm", category: "Actions", description: "For actions that deserve intent. A fill sweeps across and inverts the label; let go early and it springs back with a shake.", deps: [M, L, V] },
  { slug: "toast", name: "Toast", category: "Actions", description: "Notifications typed like a sheet in a typewriter. Each one rolls out of a slot at the screen's edge while its words type in behind a caret that returns to the start of each line, and pushes the older ones into a pile; hover and it fans out and every timer stops. Tear one off sideways to dismiss it. Promise tickets retype themselves from loading to done.", deps: [M, L], isNew: true },
  { slug: "trash-bin", name: "Trash Bin", category: "Actions", description: "Delete by hand. Hold a file and the sheet crumples into a ball under your finger; drag it over the bin and the rim lifts to meet it, let go and it drops in with a wobble. Miss and it rolls home and smooths back out. Delete on the keyboard throws it in an arc.", deps: [M], isNew: true },

  // Motion
  { slug: "card-stack", name: "Card Stack", category: "Motion", description: "A deck you deal by hand. Fling the top card and it tucks itself under the pile while the rest rise to meet you.", deps: [M, L] },
  { slug: "number-ticker", name: "Number Ticker", category: "Motion", description: "Digits that roll like an odometer whenever the value changes.", deps: [M, L] },
  { slug: "text-stagger", name: "Text Stagger", category: "Motion", description: "Headlines that rise word by word, and body copy that streams in token by token. Words never split, so it wraps cleanly at any width.", deps: [M, L] },
  { slug: "folder-card", name: "Folder Card", category: "Motion", description: "A folder you can peek into. Hover or focus it and the front flap tips open while the papers inside slide up and fan out. Tap toggles it on touch screens.", deps: [M] },
  { slug: "prune-reveal-animation", name: "Prune Reveal Animation", category: "AI", description: "An AI image that arrives by being pruned into view. While the model works the frame pulses with the prompt; when the image is ready the surface is touched at a random spot and burns away from there along a path of its own, never the same twice, with a soft glowing edge, the picture heating orange ahead of it and embers and ash rising off it. Regenerate and the pulse fades back in over the old image.", deps: [M], isNew: true },

  // AI
  { slug: "orb", name: "Orb", category: "AI", description: "A fluid orb drawn by a small WebGL shader: colour folds through itself like ink in water. Idle, listening, thinking and speaking each flow differently and melt into one another. Liquid and halo variants, and it reacts to real microphone input.", deps: [M, L] },
  { slug: "prompt-input", name: "Prompt Input", category: "AI", description: "An agent composer with model, effort and access pickers, attachments, auto-growing textarea and a send button that morphs into stop.", deps: [M, L] },

  // Navigation
  { slug: "command-palette", name: "Command Palette", category: "Navigation", description: "A keyboard-first command menu with fuzzy filtering, groups and shortcuts.", deps: [M, L] },
  { slug: "infinite-grid", name: "Infinite Grid", category: "Navigation", description: "A canvas that goes on forever in every direction. Drag it and it carries on with momentum, scroll it with a trackpad or step it with the arrow keys. Only the cells on screen are rendered, staggered like bricks so the same item rarely sits beside itself.", deps: [M], isNew: true },
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

export const blockCategories = ["Hero", "How it works", "Features", "Pricing", "Social proof", "Status", "Conversion"] as const;

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
  { slug: "hero-monitor", name: "Monitoring Hero", category: "Hero", description: "A hero for an uptime-monitoring product whose visual is the product: an endpoint's last hour of checks in a window that runs off the page. Move the alert threshold or the confirmations and it tells you how often you'd have been paged, while a notification on the window's edge shows who the last page reached.", deps: [M, L], uses: ["button", "fader", "stepper", "switch"], isNew: true },
  { slug: "incident-flow", name: "Incident Flow", category: "How it works", description: "How it works, told as one incident. The steps advance on their own when the block scrolls into view while the incident card changes in place: regions fail, the clock rolls, the on-call phone rings, it recovers. Click a step to jump to it, or replay.", deps: [M, L], uses: ["button", "stepper"], isNew: true },
  { slug: "feature-rack", name: "Feature List", category: "Features", description: "Five features as a ruled bento grid: an incident timeline leads, beside a single number, a check-frequency control whose daily count rolls, the certificate itself and alert switches.", deps: [M], uses: ["segmented-control", "switch", "number-ticker"], isNew: true },
  { slug: "gauges", name: "Gauges", category: "Features", description: "Proof points as instruments: the headline number on a large analog gauge, the supporting three on straight meters. On scroll the needles swing past their reading and settle while the numbers roll in.", deps: [M], uses: ["number-ticker"], isNew: true },
  { slug: "pricing-meter", name: "Usage Pricing", category: "Pricing", description: "Usage pricing as controls: monitors, check frequency and seats. Plan lights follow along, and a receipt shows each line of the quote rolling to its new amount above the total.", deps: [M, L], uses: ["fader", "segmented-control", "stepper", "button"], isNew: true },
  { slug: "testimonials-deck", name: "Testimonial Deck", category: "Social proof", description: "Customer quotes dealt as a deck you can fling. Each card leads with its outcome in large type, beside a review score and customer names.", deps: [M, L], uses: ["card-stack"], isNew: true },
  { slug: "status-page", name: "Status Page", category: "Status", description: "A public status page: the headline state, every component's daily uptime as bars you can hover for what happened that day, a 30 or 90 day range, a subscribe form and the latest incident written up update by update.", deps: [M, L], uses: ["button", "segmented-control"], isNew: true },
  { slug: "cta-check", name: "Site Check CTA", category: "Conversion", description: "A closing call to action people actually use: type a domain, get an instant check from four regions with certificate expiry, then start monitoring it. It opens on an example result, so it never sits empty.", deps: [M, L], uses: ["button"], isNew: true },
];

export function getBlock(slug: string) {
  return blocks.find((b) => b.slug === slug);
}

export function getBlockNeighbours(slug: string) {
  const index = blocks.findIndex((b) => b.slug === slug);
  return { prev: blocks[index - 1], next: blocks[index + 1] };
}
