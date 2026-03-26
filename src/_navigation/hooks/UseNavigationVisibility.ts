// useNavigationVisibility.ts

import { NavigationLink, NavigationRole } from "../../_types/navigation/navigation.types";

interface VisibilityContext {
  isAuthenticated: boolean;
  roles?: NavigationRole[];
}

/**
 * Filters navigation links based on visibility rules.
 * If no roles are defined → link is always visible.
 */
export function UseNavigationVisibility(
  links: NavigationLink[],
  { isAuthenticated, roles = [] }: VisibilityContext
): NavigationLink[] {
  return links.filter((link) => {
    // No role rules → visible to everyone
    if (!link.roles || link.roles.length === 0) {
      return true;
    }

    // Guest-only access
    if (!isAuthenticated && link.roles.includes("guest")) {
      return true;
    }

    // Auth required but user not logged in
    if (!isAuthenticated) {
      return false;
    }

    // Check role intersection
    return link.roles.some((role) => roles.includes(role));
  });
}
