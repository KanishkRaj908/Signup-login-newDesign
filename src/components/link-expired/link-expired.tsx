"use client";

import { useRouter } from "next/navigation";
import { PageLogo } from "@/components/page-logo";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/ui/page-title";
import { useUI } from "@/lib/store";

/** A red brick tipped over on its edge, with three impact dashes. Isometric cube, stud on its right face. */
function FallenBrick({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 172 134" fill="none" aria-hidden="true">
      <defs>
        <filter id="lxShadow" x="-50%" y="-200%" width="200%" height="500%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <linearGradient id="lxTop" x1="0" y1="-44" x2="0" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f2675a" />
          <stop offset="1" stopColor="#e8473b" />
        </linearGradient>
      </defs>
      <ellipse cx="74" cy="119" rx="44" ry="5" fill="#000" opacity=".16" filter="url(#lxShadow)" />
      <g transform="translate(80 74) rotate(18)">
        <path d="M0-44 38.1-22 0 0-38.1-22Z" fill="url(#lxTop)" />
        <path d="M-38.1-22 0 0V44L-38.1 22Z" fill="#d93a2f" />
        <path d="M0 0 38.1-22V22L0 44Z" fill="#e5463a" />
        {/* stud: base, side band, cap (it sticks out along the face normal) */}
        <ellipse cx="19.05" cy="11" rx="17.1" ry="9.9" transform="rotate(-60 19.05 11)" fill="#c93127" />
        <path d="M27.62-3.8 36.28 1.2 19.14 30.8 10.48 25.8Z" fill="#d63a2f" />
        <ellipse cx="27.71" cy="16" rx="17.1" ry="9.9" transform="rotate(-60 27.71 16)" fill="#f05a4c" />
      </g>
      <g stroke="var(--rail)" strokeWidth="3" strokeLinecap="round">
        <path d="M121 26 125 15" />
        <path d="M131 35 141 27" />
        <path d="M136 47 148 45" />
      </g>
    </svg>
  );
}

/** Where an expired verification link lands: send the visitor back to sign up. */
export function LinkExpired() {
  const router = useRouter();
  const openSignup = useUI((s) => s.openSignup);

  function signUpAgain() {
    openSignup("signup");
    router.push("/");
  }

  return (
    <main className="relative min-h-dvh flex flex-col bg-bg text-ink">
      <PageLogo />
      {/* equal spacers centre the message; the top one keeps it clear of the logo */}
      <div className="flex-1 flex flex-col items-center px-6 pt-20 pb-10 before:flex-1 before:content-[''] after:flex-[1.15] after:content-['']">
        <div className="w-[360px] max-w-full flex flex-col items-center text-center animate-[flRise_.5s_var(--ease-fl)_both]">
          <FallenBrick className="w-[172px] h-auto mb-12 below-760:w-[140px] below-760:mb-8" />
          <PageTitle>Your link has expired</PageTitle>
          <p className="m-0 mt-3 text-[14px] leading-5 text-secondary">
            Please sign up again to receive a new verification link.
          </p>
          <Button variant="block" className="mt-12 below-760:mt-10" onClick={signUpAgain}>
            Sign up again
          </Button>
        </div>
      </div>
    </main>
  );
}
