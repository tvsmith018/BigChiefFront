import type { ProfileUserNode } from "./profileUser";

/** GraphQL `ProfileFollow` node (camelCase). */
export type ProfileFollowNode = {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  follower: ProfileUserNode;
  following: ProfileUserNode;
};
