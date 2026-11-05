export type PasswordRule = { id: string; label: string; test: (pw: string) => boolean };

export const PASSWORD_RULES: PasswordRule[] = [
  { id: "length", label: "At least 8 characters", test: (pw) => pw.length >= 8 },
  { id: "number", label: "At least 1 number (0–9)", test: (pw) => /\d/.test(pw) },
  { id: "upper", label: "At least 1 uppercase letter", test: (pw) => /[A-Z]/.test(pw) },
  { id: "lower", label: "At least 1 lowercase letter", test: (pw) => /[a-z]/.test(pw) },
  { id: "special", label: "At least 1 special character", test: (pw) => /[^A-Za-z0-9\s]/.test(pw) },
];

export const meetsAllRules = (pw: string) => PASSWORD_RULES.every((r) => r.test(pw));

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
