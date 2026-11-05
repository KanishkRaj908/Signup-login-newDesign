import { z } from "zod";

export type PasswordRuleId = "length" | "number" | "upper" | "lower" | "special";

/** Checklist order and wording; each label is also the zod issue message for its rule. */
export const PASSWORD_RULES: { id: PasswordRuleId; label: string }[] = [
  { id: "length", label: "At least 8 characters" },
  { id: "number", label: "At least 1 number (0–9)" },
  { id: "upper", label: "At least 1 uppercase letter" },
  { id: "lower", label: "At least 1 lowercase letter" },
  { id: "special", label: "At least 1 special character" },
];

const label = (id: PasswordRuleId) => PASSWORD_RULES.find((r) => r.id === id)!.label;

/**
 * Sign-up / reset password policy. zod runs every check (string checks don't stop at the
 * first failure), so one parse reports all unmet rules. Reuse it on the server as-is.
 */
export const passwordSchema = z
  .string()
  .min(8, label("length"))
  .regex(/\d/, label("number"))
  .regex(/[A-Z]/, label("upper"))
  .regex(/[a-z]/, label("lower"))
  .regex(/[^A-Za-z0-9\s]/, label("special"));

export const emailSchema = z.email();

/** Which rules a password meets, keyed by rule id (drives the live checklist). */
export function checkPassword(pw: string): Record<PasswordRuleId, boolean> {
  const unmet = new Set(passwordSchema.safeParse(pw).error?.issues.map((i) => i.message));
  return Object.fromEntries(PASSWORD_RULES.map((r) => [r.id, !unmet.has(r.label)])) as Record<PasswordRuleId, boolean>;
}

export const meetsAllRules = (pw: string) => passwordSchema.safeParse(pw).success;

export const isEmail = (v: string) => emailSchema.safeParse(v).success;
