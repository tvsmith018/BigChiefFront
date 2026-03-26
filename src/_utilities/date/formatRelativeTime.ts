import { calculateRelativeTime } from "./relativeTime";

export function formatRelativeTime(
  dateInput: string | Date,
  now: Date = new Date()
): string {
  const date =
    typeof dateInput === "string" ? new Date(dateInput) : dateInput;

  const result = calculateRelativeTime(date, now);

  if (!result) return "Just now";

  const { value, unit } = result;

  return `${value} ${unit}${value === 1 ? "" : "s"} ago`;
}
