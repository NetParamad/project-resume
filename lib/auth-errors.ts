export function mapAuthError(message: string, t: (key: string) => string): string {
  const m = (message || "").toLowerCase();
  if (m.includes("invalid login credentials")) return t("invalidCredentials");
  if (m.includes("user already registered")) return t("userExists");
  if (m.includes("at least 6 characters")) return t("weakPassword");
  return message || t("generic");
}
