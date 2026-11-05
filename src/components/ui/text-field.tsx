"use client";

import { useState, type ComponentProps, type ReactNode, type Ref } from "react";
import { AlertCircleIcon, EyeIcon, EyeOffIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

type TextFieldProps = Omit<ComponentProps<"input">, "ref"> & {
  label: string;
  inputRef?: Ref<HTMLInputElement>;
  /** shows a red border and this message below the input */
  error?: string;
  /** prefix the error with an alert icon */
  errorIcon?: boolean;
  /** icon button(s) inside the input, on the right */
  trailing?: ReactNode;
  /** extra content after the field (e.g. a popover); the field becomes its positioning context */
  aside?: ReactNode;
  /** a link at the right end of the label row ("Forgot Password?") */
  labelAction?: ReactNode;
  inputClassName?: string;
  errorClassName?: string;
};

/** Labelled sign-up input with error, read-only and trailing-action states. */
export function TextField({
  id,
  label,
  inputRef,
  error,
  errorIcon,
  trailing,
  aside,
  labelAction,
  readOnly,
  className,
  inputClassName,
  errorClassName,
  ...props
}: TextFieldProps) {
  const errorId = error ? `${id}-error` : undefined;
  const input = (
    <input
      ref={inputRef}
      id={id}
      readOnly={readOnly}
      aria-invalid={error ? true : undefined}
      aria-describedby={errorId}
      className={cn(
        "h-11 w-full border border-border-secondary rounded-[10px] bg-box py-2.5 px-3.5 [font-family:inherit] text-[14px] leading-5 font-medium text-ink outline-none",
        "transition-[border-color,box-shadow] duration-200 placeholder:text-placeholder placeholder:font-medium",
        "focus:border-box-line focus:shadow-[0_0_0_3px_rgba(23,23,23,.06)] not-light:focus:shadow-[0_0_0_3px_rgba(255,255,255,.08)]",
        trailing && "pr-10",
        readOnly && "bg-bg-tertiary text-tertiary border-transparent cursor-default focus:border-transparent focus:shadow-none not-light:focus:shadow-none",
        error &&
          "border-error-border focus:border-error-border focus:shadow-[0_0_0_3px_var(--error-ring)] not-light:focus:shadow-[0_0_0_3px_var(--error-ring)]",
        inputClassName,
      )}
      {...props}
    />
  );

  const labelEl = (
    <label htmlFor={id} className="text-[14px] leading-5 font-medium text-secondary text-left">
      {label}
    </label>
  );

  return (
    <div className={cn("flex flex-col gap-1.5", aside && "relative", className)}>
      {labelAction ? (
        <div className="flex items-center justify-between gap-3">
          {labelEl}
          {labelAction}
        </div>
      ) : (
        labelEl
      )}
      {trailing ? (
        <div className="relative">
          {input}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">{trailing}</div>
        </div>
      ) : (
        input
      )}
      {error && (
        <p
          id={errorId}
          className={cn("m-0 flex items-center gap-1.5 text-[14px] leading-5 text-error text-left [&_svg]:size-4 [&_svg]:flex-none", errorClassName)}
        >
          {errorIcon && <AlertCircleIcon />}
          {error}
        </p>
      )}
      {aside}
    </div>
  );
}

/** Password TextField with its own show/hide toggle. */
export function PasswordField(props: Omit<TextFieldProps, "type" | "trailing">) {
  const [shown, setShown] = useState(false);
  return (
    <TextField
      {...props}
      type={shown ? "text" : "password"}
      trailing={
        <FieldIconButton
          aria-label={shown ? "Hide password" : "Show password"}
          aria-pressed={shown}
          onClick={() => setShown((s) => !s)}
        >
          {shown ? <EyeOffIcon /> : <EyeIcon />}
        </FieldIconButton>
      }
    />
  );
}

/**
 * 28px icon button for use inside a TextField. It never takes focus on press, so the
 * focused field (and anything shown only while it's focused) doesn't collapse and
 * shift the layout under the pointer before the click lands.
 */
export function FieldIconButton({ className, ...props }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      onPointerDown={(e) => e.preventDefault()}
      className={cn(
        "size-7 p-0 border-0 rounded-md bg-transparent text-placeholder flex items-center justify-center transition-[background,color] duration-200 hover:bg-bg-tertiary hover:text-ink [&_svg]:size-4",
        className,
      )}
      {...props}
    />
  );
}
