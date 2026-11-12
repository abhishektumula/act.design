import type { ComponentType } from "react";
import FeatureRack from "@/components/blocks/feature-rack";
import Gauges from "@/components/blocks/gauges";
import HeroInstrument from "@/components/blocks/hero-instrument";
import PricingMeter from "@/components/blocks/pricing-meter";
import TestimonialsDeck from "@/components/blocks/testimonials-deck";
import WaitlistKeys from "@/components/blocks/waitlist-keys";

export const blockPreviews: Record<string, ComponentType> = {
  "feature-rack": FeatureRack,
  "gauges": Gauges,
  "hero-instrument": HeroInstrument,
  "pricing-meter": PricingMeter,
  "testimonials-deck": TestimonialsDeck,
  "waitlist-keys": WaitlistKeys,
};
