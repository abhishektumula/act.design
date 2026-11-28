export const categories = ["Controls", "Actions", "Text", "Motion", "AI"] as const;

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
  { slug: "dial", name: "Dial", category: "Controls", description: "A rotary knob with a lit scale, knurled rim and real detents. Drag, scroll or use the arrow keys; Shift for fine control, double-click to reset. A level tone runs the scale blue to green to red like a volume meter, and past the danger point the glow pulses red.", deps: [M, V] },
  { slug: "dial-gallery", name: "Dial Gallery", category: "Controls", description: "A wheel of names beside a picture, with no dial drawn: just the names, set on a gentle curve like a drum seen edge on. The chosen one points at the image in [ brackets ] while three or four a side fade and blur as they turn away. Scroll, drag, use the arrow keys or click a name. Every turn pops the frame and the new image opens over the old one, as an iris from the names, a wipe in the direction you turned, or a soft fade. Image side, spacing, curve, depth, brackets and their colour are yours to set.", deps: [M], isNew: true },
  { slug: "value-bar", name: "Value Bar", category: "Controls", description: "A value as a bar you drag, the way settings panels want it: label and readout inside, a fill that follows the thumb on a spring and fine ticks along the way. Pull past either end and the bar stretches before it lets go; double-click puts it back. Name stretches of the range and the name under it changes as you go.", deps: [M], isNew: true },
  { slug: "fader", name: "Fader", category: "Controls", description: "A slider drawn as a ruler. Ticks swell around the thumb like a magnifier and pulling past either end stretches it on an elastic.", deps: [M] },
  { slug: "segmented-control", name: "Segmented Control", category: "Controls", description: "A raised cap that glides between options and sinks a touch under your finger. Full arrow-key support.", deps: [M, L, V] },
  { slug: "stepper", name: "Stepper", category: "Controls", description: "A number field whose digits roll in the direction you count. Hold to repeat with acceleration; hit a limit and it shakes its head.", deps: [M, L] },
  { slug: "code-input", name: "Code Input", category: "Controls", description: "A one-time-code field. Digits rise into their slots behind a blinking caret, paste and SMS autofill fill it in one go, and on the last digit it checks: a ripple while it waits, a pop when it passes, a shake and clear when it doesn't.", deps: [M, L] },
  { slug: "compare-slider", name: "Compare Slider", category: "Controls", description: "Two views of one thing split by a divider you drag: before and after, light and dark, old and new. It takes anything, an image or a live component. The divider bends with the speed you move it, the views smear with motion blur as they go, and when you let go they glitch for a beat: bands tear sideways and the colour splits before it snaps clean. Click anywhere to glide it there, or use the arrow keys.", deps: [M, L], isNew: true },

  // Actions
  { slug: "button", name: "Button", category: "Actions", description: "A quiet button with four tones and a minimal shadow. Bind a hotkey and the key is printed inside it, and pressing it on the keyboard clicks the button.", deps: [M, L, V] },
  { slug: "hold-to-confirm", name: "Hold to Confirm", category: "Actions", description: "For actions that deserve intent. A fill sweeps across and inverts the label; let go early and it springs back with a shake.", deps: [M, L, V] },
  { slug: "command-palette", name: "Command Palette", category: "Actions", description: "A keyboard-first command menu with fuzzy filtering, groups and shortcuts.", deps: [M, L] },
  { slug: "trash-bin", name: "Trash Bin", category: "Actions", description: "Delete by hand. Hold a file and the sheet crumples into a ball under your finger; drag it over the bin and the rim lifts to meet it, let go and it drops in with a wobble. Miss and it rolls home and smooths back out. Delete on the keyboard throws it in an arc. The bin is a wire-mesh can you can see the crumpled files through; Empty flings them all into the corner of the screen, where they burn away to a little heap of ash.", deps: [M], isNew: true },

  // Text
  { slug: "typeset", name: "Typeset", category: "Text", description: "A headline that is made in front of you. The words type in behind a blinking caret, then a cursor glides over and clicks them into a design-tool selection, takes the corner handle and drags the text up to full size with the scale read out beside it, and lets go. Plays once as it scrolls into view; with reduced motion it simply arrives finished.", deps: [M], isNew: true },
  { slug: "text-focus", name: "Text Focus", category: "Text", description: "Text you read by pointing. Every word sits blurred until the pointer finds it: that word sharpens and a frame glides over to hold it, reshaping to fit each word, so the line gives itself up a word at a time. Corner marks like a viewfinder, or a design-tool selection with handles. Blur, dimness, colour and a memory that leaves read words half clear are yours to set; the arrow keys do the same from the keyboard.", deps: [M], isNew: true },
  { slug: "layer-text", name: "Layer Text", category: "Text", description: "Bold type where every letter is its own layer. Point at one and it turns to a clean outline and takes a design-tool selection: a hairline frame hugs its ink with a square handle on each corner and its size underneath, and as you move along the word the frame glides from letter to letter, reshaping to fit each one. Size, weight, tracking, outline, padding, handles and colour are all yours to set.", deps: [M], isNew: true },

  // Motion
  { slug: "burst", name: "Burst", category: "Motion", description: "Everything spreading out of a single point. Rings of cards are thrown from the centre in every direction, growing as they travel while the gaps between them widen, then fade at the edges and are thrown again. Point at it to hold it still. Rings, cards per ring, speed and card size are yours to set.", deps: [M], isNew: true },
  { slug: "card-stack", name: "Card Stack", category: "Motion", description: "A deck you deal by hand. Fling the top card and it tucks itself under the pile while the rest rise to meet you.", deps: [M, L] },
  { slug: "number-ticker", name: "Number Ticker", category: "Motion", description: "Numbers that arrive at speed. When the value changes every digit from the first one that moved races up through the count, smeared sideways with motion blur and trailing afterimages, then locks in one at a time from left to right with a spark.", deps: [M] },
  { slug: "drift-canvas", name: "Drift Canvas", category: "Motion", description: "An endless canvas that drifts one way, like a marquee in two dimensions: sideways, up, down or on any diagonal. Grab it and move it anywhere; let go and it carries on with momentum, then eases back into its drift. Only the cards on screen are rendered, so it costs the same however long it runs.", deps: [M], isNew: true },
  { slug: "infinite-grid", name: "Infinite Grid", category: "Motion", description: "A canvas that goes on forever in every direction. Drag it and it carries on with momentum, scroll it with a trackpad or step it with the arrow keys. Only the cells on screen are rendered, staggered like bricks so the same item rarely sits beside itself.", deps: [M], isNew: true },
  { slug: "focus-canvas", name: "Focus Canvas", category: "Motion", description: "A camera that tours an endless canvas on its own. It rests on one card, sharp and centred while everything around it goes soft, then pulls back, crosses the canvas in one smooth arc and closes in on the next. The blur and the sharpening follow the zoom, so they always happen together.", deps: [M], isNew: true },
  { slug: "timeline", name: "Timeline", category: "Motion", description: "Milestones on a line that rises into a hill under the one you are on. Move the cursor along it or scroll over it and the hill follows, while the card for the nearest milestone pops up over the peak; let go and it settles there. Touch drags it and the arrow keys step it. The line is a gradient you choose, rainbow by default, and at either end the wheel hands the page back.", deps: [M], isNew: true },
  { slug: "folder-card", name: "Folder Card", category: "Motion", description: "A folder you can peek into. Hover or focus it and the front flap tips open while the papers inside slide up and fan out. Tap toggles it on touch screens.", deps: [M] },
  { slug: "prune-reveal-animation", name: "Prune Reveal Animation", category: "AI", description: "An AI image that arrives by being pruned into view. While the model works the frame pulses with the prompt; when the image is ready the surface is touched at a random spot and burns away from there along a path of its own, never the same twice, with a soft glowing edge, the picture heating orange ahead of it and embers and ash rising off it. Regenerate and the pulse fades back in over the old image.", deps: [M], isNew: true },

  // AI
  { slug: "orb", name: "Orb", category: "AI", description: "A fluid orb drawn by a small WebGL shader: colour folds through itself like ink in water. Idle, listening, thinking and speaking each flow differently and melt into one another. Liquid and halo variants, and it reacts to real microphone input.", deps: [M, L] },
  { slug: "prompt-input", name: "Prompt Input", category: "AI", description: "An agent composer with model, effort and access pickers, attachments, auto-growing textarea and a send button that morphs into stop.", deps: [M, L] },

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

