export type RelativeTimeUnit =
  | "year"
  | "month"
  | "week"
  | "day"
  | "hour"
  | "minute";

interface RelativeTimeResult {
  value: number;
  unit: RelativeTimeUnit;
}

/**
 * Calculates the most significant relative time unit.
 */
export function calculateRelativeTime(
  from: Date,
  to: Date = new Date()
): RelativeTimeResult | null {
  const diffMs = to.getTime() - from.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 5) return null;

  const units: [RelativeTimeUnit, number][] = [
    ["year", 525600],
    ["month", 43800],
    ["week", 10080],
    ["day", 1440],
    ["hour", 60],
    ["minute", 1],
  ];

  for (const [unit, minutes] of units) {
    const value = Math.floor(diffMinutes / minutes);
    if (value >= 1) {
      return { value, unit };
    }
  }

  return null;
}
