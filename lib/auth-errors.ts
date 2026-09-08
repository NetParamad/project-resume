export function mapAuthError(message: string, t: (key: string) => string): string {
  const m = (message || "").toLowerCase();
  if (m.includes("invalid login credentials")) return t("invalidCredentials");
  if (m.includes("user already registered")) return t("userExists");
  // Supabase "leaked password protection" (HIBP) rejects known-breached passwords.
  if (m.includes("pwned") || m.includes("data breach") || m.includes("known to be weak")) {
    return t("passwordLeaked");
  }
  // Any password-policy rejection (min length / required characters).
  if (
    m.includes("at least 6 characters") ||
    m.includes("at least 8 characters") ||
    m.includes("password should be") ||
    m.includes("password is too weak") ||
    m.includes("does not meet")
  ) {
    return t("weakPassword");
  }
  return message || t("generic");
}
