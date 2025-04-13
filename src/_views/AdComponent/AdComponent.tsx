"use client"
import React, { useEffect } from 'react';
import Router from "next/router";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface AdsBannerProps {
  "data-ad-slot": string;
  "data-ad-format": string;
  "data-full-width-responsive": string;
  "data-ad-layout"?: string;
}

const AdComponent: React.FC = () => {
  
  useEffect(() => {
    const handleRouteChange = () => {
      const intervalId = setInterval(() => {
       try {
        // Check if the 'ins' element already has an ad in it
        if (window.adsbygoogle) {
         window.adsbygoogle.push({});
         clearInterval(intervalId);
        }
       } catch (err) {
        console.error("Error pushing ads: ", err);
        clearInterval(intervalId); // Ensure we clear interval on errors too
       }
      }, 100);
      return () => clearInterval(intervalId); // Clear interval on component unmount
     };
     handleRouteChange();
     if (typeof window !== "undefined") {
      Router.events.on("routeChangeComplete", handleRouteChange);
   
      // Unsubscribe from route changes when the component unmounts
      return () => {
       Router.events.off("routeChangeComplete", handleRouteChange);
      };
     }
  }, [])
  return (
    <ins
      className="adsbygoogle"
      style={{display:"block"}}
     data-ad-client="ca-pub-3791130011444182"
     data-ad-slot="9901828177"
     data-ad-format="auto"
     data-full-width-responsive="true"
  />
  );
};

export default AdComponent;