/**
 * User from REST `/profiles/me`.
 */
export type ProfileUser = {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  bio: string;
  dob: string | null;
  avatar: string | null;
};

/**
 * GraphQL `UserNode` fragment for member-profile queries (Relay global `id`).
 */
export type ProfileUserNode = {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  avatarUrl?: string | null;
};
