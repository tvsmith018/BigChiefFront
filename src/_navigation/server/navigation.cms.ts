// app/_views/navigation/server/navigation.cms.ts

import { NavigationLink } from "../../_types/navigation/navigation.types";
import localizationData from "@/_utilities/localization/en.json";

/**
 * Pretend CMS fetch.
 * Replace with GraphQL / REST later.
 */
export async function fetchNavigationConfig(session?:string): Promise<NavigationLink[]> {
  // This can be cached with `cache()` or `revalidate`
  return [
  {
    label: localizationData.sidebar_link1,
    isDropdown: true,
    id: "newsMenu",
    children: [
      { label: localizationData.sidebar_link1_drop2, category: "tea" },
      { label: localizationData.sidebar_link1_drop3, category: "sport" },
      { label: localizationData.sidebar_link1_drop4, category: "entertainment" },
      { label: localizationData.sidebar_link1_drop5, category: "technology" },
    ],
    roles: ["guest", "user", "admin"],
  },
  {
    isDropdown: false,
    route: { label: localizationData.sidebar_link2, category: "interview" },
    roles: ["guest", "user", "admin"],
  },
  {
    isDropdown: false,
    route: { label: localizationData.sidebar_link3, category: "music" },
    roles: ["guest", "user", "admin"],
  },
  {
    isDropdown: false,
    route: { label: localizationData.sidebar_link4, category: "podcast" },
    roles: ["guest", "user", "admin"],
  },
]
}
