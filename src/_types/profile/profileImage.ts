/** GraphQL `ProfileImage` node (camelCase). */
export type ProfileImageNode = {
  id: string;
  caption?: string | null;
  visibility: string;
  sortOrder: number;
  isFeatured: boolean;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};
