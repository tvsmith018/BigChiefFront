import { NavigationShell } from "@/_navigation";
import { PreloadedState } from "@/_store/preloader";
import { NavigationUIProvider } from "@/_navigation";

export function AppShell({ children, preloadedState }: { children: React.ReactNode, preloadedState?: PreloadedState  }) {
  return (
    <>
      <NavigationUIProvider >
        <NavigationShell preloadedState={preloadedState}/>
        {children}
      </NavigationUIProvider>
    </>
  );
}