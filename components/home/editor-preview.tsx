export function EditorPreview() {
  return (
    <section className="pb-16">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-primary/5 animate-fade-in-up [animation-delay:300ms]">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <div className="h-3 w-3 rounded-full bg-destructive/60" />
          <div className="h-3 w-3 rounded-full bg-primary/40" />
          <div className="h-3 w-3 rounded-full bg-muted-foreground/30" />
          <span className="ml-2 text-xs text-muted-foreground">
            Resume Builder
          </span>
        </div>
        <div className="grid gap-0 sm:grid-cols-3">
          <div className="bg-muted/50 p-6 sm:border-b-0 sm:border-r">
            <div className="flex flex-col gap-3">
              <div className="h-3 w-3/4 rounded bg-primary/20" />
              <div className="h-2 w-full rounded bg-muted-foreground/10" />
              <div className="h-2 w-5/6 rounded bg-muted-foreground/10" />
              <div className="mt-4 h-3 w-2/3 rounded bg-primary/20" />
              <div className="h-2 w-full rounded bg-muted-foreground/10" />
              <div className="h-2 w-4/5 rounded bg-muted-foreground/10" />
              <div className="mt-4 h-3 w-1/2 rounded bg-primary/20" />
              <div className="h-2 w-full rounded bg-muted-foreground/10" />
            </div>
          </div>
          <div className="col-span-1 sm:col-span-2 p-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/15" />
                <div className="flex flex-col gap-1.5">
                  <div className="h-4 w-32 rounded bg-foreground/15" />
                  <div className="h-2.5 w-24 rounded bg-muted-foreground/10" />
                </div>
              </div>
              <div className="mt-2 h-px bg-border" />
              <div className="flex flex-col gap-2">
                <div className="h-3 w-28 rounded bg-primary/20" />
                <div className="h-2 w-full rounded bg-muted-foreground/10" />
                <div className="h-2 w-11/12 rounded bg-muted-foreground/10" />
                <div className="h-2 w-3/4 rounded bg-muted-foreground/10" />
              </div>
              <div className="flex flex-col gap-2">
                <div className="h-3 w-20 rounded bg-primary/20" />
                <div className="h-2 w-full rounded bg-muted-foreground/10" />
                <div className="h-2 w-5/6 rounded bg-muted-foreground/10" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
