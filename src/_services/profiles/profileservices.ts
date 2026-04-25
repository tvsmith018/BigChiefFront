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
    try {
      const response = await httpClient.request<unknown>(
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

      if (response && typeof response === "object" && "success" in response) {
        return response as ProfileMeApiResponse;
      }

      return {
        success: false,
        message: "Profile response format was invalid.",
      };
    } catch {
      return {
        success: false,
        message: "Unable to load profile right now.",
      };
    }
  }
}
