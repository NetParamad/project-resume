import { z } from "zod";
import {
  MIN_PASSWORD_LENGTH,
  MIN_CHARACTER_CLASSES,
  characterClasses,
  evaluatePassword,
} from "./password-strength";

export const emailSchema = z.string().email();

/**
 * Policy for a NEW password (sign-up / password reset). Keep this in sync with
 * `evaluatePassword` — same length, variety, common-list, and email rules.
 */
export const passwordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH, "passwordTooShort")
  .refine((v) => characterClasses(v) >= MIN_CHARACTER_CLASSES, "passwordNeedsVariety")
  .refine((v) => {
    const s = evaluatePassword(v);
    return s.acceptable || s.reason !== "tooCommon";
  }, "passwordTooCommon");

/**
 * Login must NOT apply the new-password policy — accounts created under the old
 * rules still need to sign in. Supabase validates the real credential.
 */
export const loginPasswordSchema = z.string().min(1);

export const loginSchema = z.object({
  email: emailSchema,
  password: loginPasswordSchema,
});

export const signUpSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    repeatPassword: z.string(),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "passwordsDoNotMatch",
    path: ["repeatPassword"],
  })
  .refine((data) => evaluatePassword(data.password, data.email).acceptable, {
    message: "passwordContainsEmail",
    path: ["password"],
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const updatePasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "passwordsDoNotMatch",
    path: ["confirmPassword"],
  });