export const blockCategories = ["Hero", "Bento", "Features", "How it works", "Pricing", "Social proof", "Status", "Conversion", "Utility"] as const;

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
  { slug: "hero-monitor", name: "Sales Intent Hero", category: "Hero", description: "A sales hero shot like a product page. The account view runs off the page and fades at its foot while its intent chart streams in live. When the account stays over the alert line it turns to Buying now, a new visitor lands in the feed, and the rep's phone rings on a card over the window's edge, which becomes a booked meeting a moment later. Plays while in view; reduced motion shows the booked meeting, still.", deps: [M, L], uses: ["button", "stepper"], isNew: true },
  { slug: "incident-flow", name: "Agent Run", category: "How it works", description: "How it works, on a dark ruled band: one coding agent's run along a four-step track whose rule fills as it goes, above a square, hairline run panel that runs off the band's foot. A test reproduces the bug, two more fail with it, the fix lands as a one-line diff with a review request, then everything passes and it merges. Click a step to jump, or press R to replay.", deps: [M, L], uses: ["stepper"], isNew: true },
  { slug: "feature-rack", name: "Feature List", category: "Features", description: "A minimal feature section for an AI support agent: three plain features beside a wiring diagram. Every channel is wired to the agent and the agent to the tools it acts in; light pulses run along the curved wires, lighting each node they reach.", deps: [M], uses: [], isNew: true },
  { slug: "pricing-meter", name: "Blueprint Pricing", category: "Pricing", description: "Three plans drawn like a blueprint: dashed construction lines frame the columns and run off the page, a sliding pill switches monthly and yearly while the prices blur over, and the featured plan has a point of light travelling round its border. A studio row underneath covers everything bigger.", deps: [M, L], uses: [], isNew: true },
  { slug: "testimonials-deck", name: "Testimonial Deck", category: "Social proof", description: "Customer quotes dealt as a deck you can fling, each card leading with its outcome in large type, beside a review score and customer names. Behind it, hairlines frame the section with registration marks where they cross, and beams of light travel along them.", deps: [M, L], uses: ["card-stack"], isNew: true },
  { slug: "status-page", name: "Status Page", category: "Status", description: "A public status page: the headline state, every component's daily uptime as bars you can hover for what happened that day, a 30 or 90 day range, a subscribe form and the latest incident written up update by update.", deps: [M, L], uses: ["button", "segmented-control"], isNew: true },
  { slug: "cta-check", name: "Site Check CTA", category: "Conversion", description: "A closing call to action people actually use: type a domain, get an instant check from four regions with certificate expiry, then start monitoring it. It opens on an example result, so it never sits empty.", deps: [M, L], uses: ["button"], isNew: true },
  { slug: "not-found", name: "Not Found", category: "Utility", description: "A 404 for a product that watches websites, told as a check. Six regions try the missing address one after another: each reaches the site fast and each gets the same 404, so the site is fine and only the page is gone. Once they all agree, a card suggests the page that does answer. Check again replays it.", deps: [M, L], uses: ["button"], isNew: true },
];

export function getBlock(slug: string) {
  return blocks.find((b) => b.slug === slug);
}

export function getBlockNeighbours(slug: string) {
  const index = blocks.findIndex((b) => b.slug === slug);
  return { prev: blocks[index - 1], next: blocks[index + 1] };
}
