import type { ComponentType, SVGProps } from "react";
import { BrushIcon, TemplatesIcon, VoiceSparkIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

/** `short` is the tile label on phones. */
type Feature = { icon: ComponentType<SVGProps<SVGSVGElement>>; title: string; short: string; text: string; delay: string };

const FEATURES: Feature[] = [
  { icon: BrushIcon, title: "Shape my idea", short: "Shape idea", text: "Answer a few questions.", delay: "[animation-delay:.8s]" },
  { icon: TemplatesIcon, title: "Explore templates", short: "Templates", text: "Start from proven designs.", delay: "[animation-delay:.88s]" },
  { icon: VoiceSparkIcon, title: "Let's talk", short: "Let's talk", text: "Build together with AI.", delay: "[animation-delay:.96s]" },
];

function FeatureCard({ icon: Icon, title, short, text, delay }: Feature) {
  return (
    <div
      className={cn(
        "flex items-start gap-4 text-left bg-box border border-border-secondary rounded-2xl p-4",
        // phones: compact tile, icon over a short label
        "below-720:flex-col below-720:items-center below-720:gap-2 below-720:px-2 below-720:py-3.5 below-720:text-center below-720:rounded-xl",
        "transition-[box-shadow,transform,border-color] duration-250 hover:[transform:translateY(-2px)] hover:shadow-xs hover:border-placeholder",
        "animate-[riseIn_.72s_var(--ease-enter)_backwards] motion-reduce:animate-none!",
        delay,
      )}
    >
      <span className="size-6 below-720:size-5 flex-none text-ink">
        <Icon className="size-6 below-720:size-5 block" />
      </span>
      <div className="min-w-0 flex flex-col gap-0.5 below-720:items-center">
        <h3 className="m-0 text-[14px] font-bold text-secondary leading-5 whitespace-nowrap below-720:text-[12px] below-720:leading-[18px] below-720:font-medium">
          <span className="below-720:hidden">{title}</span>
          <span className="hidden below-720:inline">{short}</span>
        </h3>
        <p className="m-0 text-[14px] font-normal text-tertiary leading-5 whitespace-nowrap below-720:hidden">{text}</p>
      </div>
    </div>
  );
}

export function FeatureCards() {
  return (
    <div className="w-[min(842px,100%)] mx-auto mt-16 grid grid-cols-3 gap-4 below-720:mt-8 below-720:gap-2" data-content="">
      {FEATURES.map((f) => (
        <FeatureCard key={f.title} {...f} />
      ))}
    </div>
  );
}
