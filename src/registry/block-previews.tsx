import type { ComponentType } from "react";
import BentoFocus from "@/components/blocks/bento-focus";
import CtaCheck from "@/components/blocks/cta-check";
import FeatureRack from "@/components/blocks/feature-rack";
import HeroHorizon from "@/components/blocks/hero-horizon";
import HeroMonitor from "@/components/blocks/hero-monitor";
import HeroPrint from "@/components/blocks/hero-print";
import HeroSilk from "@/components/blocks/hero-silk";
import HeroSky from "@/components/blocks/hero-sky";
import HeroSweep from "@/components/blocks/hero-sweep";
import IncidentFlow from "@/components/blocks/incident-flow";
import NotFound from "@/components/blocks/not-found";
import PricingMeter from "@/components/blocks/pricing-meter";
import StatusPage from "@/components/blocks/status-page";
import TestimonialsDeck from "@/components/blocks/testimonials-deck";

export const blockPreviews: Record<string, ComponentType> = {
  "bento-focus": BentoFocus,
  "cta-check": CtaCheck,
  "feature-rack": FeatureRack,
  "hero-horizon": HeroHorizon,
  "hero-monitor": HeroMonitor,
  "hero-print": HeroPrint,
  "hero-silk": HeroSilk,
  "hero-sky": HeroSky,
  "hero-sweep": HeroSweep,
  "incident-flow": IncidentFlow,
  "not-found": NotFound,
  "pricing-meter": PricingMeter,
  "status-page": StatusPage,
  "testimonials-deck": TestimonialsDeck,
};
