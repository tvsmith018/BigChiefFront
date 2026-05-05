import { fetchNavigationConfig } from "./navigation.cms";
import NavigationClientRoot from "../client/NavigationClientRoot";
import { NavigationUser } from "@/_types/navigation/navigation.types";

import { PreloadedState } from "@/_store/preloader";

export default async function NavigationShell({
  preloadedState,
}: Readonly<{ preloadedState?: PreloadedState }>) {
  const userData = preloadedState?.user?.data;
  const user: NavigationUser | undefined = userData
    ? {
        firstname: userData.firstname ?? "",
        lastname: userData.lastname ?? "",
        avatarURL: userData.avatarURL ?? userData.avatarUrl ?? userData.avatar,
      }
    : undefined;
  const isAuthenticated: boolean = preloadedState?.user?.isAuthenticated ?? false;

  const navConfig = await fetchNavigationConfig();
  return (
    <NavigationClientRoot
      isAuthenticated={isAuthenticated}
      user={user}
      sideLinks={navConfig}
    />
  );
}
