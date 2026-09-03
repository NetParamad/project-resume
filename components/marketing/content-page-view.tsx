import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumbs, type Crumb } from "@/components/seo/breadcrumbs";
import type { ContentSection, FaqItem } from "@/lib/content/types";

type LinkItem = { label: string; href: string };

export type ContentPageViewProps = {
  breadcrumbs: Crumb[];
  h1: string;
  intro: string;
  sections: ContentSection[];
  faq: FaqItem[];
  faqHeading: string;
  cta: { title: string; body: string; href: string; label: string };
  related?: { heading: string; links: LinkItem[] };
  readMore?: { heading: string; links: LinkItem[] };
};

/**
 * Shared layout for SEO landing pages and knowledge articles. The FAQ rendered
 * here is the source of truth that the page's FAQPage JSON-LD mirrors.
 */
export function ContentPageView({
  breadcrumbs,
  h1,
  intro,
  sections,
  faq,
  faqHeading,
  cta,
  related,
  readMore,
}: ContentPageViewProps) {
  return (
    <article className="max-w-3xl mx-auto px-5 py-12">
      <Breadcrumbs items={breadcrumbs} />

      <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{h1}</h1>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">{intro}</p>

      {sections.map((section) => (
        <section key={section.heading} className="mt-10">
          <h2 className="text-xl font-semibold mb-3">{section.heading}</h2>
          {section.body.map((p, i) => (
            <p key={i} className="text-sm leading-relaxed text-muted-foreground mb-3">
              {p}
            </p>
          ))}
          {section.bullets && (
            <ul className="mt-2 space-y-2">
              {section.bullets.map((b, i) => (
                <li
                  key={i}
                  className="text-sm leading-relaxed text-muted-foreground pl-4 border-l-2 border-border"
                >
                  {b}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      {faq.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold mb-4">{faqHeading}</h2>
          <dl className="divide-y divide-border border-t border-border">
            {faq.map((item) => (
              <div key={item.q} className="py-4">
                <dt className="text-sm font-semibold text-foreground">{item.q}</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className="mt-12 rounded-xl border border-border bg-card p-6 text-center">
        <h2 className="text-lg font-semibold">{cta.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{cta.body}</p>
        <Button asChild size="lg" className="mt-4">
          <Link href={cta.href}>{cta.label}</Link>
        </Button>
      </section>

      {(related?.links.length || readMore?.links.length) && (
        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          {related && related.links.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                {related.heading}
              </p>
              <ul className="space-y-2">
                {related.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                    >
                      {l.label}
                      <ArrowRight size={14} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {readMore && readMore.links.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                {readMore.heading}
              </p>
              <ul className="space-y-2">
                {readMore.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                    >
                      {l.label}
                      <ArrowRight size={14} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
