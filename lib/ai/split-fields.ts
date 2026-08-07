export function splitFields(
  content: string,
  order: string[],
): Record<string, string> {
  const parts = content.split("|").map((s) => s.trim());
  const result: Record<string, string> = {};
  order.forEach((key, i) => {
    const value = parts[i]?.trim();
    if (value) result[key] = value;
  });
  if (Object.keys(result).length === 0) result[order[0]] = content.trim();
  return result;
}
