import type { ProfileMePayload } from "./profileMePayload";

/**
 * Envelope success / failure, or DRF-style errors normalized with `success: false`.
 * Every variant includes `success` so narrowing works (avoid index signatures like `[key: string]: unknown`).
 */
export type ProfileMeApiResponse =
  | { success: true; data: ProfileMePayload }
  | {
      success: false;
      message?: string;
      detail?: string;
      code?: string;
      messages?: unknown[];
    };
