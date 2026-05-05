import type { Viewport, Metadata } from 'next'
import RootLayout  from "@/_core/layout/RootLayout";

import "bootstrap-icons/font/bootstrap-icons.css"
import  "bootstrap/dist/css/bootstrap.min.css"
import 'swiper/css';
import "./globals.css"

interface AppLayoutProps {
  children: React.ReactNode;
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: "Big Chief Ent",
  applicationName: "Big Chief Entertainment",
  creator: "Terrance V. Smith",
  publisher: "Software Innovation LLC",
  category: "Hip-hop Blog",
  icons: {
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      {
        url: "/apple-touch-icon-precomposed.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  keywords: [
    "hip-hop",
    "big chief",
    "big chief ent",
    "bce",
    "hip-hop blog",
    "podcast",
    "interview",
    "content",
  ],
  openGraph: {
    title: "Big Chief Ent",
    description:
      "Big Chief Ent is a hip-hop blog site based out of Raleigh NC.",
    siteName: "Big Chief Ent",
  },
};

export default function Layout({
  children,
}: Readonly<AppLayoutProps>) {
  return <RootLayout>{children}</RootLayout>;
}
