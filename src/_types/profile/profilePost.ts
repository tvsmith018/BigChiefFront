/** GraphQL `ProfilePost` node (camelCase). */
export type ProfilePostNode = {
  id: string;
  body: string;
  status: string;
  likesCount: number;
  repliesCount: number;
  metadata: unknown;
  createdAt: string;
  updatedAt: string;
  article?: {
    id: string;
    title?: string | null;
    image1x1Url?: string | null;
    altImage?: string | null;
    category?: string | null;
  } | null;
};
