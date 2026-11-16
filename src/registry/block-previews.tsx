import type { ComponentType } from "react";
import CtaCheck from "@/components/blocks/cta-check";
import FeatureRack from "@/components/blocks/feature-rack";
import Gauges from "@/components/blocks/gauges";
import HeroMonitor from "@/components/blocks/hero-monitor";
import IncidentFlow from "@/components/blocks/incident-flow";
import PricingMeter from "@/components/blocks/pricing-meter";
import StatusPage from "@/components/blocks/status-page";
import TestimonialsDeck from "@/components/blocks/testimonials-deck";

export const blockPreviews: Record<string, ComponentType> = {
  "cta-check": CtaCheck,
  "feature-rack": FeatureRack,
  "gauges": Gauges,
  "hero-monitor": HeroMonitor,
  "incident-flow": IncidentFlow,
  "pricing-meter": PricingMeter,
  "status-page": StatusPage,
  "testimonials-deck": TestimonialsDeck,
};
