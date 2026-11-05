"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ComponentType, type FormEvent, type SVGProps } from "react";
import { useRouter } from "next/navigation";
import {
  BuildingIcon, DiamondIcon, GraduationIcon, PaletteIcon, ProductIcon, TargetIcon, TerminalIcon, UserIcon,
} from "@/components/icons";
import { OptionCard } from "@/components/onboarding/option-card";
import { Progress } from "@/components/onboarding/progress";
import { TEAM_GLYPHS, TeamGlyph } from "@/components/onboarding/team-glyph";
import { PageLogo } from "@/components/page-logo";
import { Button } from "@/components/ui/button";
import { DotSpinner } from "@/components/ui/dot-spinner";
import { PageTitle } from "@/components/ui/page-title";
import { TextField } from "@/components/ui/text-field";
import { cn } from "@/lib/cn";

type Step = "confirming" | "welcome" | "name" | "role" | "team" | "ready";

const ROLES: { id: string; label: string; icon: ComponentType<SVGProps<SVGSVGElement>> }[] = [
  { id: "founder", label: "Founder", icon: BuildingIcon },
  { id: "designer", label: "Designer", icon: PaletteIcon },
  { id: "developer", label: "Developer", icon: TerminalIcon },
  { id: "product", label: "Product", icon: ProductIcon },
  { id: "marketing", label: "Marketing", icon: TargetIcon },
  { id: "operations", label: "Operations", icon: DiamondIcon },
  { id: "student", label: "Student", icon: GraduationIcon },
  { id: "other", label: "Other", icon: UserIcon },
];

const TEAMS: { id: keyof typeof TEAM_GLYPHS; label: string }[] = [
  { id: "solo", label: "Just me" },
  { id: "small", label: "2–20 people" },
  { id: "medium", label: "21–50 people" },
  { id: "large", label: "51+ people" },
];

/** Bar position per step (a short stub on the first one, full before "ready"). */
const PROGRESS: Record<Step, number> = { confirming: 0, welcome: 0, name: 0.05, role: 1 / 3, team: 2 / 3, ready: 1 };
/** How long each intro screen stays up before the questions start. */
const INTRO_MS: Partial<Record<Step, [ms: number, next: Step]>> = { confirming: [2200, "welcome"], welcome: [1800, "name"] };
/** Let a picked tile show as selected before moving on. */
const PICK_MS = 380;
const READY_DELAY_MS = 700;
const HOME_AFTER_MS = 2600;

function Title({ children }: { children: string }) {
  return <PageTitle className="mb-12 below-760:mb-8">{children}</PageTitle>;
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-12 below-760:mt-8 border-0 bg-transparent px-3 py-1.5 rounded-lg text-[14px] leading-5 font-semibold text-ink transition-[background] duration-200 hover:bg-bg-tertiary"
    >
      Back
    </button>
  );
}

