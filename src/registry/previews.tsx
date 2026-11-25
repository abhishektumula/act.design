"use client";

import type { ComponentType } from "react";
import Orb from "@/components/ui/orb";
import Burst from "@/components/ui/burst";
import CardStack from "@/components/ui/card-stack";
import CodeInput from "@/components/ui/code-input";
import CompareSlider from "@/components/ui/compare-slider";
import InfiniteGrid from "@/components/ui/infinite-grid";
import CommandPalette from "@/components/ui/command-palette";
import Dial from "@/components/ui/dial";
import DialGallery from "@/components/ui/dial-gallery";
import Fader from "@/components/ui/fader";
import HoldToConfirm from "@/components/ui/hold-to-confirm";
import Button from "@/components/ui/button";
import LayerText from "@/components/ui/layer-text";
import NumberTicker from "@/components/ui/number-ticker";
import PromptInput from "@/components/ui/prompt-input";
import PruneRevealAnimation from "@/components/ui/prune-reveal-animation";
import SegmentedControl from "@/components/ui/segmented-control";
import DriftCanvas from "@/components/ui/drift-canvas";
import FocusCanvas from "@/components/ui/focus-canvas";
import FolderCard from "@/components/ui/folder-card";
import Stepper from "@/components/ui/stepper";
import Switch from "@/components/ui/switch";
import TextStagger from "@/components/ui/text-stagger";
import Typeset from "@/components/ui/typeset";
import Toast from "@/components/ui/toast";
import TrashBin from "@/components/ui/trash-bin";

export const previews: Record<string, ComponentType> = {
  orb: Orb,
  burst: Burst,
  "card-stack": CardStack,
  "code-input": CodeInput,
  "compare-slider": CompareSlider,
  "infinite-grid": InfiniteGrid,
  "command-palette": CommandPalette,
  "dial": Dial,
  "dial-gallery": DialGallery,
  "fader": Fader,
  "hold-to-confirm": HoldToConfirm,
  button: Button,
  "layer-text": LayerText,
  "number-ticker": NumberTicker,
  "prompt-input": PromptInput,
  "prune-reveal-animation": PruneRevealAnimation,
  "segmented-control": SegmentedControl,
  "drift-canvas": DriftCanvas,
  "focus-canvas": FocusCanvas,
  "folder-card": FolderCard,
  "stepper": Stepper,
  "switch": Switch,
  "text-stagger": TextStagger,
  typeset: Typeset,
  toast: Toast,
  "trash-bin": TrashBin,
};

export function Preview({ slug }: { slug: string }) {
  const Demo = previews[slug];
  return Demo ? <Demo /> : null;
}
