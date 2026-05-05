import { NavigationShell, NavigationUIProvider } from "@/_navigation";
import { PreloadedState } from "@/_store/preloader";

export function AppShell({
  children,
  preloadedState,
}: Readonly<{ children: React.ReactNode; preloadedState?: PreloadedState }>) {
  return (
    <NavigationUIProvider>
      <NavigationShell preloadedState={preloadedState} />
      {children}
    </NavigationUIProvider>
  );
}