/** Two short intro screens, three questions (name → role → team size), then a "ready" screen. */
export function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("confirming");
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string>();
  const [role, setRole] = useState<string>();
  const [team, setTeam] = useState<string>();
  const [picking, setPicking] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const nameRef = useRef<HTMLInputElement>(null);

  // Next keeps a page's state when you navigate away (it's hidden, not unmounted), so a
  // finished onboarding would reopen on "ready". Start over whenever the page is left.
  useLayoutEffect(
    () => () => {
      clearTimeout(timer.current);
      setStep("confirming");
      setName("");
      setNameError(undefined);
      setRole(undefined);
      setTeam(undefined);
      setPicking(false);
    },
    [],
  );
  useEffect(() => {
    const intro = INTRO_MS[step];
    if (intro) timer.current = setTimeout(() => setStep(intro[1]), intro[0]);
    if (step === "name") nameRef.current?.focus();
    if (step === "ready") timer.current = setTimeout(() => router.push("/"), HOME_AFTER_MS);
  }, [step, router]);

  function submitName(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setNameError("Please enter your name");
    setStep("role");
  }

  function pick(set: (v: string) => void, value: string, next: Step, delay = PICK_MS) {
    if (picking) return;
    set(value);
    setPicking(true);
    timer.current = setTimeout(() => {
      setPicking(false);
      setStep(next);
    }, delay);
  }

  const ready = step === "ready";
  const intro = step === "confirming" || step === "welcome";

  return (
    <main className="relative min-h-dvh flex flex-col bg-bg text-ink">
      <header
        className={cn(
          "absolute inset-x-0 top-0 z-3 h-[76px] transition-opacity duration-500",
          (ready || step === "welcome") && "opacity-0 pointer-events-none",
        )}
      >
        <PageLogo />
        <Progress
          value={PROGRESS[step]}
          className={cn(
            "absolute top-20 left-1/2 -translate-x-1/2 w-[360px] transition-opacity duration-500 below-760:top-[37px] below-760:left-[64px] below-760:right-6 below-760:w-auto below-760:translate-x-0",
            intro && "opacity-0",
          )}
        />
      </header>

      {/* equal spacers centre the step; the top one keeps it clear of the header */}
      <div className="flex-1 flex flex-col items-center px-6 pt-24 pb-10 before:flex-1 before:content-[''] after:flex-[1.15] after:content-['']">
        <div key={step} className="w-full flex flex-col items-center animate-[flRise_.5s_var(--ease-fl)_both]">
          {step === "confirming" && (
            <div className="flex flex-col items-center text-center" role="status">
              <DotSpinner className="mb-10" label="Confirming your email" />
              <PageTitle>Almost there...</PageTitle>
              <p className="m-0 mt-3 text-[14px] leading-5 text-tertiary">
                We’re confirming your email and getting things ready.
              </p>
            </div>
          )}

          {step === "welcome" && (
            <PageTitle role="status">Welcome to N zero</PageTitle>
          )}

          {step === "name" && (
            <form className="w-[360px] max-w-full flex flex-col items-center" noValidate onSubmit={submitName}>
              <Title>Start with you.</Title>
              <TextField
                id="obName"
                label="What should we call you?"
                placeholder="Enter your name"
                autoComplete="name"
                className="w-full"
                inputRef={nameRef}
                value={name}
                error={nameError}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameError(undefined);
                }}
              />
              <Button variant="block" type="submit" className="mt-10">
                Next
              </Button>
            </form>
          )}

          {step === "role" && (
            <>
              <Title>What’s your role?</Title>
              <div
                role="radiogroup"
                aria-label="Your role"
                className="w-[664px] max-w-full grid grid-cols-4 gap-4 below-760:grid-cols-2 below-760:gap-3"
              >
                {ROLES.map(({ id, label, icon: Icon }) => (
                  <OptionCard
                    key={id}
                    icon={<Icon />}
                    label={label}
                    selected={role === id}
                    disabled={picking}
                    onSelect={() => pick(setRole, id, "team")}
                  />
                ))}
              </div>
              <BackButton onClick={() => setStep("name")} />
            </>
          )}

          {step === "team" && (
            <>
              <Title>How big is your team?</Title>
              <div
                role="radiogroup"
                aria-label="Team size"
                className="w-[664px] max-w-full grid grid-cols-4 gap-4 below-760:grid-cols-2 below-760:gap-3"
              >
                {TEAMS.map(({ id, label }) => (
                  <OptionCard
                    key={id}
                    icon={<TeamGlyph cells={TEAM_GLYPHS[id]} className="mt-px ml-px" />}
                    label={label}
                    selected={team === id}
                    disabled={picking}
                    onSelect={() => pick(setTeam, id, "ready", READY_DELAY_MS)}
                  />
                ))}
              </div>
              <BackButton onClick={() => setStep("role")} />
            </>
          )}

          {ready && (
            <PageTitle role="status">Your N-Zero is ready</PageTitle>
          )}
        </div>
      </div>
    </main>
  );
}
