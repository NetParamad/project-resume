import { describe, it, expect } from "vitest";
import {
  loginSchema,
  signUpSchema,
  forgotPasswordSchema,
  updatePasswordSchema,
  emailSchema,
  passwordSchema,
} from "./auth";

describe("emailSchema", () => {
  it("accepts valid email", () => {
    expect(emailSchema.safeParse("user@example.com").success).toBe(true);
  });
  it("rejects missing @", () => {
    expect(emailSchema.safeParse("userexample.com").success).toBe(false);
  });
  it("rejects empty string", () => {
    expect(emailSchema.safeParse("").success).toBe(false);
  });
});

describe("passwordSchema", () => {
  it("accepts 6-char password", () => {
    expect(passwordSchema.safeParse("123456").success).toBe(true);
  });
  it("rejects 5-char password", () => {
    expect(passwordSchema.safeParse("12345").success).toBe(false);
  });
  it("rejects empty string", () => {
    expect(passwordSchema.safeParse("").success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    expect(
      loginSchema.safeParse({ email: "a@b.com", password: "123456" }).success,
    ).toBe(true);
  });
  it("rejects invalid email", () => {
    expect(
      loginSchema.safeParse({ email: "bad", password: "123456" }).success,
    ).toBe(false);
  });
  it("rejects short password", () => {
    expect(
      loginSchema.safeParse({ email: "a@b.com", password: "123" }).success,
    ).toBe(false);
  });
});

describe("signUpSchema", () => {
  it("accepts matching passwords", () => {
    const result = signUpSchema.safeParse({
      email: "a@b.com",
      password: "123456",
      repeatPassword: "123456",
    });
    expect(result.success).toBe(true);
  });
  it("rejects mismatched passwords", () => {
    const result = signUpSchema.safeParse({
      email: "a@b.com",
      password: "123456",
      repeatPassword: "654321",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("repeatPassword");
    }
  });
});

describe("forgotPasswordSchema", () => {
  it("accepts valid email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "a@b.com" }).success).toBe(
      true,
    );
  });
  it("rejects invalid email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "bad" }).success).toBe(
      false,
    );
  });
});

describe("updatePasswordSchema", () => {
  it("accepts matching passwords", () => {
    const result = updatePasswordSchema.safeParse({
      password: "123456",
      confirmPassword: "123456",
    });
    expect(result.success).toBe(true);
  });
  it("rejects mismatched passwords", () => {
    const result = updatePasswordSchema.safeParse({
      password: "123456",
      confirmPassword: "654321",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("confirmPassword");
    }
  });
  it("rejects short password", () => {
    expect(
      updatePasswordSchema.safeParse({
        password: "123",
        confirmPassword: "123",
      }).success,
    ).toBe(false);
  });
});
