// app/_navigation/index.ts

// Root / layout entry
export { default as NavigationShell } from "./server/NavigationShell";

// export const NavigationShell = dynamic(async ()=>import("./server/NavigationShell"), {ssr:true})

// // Primary UI pieces (optional but useful)
// export { default as NavigationClientRoot} from "./client/NavigationClientRoot"
// export { default as NavigationPrimary } from "./client/NavigationPrimary";
// export { default as NavigationTopBar } from "./client/NavigationTopBar";

// // Context (UI state)
export {
  NavigationUIProvider,
  useNavigationUI,
} from "./context/NavigationUIContext";

export {
  createSession,
  refreshSession,
  deleteSession,
  getUserID,
  getSession,
} from "./server/session";

// // Hooks
// export { useNavigationSearch } from "./hooks/UseNavigationSearch";
// export { UseNavigationVisibility } from "./hooks/UseNavigationVisibility";

// // Config + types (read-only usage)
// export * from "./config/navigation.config";
// // export * from "./config/navigation.types";
