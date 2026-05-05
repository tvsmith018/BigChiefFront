import { httpClient, graphQLClient } from "@/_network";
import { PROFILE_ENDPOINTS } from "@/_network/config/endpoints";
import { member_profile_query } from "@/_queries";
import type { ProfileMeApiResponse } from "@/_types/profile/profileMeApiResponse";
import type { MemberProfileApiResponse } from "@/_types/profile/memberProfileApiResponse";
import type {
  ProfileFollowNode,
  ProfileImageNode,
  ProfilePostNode,
  ProfileSettingsNode,
  ProfileUserNode,
} from "@/_types/profile/memberProfilePayload";
import { logWarn } from "@/_utilities/observability/logger";
import { parseProfileUserIdParam } from "./parseProfileUserIdParam";

interface Edge<T> {
  node: T;
}

interface MemberProfileGraphQLData {
  users: {
    edges: Edge<ProfileUserNode>[];
  };
  userProfileSettings: {
    edges: Edge<ProfileSettingsNode>[];
  };
  followers: {
    edges: Edge<ProfileFollowNode>[];
  };
  following: {
    edges: Edge<ProfileFollowNode>[];
  };
  profilePosts: {
    edges: Edge<ProfilePostNode>[];
  };
  profileImages: {
    edges: Edge<ProfileImageNode>[];
  };
}

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

  /**
   * Load another member's profile data via GraphQL.
   * `userIdParam` is the dynamic route segment (numeric id or Relay global id string).
   */
  static async getMemberProfile(
    userIdParam: string,
    options?: RequestInit & { next?: { revalidate?: number } }
  ): Promise<MemberProfileApiResponse> {
    const userId = parseProfileUserIdParam(userIdParam);
    if (userId === null) {
      return {
        success: false,
        message: "Invalid profile id.",
      };
    }

    const variables = {
      userId,
      firstFollows: 30,
      firstPosts: 30,
      firstImages: 20,
    };

    try {
      const data = await graphQLClient.query<MemberProfileGraphQLData>(
        member_profile_query,
        variables,
        { cache: "no-store", ...options }
      );

      const user = data.users?.edges?.[0]?.node;
      if (!user) {
        return {
          success: false,
          message: "User not found.",
        };
      }

      const settings = data.userProfileSettings?.edges?.[0]?.node ?? null;

      const followers = (data.followers?.edges ?? []).map((e) => e.node);
      const following = (data.following?.edges ?? []).map((e) => e.node);
      const posts = (data.profilePosts?.edges ?? []).map((e) => e.node);
      const images = (data.profileImages?.edges ?? []).map((e) => e.node);

      return {
        success: true,
        data: {
          user,
          settings,
          followers,
          following,
          posts,
          images,
        },
      };
    } catch (error: unknown) {
      logWarn("member_profile_graphql_failed", {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        success: false,
        message: "Unable to load this profile right now.",
      };
    }
  }
}
