"use client";

import { useReportWebVitals } from "next/web-vitals";

import { logInfo } from "@/_utilities/observability/logger";

type WebVitalMetric = {
  id: string;
  name: string;
  value: number;
  rating?: string;
  delta?: number;
  navigationType?: string;
};

export function WebVitalsReporter() {
  useReportWebVitals((metric: WebVitalMetric) => {
    logInfo("web_vital", {
      id: metric.id,
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      navigationType: metric.navigationType,
    });
  });

  return null;
}
