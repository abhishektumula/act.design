"use client";

import type { ComponentType } from "react";
import Orb from "@/components/ui/orb";
import CardStack from "@/components/ui/card-stack";
import CommandPalette from "@/components/ui/command-palette";
import Dial from "@/components/ui/dial";
import Fader from "@/components/ui/fader";
import HoldToConfirm from "@/components/ui/hold-to-confirm";
import Keycap from "@/components/ui/keycap";
import NumberTicker from "@/components/ui/number-ticker";
import PromptInput from "@/components/ui/prompt-input";
import SegmentedControl from "@/components/ui/segmented-control";
import SpotlightCard from "@/components/ui/spotlight-card";
import Stepper from "@/components/ui/stepper";
import Switch from "@/components/ui/switch";
import TextStagger from "@/components/ui/text-stagger";

export const previews: Record<string, ComponentType> = {
  orb: Orb,
  "card-stack": CardStack,
  "command-palette": CommandPalette,
  "dial": Dial,
  "fader": Fader,
  "hold-to-confirm": HoldToConfirm,
  "keycap": Keycap,
  "number-ticker": NumberTicker,
  "prompt-input": PromptInput,
  "segmented-control": SegmentedControl,
  "spotlight-card": SpotlightCard,
  "stepper": Stepper,
  "switch": Switch,
  "text-stagger": TextStagger,
};

export function Preview({ slug }: { slug: string }) {
  const Demo = previews[slug];
  return Demo ? <Demo /> : null;
}
