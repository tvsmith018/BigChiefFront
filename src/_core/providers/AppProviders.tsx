"use client";

import { ReduxProvider } from "@/_store/provider/ReduxProvider";
import { PreloadedState } from "@/_store/preloader";

interface AppProvidersProps {
  children: React.ReactNode;
  preloadedState?: PreloadedState;
}

export function AppProviders({
  children,
  preloadedState,
}: Readonly<AppProvidersProps>) {
  return <ReduxProvider preloadedState={preloadedState}>{children}</ReduxProvider>;
}