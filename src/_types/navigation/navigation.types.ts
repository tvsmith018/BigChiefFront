export type NavigationRole = "guest" | "user" | "admin";

export interface NavigationLink {
  label?: string;
  isDropdown?: boolean;
  route?: {
    label: string;
    category: string;
  };
  children?: {
    label: string;
    category: string;
  }[];
  id?: string;
  roles?: NavigationRole[];

  
  /**
   * Visibility rules
   * - undefined / empty → visible to everyone
   * - ["guest"] → guests only
   * - ["user"] → authenticated users
   * - ["admin"] → admins
   * - coming soon
   */
}

export interface NavigationUser {
  firstname: string;
  lastname: string;
  avatarURL?: string;
}