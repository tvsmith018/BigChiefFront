import Script from "next/script";
import { AppProviders } from "@/_core/providers/AppProviders";
import { AppShell } from "@/_core/layout/AppShell";
import { DevTools } from "@/_core/scripts/DevTools";
import { WebVitalsReporter } from "@/_core/observability/WebVitalsReporter";
import { authProxy } from "@/_services/auth/authproxy";

interface RootLayoutProps {
  children: React.ReactNode;
}

/** Syncs session on every request: refresh access (~20m backend TTL), validate /me, clear cookies if invalid. Cached per request via `authProxy`. */
export default async function RootLayout({
  children,
}: Readonly<RootLayoutProps>) {
  const user = await authProxy();
  const preloadedState = {
    user: user
      ? { isAuthenticated: true, data: user }
      : { isAuthenticated: false, data: undefined },
  };
  
    return (
    <html lang="en">
      <body>
        <AppProviders preloadedState={preloadedState}>
          <AppShell preloadedState={preloadedState}>{children}</AppShell>
        </AppProviders>

        {/* Vendor scripts */}
        <Script
          src="/assets/vendor/sticky-js/sticky.min.js"
          strategy="afterInteractive"
        />
        <Script
          src="/assets/js/functions.js"
          strategy="afterInteractive"
        />

        <DevTools />
        <WebVitalsReporter />
      </body>
    </html>
  );
}
