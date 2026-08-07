"use client";

import { useTranslations, useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { CreateNewDialog } from "@/components/dashboard/CreateNewDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { House, FileText, PlusCircle, User, LogOut, ChevronDown, BookOpen } from "lucide-react";

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`relative text-sm font-medium transition-colors after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:rounded-full after:bg-primary after:origin-left after:scale-x-0 after:transition-transform after:duration-300 hover:text-foreground hover:after:scale-x-100 ${
        active ? "text-foreground after:scale-x-100" : "text-muted-foreground"
      }`}
    >
      {children}
    </Link>
  );
}

function TabItem({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors ${
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon size={20} />
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}

export function Navbar() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;
  const isDashboard = pathname.startsWith(`/${locale}/dashboard`);
  const isKnowledge = pathname.startsWith(`/${locale}/knowledge`);

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between h-12 px-4 border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link href={`/${locale}`} className="font-semibold text-sm">
            {t("app.title")}
          </Link>
          <Link
            href={`/${locale}/knowledge/cv-vs-resume`}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("nav.knowledge")}
          </Link>
        </div>
        <div className="flex items-center gap-1">
          <LocaleSwitcher />
        </div>
      </div>

      {/* Desktop navbar */}
      <nav className="hidden md:flex h-16 border-b border-border items-center px-6 sticky top-0 z-50 bg-background/95 backdrop-blur">
        <Link
          href={`/${locale}`}
          className="font-semibold text-lg mr-8"
        >
          {t("app.title")}
        </Link>
        <div className="flex items-center gap-6">
          <NavLink href={`/${locale}`} active={isHome}>
            {t("nav.home")}
          </NavLink>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`text-sm font-medium transition-colors hover:text-foreground flex items-center gap-1 ${
                  isKnowledge ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {t("nav.knowledge")}
                <ChevronDown size={14} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-56">
              <DropdownMenuItem asChild>
                <Link href={`/${locale}/knowledge/cv-vs-resume`} className="cursor-pointer">
                  <BookOpen size={14} className="mr-2" />
                  {t("knowledge.cvVsResume.title")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/${locale}/knowledge/how-to-use`} className="cursor-pointer">
                  <BookOpen size={14} className="mr-2" />
                  {t("knowledge.howToUse.title")}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {user && (
            <NavLink href={`/${locale}/dashboard`} active={isDashboard}>
              {t("nav.dashboard")}
            </NavLink>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <LocaleSwitcher />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full" aria-label={t("nav.profile")}>
                  <User size={18} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-sm text-muted-foreground truncate">
                  {user.email}
                </div>
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/dashboard`} className="cursor-pointer">
                    <FileText size={14} className="mr-2" />
                    {t("nav.dashboard")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut size={14} className="mr-2" />
                  {t("nav.signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href={`/${locale}/auth/login`}>{t("nav.signIn")}</Link>
              </Button>
              <Button asChild size="sm">
                <Link href={`/${locale}/auth/sign-up`}>{t("nav.signUp")}</Link>
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background">
        <div className="flex items-center justify-around h-16 px-2">
          <TabItem
            href={`/${locale}`}
            icon={House}
            label={t("nav.home")}
            active={isHome}
          />
          {user && (
            <TabItem
              href={`/${locale}/dashboard`}
              icon={FileText}
              label={t("nav.dashboard")}
              active={isDashboard}
            />
          )}
          {user && (
            <CreateNewDialog open={createOpen} onOpenChange={setCreateOpen}>
              <button
                type="button"
                className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
              >
                <PlusCircle size={20} />
                <span className="text-[10px] font-medium">{t("nav.new")}</span>
              </button>
            </CreateNewDialog>
          )}
          <TabItem
            href={user ? `/${locale}/dashboard` : `/${locale}/auth/login`}
            icon={User}
            label={user ? t("nav.profile") : t("nav.signIn")}
          />
        </div>
      </nav>
    </>
  );
}
