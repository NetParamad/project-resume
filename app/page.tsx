import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function RootPage() {
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language") || "";
  const preferredLocale = acceptLanguage.startsWith("th") ? "th" : "en";
  redirect(`/${preferredLocale}`);
}
