// app/_views/navigation/server/NavigationShell.tsx

import { fetchNavigationConfig } from "./navigation.cms";
import NavigationClientRoot from "../client/NavigationClientRoot";
import { NavigationUser } from "@/_types/navigation/navigation.types";

import { PreloadedState } from "@/_store/preloader";

export default async function NavigationShell({ preloadedState }: { preloadedState?: PreloadedState  }) {
  const userData = preloadedState?.user?.data;
  const user: NavigationUser | undefined = userData
    ? {
        firstname: userData.firstname ?? "",
        lastname: userData.lastname ?? "",
        avatarURL: userData.avatarURL ?? userData.avatarUrl ?? userData.avatar,
      }
    : undefined;
  const isAuthenticated: boolean = preloadedState?.user?.isAuthenticated ?? false
  /** 
   * 2. Resolve roles
   * Later: decode JWT / session
   */
  // const roles = isAuthenticated ? ["user"] : ["guest"];

  /**
   * 3. Fetch nav config from CMS
   */
  const navConfig = await fetchNavigationConfig();

  /**
   * 4. Filter links on server
   */
  // const visibleLinks = UseNavigationVisibility(navConfig, {
  //   isAuthenticated,
  // });

  /**
   * 5. Pass minimal data to client
   */
  return (
    <NavigationClientRoot
      isAuthenticated={isAuthenticated}
      user={user}
      sideLinks={navConfig}
    />
  );
}
