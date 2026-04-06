import Script from "next/script";
import { AppProviders } from "@/_core/providers/AppProviders";
import { AppShell } from "@/_core/layout/AppShell";
import { DevTools } from "@/_core/scripts/DevTools";
import { authProxy } from "@/_services/auth/authproxy";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await authProxy();
  const preloadedState = {
    user: user
      ? { isAuthenticated: true, data: user }
      : { isAuthenticated: false, data: undefined },
  };
  
    return (
    <html lang="en">
      <head>
        <meta
          httpEquiv="Content-Security-Policy"
          content="upgrade-insecure-requests"
        />
      </head>

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
      </body>
    </html>
  );
}
