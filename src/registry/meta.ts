export const categories = [
  "AI",
  "Cards",
  "Actions",
  "Inputs",
  "Navigation",
  "Overlays",
  "Data Display",
] as const;

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

export const registry: RegistryItem[] = [
  // AI
  { slug: "ai-orb", name: "AI Orb", category: "AI", description: "A living voice orb for agent conversations. Breathes when idle, swirls while thinking and reacts to real microphone input.", deps: [M, L], isNew: true },
  { slug: "prompt-input", name: "Prompt Input", category: "AI", description: "An agent composer with model, effort and access pickers, attachments, auto-growing textarea and a send button that morphs into stop.", deps: [M, L], isNew: true },
  { slug: "text-stagger", name: "Text Stagger", category: "AI", description: "Words or characters that fade, blur and rise into place. Perfect for streamed model output and hero headlines.", deps: [M], isNew: true },
  { slug: "thinking-indicator", name: "Thinking Indicator", category: "AI", description: "Shimmering status text that cycles through what the agent is doing right now.", deps: [M, L], isNew: true },
  { slug: "reasoning", name: "Reasoning", category: "AI", description: "A collapsible chain-of-thought block that streams while thinking and folds itself away when done.", deps: [M, L], isNew: true },
  { slug: "agent-plan", name: "Agent Plan", category: "AI", description: "A live task list for agents. Steps spin, resolve and check themselves off in sequence.", deps: [M, L], isNew: true },
  { slug: "chat-thread", name: "Chat Thread", category: "AI", description: "A conversation with user bubbles, tool calls and token-streamed assistant replies.", deps: [M, L], isNew: true },
  { slug: "voice-waveform", name: "Voice Recorder", category: "AI", description: "A compact recording pill with a live scrolling waveform, timer and send action.", deps: [M, L], isNew: true },

  // Cards
  { slug: "light-card", name: "Light Card", category: "Cards", description: "A card lit from one point below the edge. The source drifts after your cursor and fine beams sweep the surface, but never over the copy.", deps: [M, L], isNew: true },
  { slug: "signal-card", name: "Signal Card", category: "Cards", description: "A metric card whose background is the chart. Scrub across 48 hours of bars to read any point; let go and the number rolls back to the total.", deps: [M, L], isNew: true },
  { slug: "world-card", name: "World Card", category: "Cards", description: "A city painted for its live local time: dawn, day, dusk or night, with sun and moon on an arc. Drag the sky to scrub through the day.", deps: [M, L], isNew: true },
  { slug: "glyph-card", name: "Glyph Card", category: "Cards", description: "A recessed screen of ASCII interference waves. Your cursor leaves a wake, clicks drop stones and the title decodes on hover.", deps: [M], isNew: true },

  // Actions
  { slug: "shimmer-button", name: "Shimmer Button", category: "Actions", description: "A rotating light traces the border while a sheen sweeps across on hover.", deps: [M, L] },
  { slug: "magnetic-button", name: "Magnetic Button", category: "Actions", description: "A button that leans toward the cursor with spring physics and parallax label.", deps: [M, L] },
  { slug: "hold-to-confirm", name: "Hold to Confirm", category: "Actions", description: "Destructive actions that need intent. Press and hold to fill, release to cancel.", deps: [M, L] },

  // Inputs
  { slug: "otp-input", name: "OTP Input", category: "Inputs", description: "One-time code entry with a blinking caret, paste support and success / error states.", deps: [M] },
  { slug: "radio-cards", name: "Radio Cards", category: "Inputs", description: "Selectable cards with a ring that glides between options.", deps: [M, L] },
  { slug: "file-dropzone", name: "File Dropzone", category: "Inputs", description: "Drag and drop uploads with a breathing drop target and per-file progress.", deps: [M, L] },

  // Navigation
  { slug: "tabs", name: "Tabs", category: "Navigation", description: "Tabs with a hover highlight that follows the cursor and a gliding underline.", deps: [M] },
  { slug: "dock", name: "Dock", category: "Navigation", description: "A macOS-style dock with smooth magnification and labels.", deps: [M, L] },
  { slug: "command-palette", name: "Command Palette", category: "Navigation", description: "A keyboard-first command menu with fuzzy filtering, groups and shortcuts.", deps: [M, L] },

  // Overlays
  { slug: "dialog", name: "Dialog", category: "Overlays", description: "A focused modal with blurred backdrop, spring entrance and type-to-confirm.", deps: [M, L] },
  { slug: "drawer", name: "Drawer", category: "Overlays", description: "A bottom sheet you can fling closed, with drag handle and velocity-aware dismissal.", deps: [M, L] },
  { slug: "tooltip", name: "Tooltip", category: "Overlays", description: "Tooltips that slide between neighbours instead of blinking in and out.", deps: [M, L] },
  { slug: "toast", name: "Toast", category: "Overlays", description: "Stacked notifications that fan out on hover, with promise and action variants.", deps: [M, L] },

  // Data display
  { slug: "spotlight-card", name: "Spotlight Card", category: "Data Display", description: "A card lit by a soft spotlight that follows the cursor across border and surface.", deps: [L] },
  { slug: "tilt-card", name: "Tilt Card", category: "Data Display", description: "A 3D membership card that tilts with the pointer and catches a moving glare.", deps: [M] },
  { slug: "number-ticker", name: "Number Ticker", category: "Data Display", description: "Digits that roll like an odometer whenever the value changes.", deps: [M] },
  { slug: "data-table", name: "Data Table", category: "Data Display", description: "A sortable, selectable table whose rows animate into their new order.", deps: [M, L] },

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

export const blockCategories = ["Hero", "Features", "Social proof", "Pricing", "Conversion", "Navigation"] as const;

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
  { slug: "hero-ai", name: "AI Hero", category: "Hero", description: "A centred agent hero with a breathing orb, staggered headline, a full prompt composer and suggestion chips.", deps: [M, L], uses: ["ai-orb", "prompt-input", "text-stagger"], isNew: true },
  { slug: "hero-split", name: "Split Hero", category: "Hero", description: "Copy on the left, a layered dashboard mockup on the right with growing bars and a floating notification.", deps: [M, L], uses: [] },
  { slug: "hero-centered", name: "Developer Hero", category: "Hero", description: "A big centred headline over a fading grid, a copyable install command and a live deploy terminal that unfolds into view.", deps: [M, L], uses: ["text-stagger"], isNew: true },
  { slug: "bento-grid", name: "Bento Grid", category: "Features", description: "Five spotlight cells, each with a living visual: an edge map, multiplayer cursors, an alert stack, an integration orbit and uptime bars.", deps: [M, L], uses: ["spotlight-card"], isNew: true },
  { slug: "features-tabs", name: "Feature Tabs", category: "Features", description: "Auto-advancing feature list with a progress hairline. Each tab swaps an animated visual on the right; hover pauses it.", deps: [M, L], uses: [] },
  { slug: "stats", name: "Stats", category: "Features", description: "A single framed row of odometer numbers that roll up as the section scrolls into view.", deps: [M], uses: ["number-ticker"] },
  { slug: "logo-cloud", name: "Logo Cloud", category: "Social proof", description: "Two counter-scrolling rows of wordmarks with soft edges. Logos light up on hover.", deps: [M, L], uses: [] },
  { slug: "testimonials", name: "Testimonials", category: "Social proof", description: "A masonry wall of quotes with one featured card, staggered reveal and gentle hover lift.", deps: [M, L], uses: [] },
  { slug: "pricing", name: "Pricing", category: "Pricing", description: "Three tiers with a gliding monthly / yearly toggle, odometer prices and a raised featured plan.", deps: [M, L], uses: ["number-ticker"] },
  { slug: "faq", name: "FAQ", category: "Pricing", description: "Two-column questions with spring-height answers and a plus that rotates into a close.", deps: [M, L], uses: [] },
  { slug: "cta", name: "Call to Action", category: "Conversion", description: "A dark lit card with an email capture whose button morphs through loading into success.", deps: [M, L], uses: [] },
  { slug: "waitlist", name: "Waitlist", category: "Conversion", description: "Concentric rings, a pill email form that resolves into a confirmation and a live waiting count.", deps: [M, L], uses: ["number-ticker"], isNew: true },
  { slug: "navbar", name: "Floating Navbar", category: "Navigation", description: "A floating glass header with a hover pill that glides between links and an animated mobile menu.", deps: [M, L], uses: [] },
  { slug: "footer", name: "Footer", category: "Navigation", description: "Link columns, a one-field newsletter, a live status dot and an oversized wordmark clipped by the edge.", deps: [M, L], uses: [] },
];

export function getBlock(slug: string) {
  return blocks.find((b) => b.slug === slug);
}

export function getBlockNeighbours(slug: string) {
  const index = blocks.findIndex((b) => b.slug === slug);
  return { prev: blocks[index - 1], next: blocks[index + 1] };
}
