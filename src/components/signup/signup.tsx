"use client";

import { useEffect, useState, type ComponentProps } from "react";
import { useRouter } from "next/navigation";
import { LogoMark } from "@/components/brand";
import { AppleIcon, CloseIcon, GitHubIcon, GoogleIcon } from "@/components/icons";
import { CheckInbox } from "@/components/signup/check-inbox";
import { CornerBricks } from "@/components/signup/corner-bricks";
import { SignupForm } from "@/components/signup/signup-form";
import { PageTitle } from "@/components/ui/page-title";
import { TextButton, TextPrompt } from "@/components/ui/text-button";
import { cn } from "@/lib/cn";
import { useUI } from "@/lib/store";

function SocialButton({ className, ...props }: ComponentProps<"button">) {
  return (
    <button
      className={cn(
        "flex-[1_0_0] min-w-0 h-11 flex items-center justify-center bg-box border border-border-secondary-alt rounded-[10px] p-3",
        "transition-[background,border-color,transform] duration-200 hover:border-border-secondary hover:bg-bg-tertiary [&_svg]:size-5 [&_svg]:block",
        className,
      )}
      {...props}
    />
  );
}

const LABELS = { signup: "Create an account", login: "Log in", inbox: "Check your inbox" } as const;

/** Full-screen auth overlay: create account, log in, and the "check your inbox" step of a password reset. */
export function Signup() {
  const open = useUI((s) => s.signupOpen);
  const openKey = useUI((s) => s.signupKey);
  const mode = useUI((s) => s.authMode);
  const authEmail = useUI((s) => s.authEmail);
  const closeSignup = useUI((s) => s.closeSignup);
  const setAuthMode = useUI((s) => s.setAuthMode);
  /** the open count at which the account was created; reopening starts over */
  const [createdAt, setCreatedAt] = useState<number | null>(null);
  // also cleared once closed, so a page restored after onboarding doesn't replay the assembly
  const created = open && createdAt === openKey;
  const login = mode === "login";
  const inbox = mode === "inbox";
  const router = useRouter();

  // once the bricks have clicked together (≈2.6s) and settled, continue to onboarding
  useEffect(() => {
    if (!created) return;
    // drop the on-screen keyboard so the bricks gather in the full-height screen
    (document.activeElement as HTMLElement | null)?.blur();
    const t = setTimeout(() => {
      router.push("/onboarding");
      closeSignup();
    }, 3400);
    return () => clearTimeout(t);
  }, [created, router, closeSignup]);

  function openResetLink() {
    router.push("/reset-password");
    closeSignup();
  }

  return (
    <section
      className={cn(
        "fixed inset-0 z-40 bg-bg text-ink flex flex-col overflow-y-auto",
        open
          ? "opacity-100 visible transition-opacity duration-450"
          : "opacity-0 invisible transition-[opacity,visibility] [transition-duration:.4s,0s] [transition-timing-function:ease,linear] [transition-delay:0s,.4s]",
      )}
      aria-hidden={!open}
      role="dialog"
      aria-label={LABELS[mode]}
    >
      <header className="absolute inset-x-0 top-0 z-3 flex items-center justify-between pt-[22px] px-8 pb-0">
        <span className="flex items-center text-ink [&_svg]:h-5 [&_svg]:w-auto [&_svg]:block" role="img" aria-label="zero">
          <LogoMark />
        </span>
        {/* hidden (not removed) on the inbox screen so the logo keeps its place */}
        <button
          className={cn(
            "size-8 border-0 rounded-lg bg-transparent text-secondary flex items-center justify-center transition-[background,color] duration-200 hover:bg-bg-tertiary hover:text-ink [&_svg]:size-5",
            inbox && "invisible",
          )}
          aria-label="Close"
          onClick={closeSignup}
        >
          <CloseIcon />
        </button>
      </header>

      <div className="relative flex-1 w-full max-w-[1440px] mx-auto flex flex-col">
        <p className="sr-only" role="status">
          {created ? "Your account has been created." : ""}
        </p>
        <CornerBricks open={open} openKey={openKey} assembled={created} hidden={inbox} />

        {/* equal spacers centre the card; the top one keeps it clear of the header when space runs out */}
        <div
          className={cn(
            "flex-1 flex flex-col items-center p-6 before:content-[''] before:flex-1 before:min-h-10 after:content-[''] after:flex-1",
            created && "opacity-0 pointer-events-none transition-opacity duration-500",
          )}
          aria-hidden={created || undefined}
        >
          {inbox ? (
            <div key="inbox" className="w-full flex justify-center animate-[flFadeIn_.3s_ease_both]">
              <CheckInbox email={authEmail} onBack={() => setAuthMode("login")} onOpenLink={openResetLink} />
            </div>
          ) : (
            <div
              key={mode}
              className={cn("w-[360px] max-w-full flex flex-col items-center", login && "animate-[flFadeIn_.3s_ease_both]")}
            >
              <PageTitle className="mb-12">{login ? "Welcome back" : "Create an account"}</PageTitle>

              <div className="flex gap-3 w-full">
                <SocialButton aria-label="Continue with Google">
                  <GoogleIcon />
                </SocialButton>
                <SocialButton aria-label="Continue with Apple">
                  <AppleIcon style={{ color: "var(--ink)" }} />
                </SocialButton>
                <SocialButton aria-label="Continue with GitHub">
                  <GitHubIcon style={{ color: "var(--ink)" }} />
                </SocialButton>
              </div>

              <div className="flex items-center gap-2 w-full my-6 before:content-[''] before:flex-1 before:h-px before:bg-border-secondary after:content-[''] after:flex-1 after:h-px after:bg-border-secondary">
                <span className="text-[14px] leading-5 font-medium text-tertiary">OR</span>
              </div>

              <SignupForm
                key={openKey}
                mode={login ? "login" : "signup"}
                open={open}
                initialEmail={login ? authEmail : ""}
                // an existing user goes straight back to the page
                onDone={login ? closeSignup : () => setCreatedAt(openKey)}
                onForgot={(email) => setAuthMode("inbox", email)}
              />

              <TextPrompt>
                {login ? "Don’t have an account? " : "Already have an account? "}
                <TextButton onClick={() => setAuthMode(login ? "signup" : "login")}>{login ? "Sign up" : "Log in"}</TextButton>
              </TextPrompt>
            </div>
          )}
        </div>

        <p
          className={cn(
            "text-center text-[13px] leading-[18px] text-tertiary pt-0 px-6 pb-4 [&_a]:text-ink [&_a]:font-semibold [&_a]:no-underline [&_a:hover]:underline",
            (created || inbox) && "opacity-0 pointer-events-none transition-opacity duration-500",
          )}
          aria-hidden={inbox || undefined}
        >
          By continuing, you agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
        </p>
      </div>
    </section>
  );
}
