"use client";

import { ReduxProvider } from "@/_store/provider/ReduxProvider";
import { PreloadedState } from "@/_store/preloader";

export function AppProviders({ children, preloadedState }: { children: React.ReactNode, preloadedState?: PreloadedState }) {
  return <ReduxProvider preloadedState={preloadedState}>{children}</ReduxProvider>;
}