import type { ComponentType } from "react";
import CtaCheck from "@/components/blocks/cta-check";
import FeatureRack from "@/components/blocks/feature-rack";
import Gauges from "@/components/blocks/gauges";
import HeroMonitor from "@/components/blocks/hero-monitor";
import PricingMeter from "@/components/blocks/pricing-meter";
import TestimonialsDeck from "@/components/blocks/testimonials-deck";

export const blockPreviews: Record<string, ComponentType> = {
  "cta-check": CtaCheck,
  "feature-rack": FeatureRack,
  "gauges": Gauges,
  "hero-monitor": HeroMonitor,
  "pricing-meter": PricingMeter,
  "testimonials-deck": TestimonialsDeck,
};
