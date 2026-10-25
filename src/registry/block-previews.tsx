import type { ComponentType } from "react";
import BentoGrid from "@/components/blocks/bento-grid";
import CTA from "@/components/blocks/cta";
import FAQ from "@/components/blocks/faq";
import FeaturesTabs from "@/components/blocks/features-tabs";
import Footer from "@/components/blocks/footer";
import HeroAI from "@/components/blocks/hero-ai";
import HeroCentered from "@/components/blocks/hero-centered";
import HeroSplit from "@/components/blocks/hero-split";
import LogoCloud from "@/components/blocks/logo-cloud";
import Navbar from "@/components/blocks/navbar";
import Pricing from "@/components/blocks/pricing";
import Stats from "@/components/blocks/stats";
import Testimonials from "@/components/blocks/testimonials";
import Waitlist from "@/components/blocks/waitlist";

export const blockPreviews: Record<string, ComponentType> = {
  "bento-grid": BentoGrid,
  cta: CTA,
  faq: FAQ,
  "features-tabs": FeaturesTabs,
  footer: Footer,
  "hero-ai": HeroAI,
  "hero-centered": HeroCentered,
  "hero-split": HeroSplit,
  "logo-cloud": LogoCloud,
  navbar: Navbar,
  pricing: Pricing,
  stats: Stats,
  testimonials: Testimonials,
  waitlist: Waitlist,
};
