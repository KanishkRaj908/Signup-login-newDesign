"use client";

import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PageLogo } from "@/components/page-logo";
import { PasswordRequirements } from "@/components/signup/password-requirements";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/ui/page-title";
import { Spinner } from "@/components/ui/spinner";
import { TextButton, TextPrompt } from "@/components/ui/text-button";
import { PasswordField } from "@/components/ui/text-field";
import { meetsAllRules } from "@/lib/password";
import { useUI } from "@/lib/store";

const UPDATE_MS = 1100;

/** "Create a new password" — where the emailed reset link lands. */
export function ResetPassword() {
  const router = useRouter();
  const openSignup = useUI((s) => s.openSignup);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [focused, setFocused] = useState(false);
  const [touched, setTouched] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    passwordRef.current?.focus();
  }, []);

  // the page is kept (hidden) after navigating away; start blank on the next visit
  useLayoutEffect(
    () => () => {
      clearTimeout(timer.current);
      setPassword("");
      setConfirm("");
      setTouched(false);
      setAttempted(false);
      setLoading(false);
    },
    [],
  );

  const valid = meetsAllRules(password);
  const matches = confirm === password;
  const passwordError = attempted && !valid ? "Password requirements not met" : undefined;
  const confirmError = attempted && valid && !matches ? "Passwords do not match" : undefined;

  function toLogin() {
    openSignup("login");
    router.push("/");
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;
    if (!valid || !matches) {
      setAttempted(true);
      (valid ? confirmRef : passwordRef).current?.focus();
      return;
    }
    setLoading(true);
    timer.current = setTimeout(toLogin, UPDATE_MS);
  }

  return (
    <main className="relative min-h-dvh flex flex-col bg-bg text-ink">
      <PageLogo />
      {/* equal spacers centre the form; the top one keeps it clear of the logo */}
      <div className="flex-1 flex flex-col items-center px-6 pt-20 pb-10 before:flex-1 before:content-[''] after:flex-[1.15] after:content-['']">
        <form className="w-[360px] max-w-full flex flex-col animate-[flRise_.5s_var(--ease-fl)_both]" noValidate onSubmit={onSubmit}>
          <PageTitle className="mb-12">Create a new password</PageTitle>

          <div className="flex flex-col gap-5">
            <PasswordField
              id="rpPassword"
              label="New Password"
              placeholder="Enter Password"
              autoComplete="new-password"
              inputRef={passwordRef}
              value={password}
              error={passwordError}
              errorIcon
              inputClassName="focus:border-ink"
              aria-controls="rpPasswordRules"
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => {
                setFocused(true);
                setTouched(true);
              }}
              onBlur={() => setFocused(false)}
              aside={
                touched && (
                  <PasswordRequirements
                    id="rpPasswordRules"
                    password={password}
                    showErrors={attempted}
                    collapsed={!focused && !passwordError}
                  />
                )
              }
            />
            <PasswordField
              id="rpConfirm"
              label="Confirm Password"
              placeholder="Enter Password"
              autoComplete="new-password"
              inputRef={confirmRef}
              value={confirm}
              error={confirmError}
              errorIcon
              inputClassName="focus:border-ink"
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          <Button
            variant="block"
            type="submit"
            className="mt-8"
            disabled={loading}
            aria-busy={loading}
            // keep focus in the field so its checklist doesn't collapse (and shift this button) mid-tap
            onPointerDown={(e) => e.preventDefault()}
          >
            {loading ? <Spinner className="size-5" /> : "Update Password"}
          </Button>

          <TextPrompt>
            {"Back to "}
            <TextButton onClick={toLogin}>Log in</TextButton>
          </TextPrompt>
        </form>
      </div>
    </main>
  );
}
