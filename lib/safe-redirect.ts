/**
 * Validate that `next` is a safe relative path:
 *  - starts with /
 *  - does not contain // (protocol-relative or path escalation)
 *  - no spaces or newlines (null-byte injection)
 */
export function isSafeRedirect(next: string): boolean {
  return (
    next.startsWith("/") &&
    !next.startsWith("//") &&
    !/[\s\n\r]/.test(next) &&
    !next.includes("\0")
  );
}
