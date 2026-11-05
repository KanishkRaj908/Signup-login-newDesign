import { FeatureCards } from "@/components/hero/feature-cards";
import { Legos } from "@/components/hero/legos";
import { PromptComposer } from "@/components/hero/prompt-composer";

export function Hero() {
  return (
    <main className="flex flex-col items-center text-center pt-14 px-6 pb-0">
      <Legos />
      <h1
        className="font-serif font-medium text-[clamp(40px,6.4vw,60px)] below-720:text-[32px] leading-[1.06] tracking-[-.5px] mt-2.5 mb-14 mx-0 text-balance animate-[riseIn_.8s_var(--ease-enter)_.42s_backwards] motion-reduce:animate-none!"
        data-content=""
      >
        Build what&apos;s <em className="not-italic text-gold">next.</em>
      </h1>
      <PromptComposer />
      <FeatureCards />
    </main>
  );
}
