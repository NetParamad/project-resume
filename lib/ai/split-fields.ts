export function splitFields(
  content: string,
  order: string[],
): Record<string, string> {
  const trimmed = content.trim();
  const parts = trimmed.split("|").map((s) => s.trim());
  const result: Record<string, string> = {};

  if (parts.length > 1) {
    order.forEach((key, i) => {
      const isLast = i === order.length - 1;
      // Join any overflow segments back into the last field instead of
      // dropping them, in case the model's own content used a stray "|".
      const value = isLast ? parts.slice(i).join(" | ").trim() : parts[i]?.trim();
      if (value) result[key] = value;
    });
  }

  // No "|" found, or nothing matched: the model ignored the structured
  // format. Keep the whole answer in the last field (typically the
  // free-text description) rather than misfiling it under the first one.
  if (Object.keys(result).length === 0 && trimmed) {
    result[order[order.length - 1]] = trimmed;
  }

  return result;
}
