import { formatRelativeTime } from "@/_utilities/date/formatRelativeTime";

interface RelativeTimeProps {
  value: string | Date;
  fallback?: string;
}

export function RelativeTime({
  value,
  fallback = "Just now",
}: RelativeTimeProps) {
  try {
    return <span>{formatRelativeTime(value)}</span>;
  } catch {
    return <span>{fallback}</span>;
  }
}
