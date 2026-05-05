import type { MemberProfilePayload } from "./memberProfilePayload";

export type MemberProfileApiResponse =
  | { success: true; data: MemberProfilePayload }
  | {
      success: false;
      message?: string;
      detail?: string;
    };
