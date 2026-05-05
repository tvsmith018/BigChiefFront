

"use client";

import NavigationTopBar from "./NavigationTopBar";
import NavigationPrimary from "./NavigationPrimary";
import { NavigationLink, NavigationUser } from "../../_types/navigation/navigation.types";
import { NAVIGATION_TOP_LINKS } from "../config/navigation.config";

interface Props {
  isAuthenticated: boolean;
  user?: NavigationUser;
  sideLinks: NavigationLink[];
}

export default function NavigationClientRoot({
  isAuthenticated: _isAuthenticated,
  user: _user,
  sideLinks,
}: Props) {
  return (
    
      <header className="navbar-light navbar-sticky header-static">
        <NavigationTopBar
          links={NAVIGATION_TOP_LINKS}
        />

        <NavigationPrimary
          sideLinks={sideLinks}
        />
      </header>
  );
}
