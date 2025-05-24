import dynamic from 'next/dynamic'
// import { Inter } from "next/font/google";
import type { Viewport } from 'next'
import Script from "next/script";
import type { Metadata } from "next";

import "bootstrap-icons/font/bootstrap-icons.css"
import  "bootstrap/dist/css/bootstrap.min.css"
import 'swiper/css';
import "./globals.css"

const DynamicNav = dynamic(async ()=> import('../_views/navigation/NavigationView'))
// const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title:"Big Chief Ent",
  authors: {name: "Terrance V. Smith", url:"softwareinnovationsllc2.com"},
  openGraph:{
    title:"Big Chief Ent",
    description:"This is the Home page to Big Chief Ent.  Big Chief Ent is a hip-hop blog site based out of Raleigh NC. We have content from people all over so feel free to check us out.  Thank you and welcome.",
    authors: "Terrance V. Smith",
    creators: "Terrance V. Smith",
    publishedTime:"9/28/2024 at 9:08am",
    siteName:"Big Chief Ent",
    series:"Hip Hop Blog",
    writers: "Terrance V. Smith",
    locale: "Eastern (NC)",
    emails: "admin@bigchiefmedia.com"
  },
  creator: "Terrance V. Smith",
  publisher:"Software Innovation LLC",
  category: "Hip-hop Blog",
  applicationName: "Big Chief Entertainment",
  generator: "Big Chief Entertainment",
  keywords: ["hip-hop", "big chief", "big chief ent", "bce", "hip-hop blog", "big chief entertainment", "chief", "black blog", "raleigh blog", "blog", "chief", "interview", "podcast","content"],
  appLinks: {web: {url:"www.bigchiefmedia.com"}}
}


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <head>
       </head>
      <body className={`hidescroll`}>
        <DynamicNav />
        {children}
        <Script src="/assets/vendor/sticky-js/sticky.min.js" strategy="afterInteractive"/>
        <Script src="/assets/js/functions.js" strategy="afterInteractive"/>
      </body>
    </html>
  );
}