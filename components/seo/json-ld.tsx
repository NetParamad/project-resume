import { Fragment } from "react";

type JsonLdObject = Record<string, unknown>;

/**
 * Renders one or more JSON-LD structured-data blocks.
 * Server component — the markup is present in the initial HTML for crawlers.
 */
export function JsonLd({ data }: { data: JsonLdObject | JsonLdObject[] }) {
  const blocks = Array.isArray(data) ? data : [data];
  return (
    <>
      {blocks.map((block, i) => (
        <Fragment key={i}>
          <script
            type="application/ld+json"
            // JSON.stringify output is safe to inline; no user HTML here.
            dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
          />
        </Fragment>
      ))}
    </>
  );
}
