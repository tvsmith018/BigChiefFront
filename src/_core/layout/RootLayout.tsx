import Script from "next/script";
import { AppProviders } from "@/_core/providers/AppProviders";
import { AppShell } from "@/_core/layout/AppShell";
import { DevTools } from "@/_core/scripts/DevTools";
import { headers } from 'next/headers'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const headerList = await headers()
  const userData = headerList.get('userdata')
  const user = userData ? JSON.parse(userData):null
  const preloadedState = {
    user: user.user == null || user.user.detail != null
      ? { isAuthenticated: false, data: undefined, accessRefresh:user.accessRefresh }:{ isAuthenticated: true, data: user, accessRefresh:user.accessRefresh },
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