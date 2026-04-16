import { httpClient } from "@/_network";
import { PROFILE_ENDPOINTS } from "@/_network/config/endpoints";
import type { ProfileMeApiResponse } from "@/_types/profile/profileMeApiResponse";

export class ProfileService {
  /**
   * GET /profiles/me/ — current user profile shell (user + settings + stats).
   * Pass `Authorization: Bearer <access>` in headers when not relying on session cookies.
   */
  static async getProfileMe(options?: {
    headers?: Record<string, string>;
    credentials?: RequestCredentials;
  }): Promise<ProfileMeApiResponse> {
    return httpClient.request<ProfileMeApiResponse>(
      PROFILE_ENDPOINTS.me,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
        credentials: options?.credentials ?? "include",
      },
      { cache: "no-store" }
    );
  }
}
