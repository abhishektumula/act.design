"use client";

import type { ComponentType } from "react";
import AgentPlan from "@/components/ui/agent-plan";
import AIOrb from "@/components/ui/ai-orb";
import ChatThread from "@/components/ui/chat-thread";
import CommandPalette from "@/components/ui/command-palette";
import DataTable from "@/components/ui/data-table";
import Dialog from "@/components/ui/dialog";
import Dock from "@/components/ui/dock";
import Drawer from "@/components/ui/drawer";
import FileDropzone from "@/components/ui/file-dropzone";
import GlyphCard from "@/components/ui/glyph-card";
import HoldToConfirm from "@/components/ui/hold-to-confirm";
import LightCard from "@/components/ui/light-card";
import MagneticButton from "@/components/ui/magnetic-button";
import NumberTicker from "@/components/ui/number-ticker";
import OTPInput from "@/components/ui/otp-input";
import PromptInput from "@/components/ui/prompt-input";
import RadioCards from "@/components/ui/radio-cards";
import Reasoning from "@/components/ui/reasoning";
import ShimmerButton from "@/components/ui/shimmer-button";
import SignalCard from "@/components/ui/signal-card";
import SpotlightCard from "@/components/ui/spotlight-card";
import Tabs from "@/components/ui/tabs";
import TextStagger from "@/components/ui/text-stagger";
import ThinkingIndicator from "@/components/ui/thinking-indicator";
import TiltCard from "@/components/ui/tilt-card";
import Toast from "@/components/ui/toast";
import Tooltip from "@/components/ui/tooltip";
import VoiceWaveform from "@/components/ui/voice-waveform";
import WorldCard from "@/components/ui/world-card";

export const previews: Record<string, ComponentType> = {
  "agent-plan": AgentPlan,
  "ai-orb": AIOrb,
  "glyph-card": GlyphCard,
  "light-card": LightCard,
  "world-card": WorldCard,
  "signal-card": SignalCard,
  "chat-thread": ChatThread,
  "command-palette": CommandPalette,
  "data-table": DataTable,
  dialog: Dialog,
  dock: Dock,
  drawer: Drawer,
  "file-dropzone": FileDropzone,
  "hold-to-confirm": HoldToConfirm,
  "magnetic-button": MagneticButton,
  "number-ticker": NumberTicker,
  "otp-input": OTPInput,
  "prompt-input": PromptInput,
  "radio-cards": RadioCards,
  reasoning: Reasoning,
  "shimmer-button": ShimmerButton,
  "spotlight-card": SpotlightCard,
  tabs: Tabs,
  "text-stagger": TextStagger,
  "thinking-indicator": ThinkingIndicator,
  "tilt-card": TiltCard,
  toast: Toast,
  tooltip: Tooltip,
  "voice-waveform": VoiceWaveform,
};

export function Preview({ slug }: { slug: string }) {
  const Demo = previews[slug];
  return Demo ? <Demo /> : null;
}
