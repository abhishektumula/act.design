"use client";

import { motion } from "motion/react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export type Testimonial = { quote: string; name: string; role: string; gradient: string };

const defaultTestimonials: Testimonial[] = [
  {
    quote: "We replaced three tools and a cron server with Lumen in an afternoon. Our deploys went from twelve minutes to four seconds.",
    name: "Maya Chen",
    role: "CTO, Fieldnote",
    gradient: "from-violet-400 to-fuchsia-500",
  },
  { quote: "The first dashboard my CEO actually opens.", name: "Leo Martins", role: "Head of Data, Parcel", gradient: "from-amber-300 to-orange-500" },
  {
    quote: "Support answered in six minutes on a Sunday. With a code snippet. That never happens.",
    name: "Priya Raman",
    role: "Staff Engineer, Northwind",
    gradient: "from-emerald-300 to-teal-500",
  },
  {
    quote: "It feels like it was designed by people who ship software every day, because it clearly was.",
    name: "Jonas Weber",
    role: "Founder, Brightline",
    gradient: "from-sky-400 to-blue-600",
  },
  { quote: "Preview links on every PR changed how our designers review work.", name: "Aiko Tanaka", role: "Design Lead, Kumo", gradient: "from-rose-400 to-pink-500" },
  {
    quote: "We cut our infra bill by 40% and nobody had to learn Kubernetes. I'd call that a win.",
    name: "Sam Okafor",
    role: "VP Engineering, Relay",
    gradient: "from-lime-300 to-emerald-500",
  },
];

function Card({ t, featured, index }: { t: Testimonial; featured?: boolean; index: number }) {
  return (
    <motion.figure
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: (index % 3) * 0.08, duration: 0.5 }}
      whileHover={{ y: -4 }}
      className={cn(
        "mb-4 break-inside-avoid rounded-3xl p-6 ring-1 transition-shadow hover:shadow-xl hover:shadow-shade/40",
        featured
          ? "bg-base-900 ring-base-50/15 inset-shadow-2xs inset-shadow-white/10"
          : "bg-base-950 ring-base-50/10 inset-shadow-2xs inset-shadow-white/5",
      )}
    >
      {featured && (
        <div className="mb-5 flex gap-0.5 text-amber-500 dark:text-amber-400">
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} className="size-4 fill-current" />
          ))}
        </div>
      )}
      <blockquote className={cn("leading-relaxed text-pretty text-base-200", featured ? "text-xl tracking-tight" : "text-[15px]")}>
        “{t.quote}”
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        <span className={cn("size-9 rounded-full bg-linear-to-br ring-2 ring-canvas", t.gradient)} />
        <div>
          <p className="text-sm font-medium text-base-100">{t.name}</p>
          <p className="text-xs text-base-500">{t.role}</p>
        </div>
      </figcaption>
    </motion.figure>
  );
}

export function Testimonials({
  testimonials = defaultTestimonials,
  title = "Loved by people who ship.",
  className,
}: {
  testimonials?: Testimonial[];
  title?: string;
  className?: string;
}) {
  return (
    <section data-slot="testimonials" className={cn("bg-canvas px-6 py-24", className)}>
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="max-w-md text-3xl font-semibold tracking-[-0.03em] text-balance text-base-50 sm:text-5xl">{title}</h2>
          <p className="flex items-center gap-2 text-sm text-base-500">
            <span className="font-medium text-base-100">4.9 / 5</span> from 1,200+ reviews
          </p>
        </div>
        <div className="mt-14 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {testimonials.map((t, i) => (
            <Card key={t.name} t={t} featured={i === 0} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Block() {
  return <Testimonials />;
}
