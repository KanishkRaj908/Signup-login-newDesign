"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { PencilIcon } from "@/components/icons";
import { PasswordRequirements } from "@/components/signup/password-requirements";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { FieldIconButton, PasswordField, TextField } from "@/components/ui/text-field";
import { isEmail, meetsAllRules } from "@/lib/password";

type Step = "email" | "password";

/** Simulated network latency for the prototype. */
const CHECK_EMAIL_MS = 900;
const SUBMIT_MS = 1100;

const WRONG_PASSWORD = "Wrong password. Try again or click “Forgot password?”";

type Props = {
  mode?: "signup" | "login";
  open: boolean;
  initialEmail?: string;
  /** the account was created (sign-up) or the password accepted (login) */
  onDone: () => void;
  /** login only: "Forgot Password?" with the email entered so far */
  onForgot?: (email: string) => void;
};

/**
 * Email → password form. Sign-up checks the password rules; login checks the password
 * (in this prototype any password that would pass the sign-up rules is "correct").
 * Remount (via key) to reset it.
 */
export function SignupForm({ mode = "signup", open, initialEmail = "", onDone, onForgot }: Props) {
  const signup = mode === "signup";
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState(initialEmail);
  const [emailError, setEmailError] = useState<string>();
  const [password, setPassword] = useState("");
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [wrongPassword, setWrongPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => emailRef.current?.focus(), 650);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const passwordValid = signup ? meetsAllRules(password) : password.length > 0;
  const passwordError = wrongPassword
    ? WRONG_PASSWORD
    : attempted && !passwordValid
      ? signup
        ? "Password requirements not met"
        : "Please enter your password"
      : undefined;

  function submitEmail() {
    const v = email.trim();
    if (!v) return setEmailError("Please enter an Email ID");
    if (!isEmail(v)) return setEmailError("Please enter a valid Email ID");
    setLoading(true);
    timer.current = setTimeout(() => {
      setLoading(false);
      setStep("password");
      requestAnimationFrame(() => passwordRef.current?.focus());
    }, CHECK_EMAIL_MS);
  }

  function submitPassword() {
    if (!passwordValid) {
      setAttempted(true);
      passwordRef.current?.focus();
      return;
    }
    setLoading(true);
    timer.current = setTimeout(() => {
      setLoading(false);
      if (!signup && !meetsAllRules(password)) {
        setWrongPassword(true);
        passwordRef.current?.focus();
        return;
      }
      onDone();
    }, SUBMIT_MS);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;
    if (step === "email") submitEmail();
    else submitPassword();
  }

  function editEmail() {
    setStep("email");
    setAttempted(false);
    setWrongPassword(false);
    requestAnimationFrame(() => emailRef.current?.focus());
  }

  return (
    <form className="w-full flex flex-col gap-8" noValidate onSubmit={onSubmit}>
      <div className="flex flex-col gap-5">
        <TextField
          id="suEmail"
          label="Email ID"
          type="email"
          placeholder="Enter your Email ID"
          autoComplete="email"
          inputRef={emailRef}
          value={email}
          readOnly={step === "password"}
          error={step === "email" ? emailError : undefined}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError(undefined);
          }}
          trailing={
            step === "password" && (
              <FieldIconButton aria-label="Edit email" onClick={editEmail}>
                <PencilIcon />
              </FieldIconButton>
            )
          }
        />

        {step === "password" && (
          <PasswordField
            id="suPassword"
            label={signup ? "Set Password" : "Password"}
            className="animate-[flRise_.35s_ease_both]"
            placeholder="Enter Password"
            autoComplete={signup ? "new-password" : "current-password"}
            inputRef={passwordRef}
            value={password}
            error={passwordError}
            errorIcon
            errorClassName="items-start [&_svg]:mt-0.5"
            inputClassName="focus:border-ink"
            aria-controls={signup ? "suPasswordRules" : undefined}
            onChange={(e) => {
              setPassword(e.target.value);
              setWrongPassword(false);
            }}
            onFocus={() => {
              setPasswordFocused(true);
              setPasswordTouched(true);
            }}
            onBlur={() => setPasswordFocused(false)}
            labelAction={
              !signup && (
                <button
                  type="button"
                  className="p-0 border-0 bg-transparent [font-family:inherit] text-[14px] leading-5 font-medium text-link underline underline-offset-2 cursor-pointer hover:opacity-80"
                  onClick={() => onForgot?.(email.trim())}
                >
                  Forgot Password?
                </button>
              )
            }
            aside={
              signup &&
              passwordTouched && (
                <PasswordRequirements
                  id="suPasswordRules"
                  password={password}
                  showErrors={attempted}
                  collapsed={!passwordFocused && !passwordError}
                />
              )
            }
          />
        )}
      </div>

      <Button
        variant="block"
        type="submit"
        disabled={loading}
        aria-busy={loading}
        // keep focus in the field so its checklist doesn't collapse (and shift this button) mid-tap
        onPointerDown={(e) => e.preventDefault()}
      >
        {loading ? <Spinner className="size-5" /> : step === "email" ? "Continue" : signup ? "Create your account" : "Log in"}
      </Button>
    </form>
  );
}
