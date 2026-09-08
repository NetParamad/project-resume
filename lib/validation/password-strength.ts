/**
 * Shared password policy + strength grading. Framework-free so the zod schema,
 * the sign-up / update-password forms, and tests all agree on one definition.
 *
 * Policy for a NEW password: at least MIN_PASSWORD_LENGTH characters, a mix of
 * at least MIN_CHARACTER_CLASSES of {lowercase, uppercase, digit, symbol}, not
 * a well-known common password, and not built from the email address.
 *
 * NOTE: client checks are a UX aid, not a security boundary. Also enable
 * Supabase Auth's minimum length + "leaked password protection" in the
 * project dashboard so the rules hold server-side.
 */

export const MIN_PASSWORD_LENGTH = 8;
export const MIN_CHARACTER_CLASSES = 3;
/** Length at which we stop nagging about character variety. */
export const STRONG_LENGTH = 16;

/** Lowercased; matched case-insensitively against the whole password. */
const COMMON_PASSWORDS = new Set([
  "password", "password1", "password12", "password123", "passw0rd", "p@ssw0rd",
  "12345678", "123456789", "1234567890", "123123123", "11111111", "00000000",
  "qwerty123", "qwertyuiop", "1q2w3e4r", "1qaz2wsx", "zaq12wsx", "qazwsxedc",
  "iloveyou", "letmein", "welcome", "welcome1", "admin123", "administrator",
  "changeme", "trustno1", "sunshine", "princess", "football", "baseball",
  "superman", "batman123", "michael1", "monkey123", "dragon123", "master123",
]);

export type CheckId = "length" | "lower" | "upper" | "digit" | "symbol";

export interface PasswordCheck {
  id: CheckId;
  met: boolean;
}

export function passwordChecks(password: string): PasswordCheck[] {
  return [
    { id: "length", met: password.length >= MIN_PASSWORD_LENGTH },
    { id: "lower", met: /[a-z]/.test(password) },
    { id: "upper", met: /[A-Z]/.test(password) },
    { id: "digit", met: /\d/.test(password) },
    { id: "symbol", met: /[^A-Za-z0-9]/.test(password) },
  ];
}

/** Count of distinct character classes present (excludes the length check). */
export function characterClasses(password: string): number {
  return passwordChecks(password).filter((c) => c.id !== "length" && c.met).length;
}

export type StrengthReason =
  | "tooShort"
  | "tooCommon"
  | "containsEmail"
  | "needsVariety";

export interface PasswordStrength {
  /** 0 empty · 1 very weak · 2 weak · 3 good · 4 strong */
  score: 0 | 1 | 2 | 3 | 4;
  /** Meets the minimum policy for a new password. */
  acceptable: boolean;
  /** Why it is not acceptable yet (absent once acceptable). */
  reason?: StrengthReason;
}

function emailLocalPart(email: string | undefined | null): string | null {
  const local = email?.split("@")[0]?.toLowerCase().trim();
  return local && local.length >= 4 ? local : null;
}

export function evaluatePassword(
  password: string,
  email?: string | null,
): PasswordStrength {
  if (password.length === 0) return { score: 0, acceptable: false, reason: "tooShort" };
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { score: 1, acceptable: false, reason: "tooShort" };
  }

  const lower = password.toLowerCase();
  if (COMMON_PASSWORDS.has(lower)) {
    return { score: 1, acceptable: false, reason: "tooCommon" };
  }

  const local = emailLocalPart(email);
  if (local && lower.includes(local)) {
    return { score: 1, acceptable: false, reason: "containsEmail" };
  }

  const classes = characterClasses(password);
  if (classes < MIN_CHARACTER_CLASSES) {
    return { score: 2, acceptable: false, reason: "needsVariety" };
  }

  let score: PasswordStrength["score"] = 3;
  if (password.length >= 12 && classes >= MIN_CHARACTER_CLASSES) score = 4;
  if (password.length >= STRONG_LENGTH) score = 4;
  if (password.length < 10 && classes === MIN_CHARACTER_CLASSES) score = 3;

  return { score, acceptable: true };
}

/** True when `password` is allowed for a NEW credential (sign-up / reset). */
export function isAcceptablePassword(password: string, email?: string | null): boolean {
  return evaluatePassword(password, email).acceptable;
}
