"use client"
import { useRef } from "react";
import Script from 'next/script';
import { useNavigationUI } from "@/_navigation";

type YouTubePlayerInstance = object;

type YouTubePlayerConstructor = new (
  elementId: string,
  config: {
    height: string;
    width: string;
    videoId: string;
    events: {
      onReady: () => void;
    };
  }
) => YouTubePlayerInstance;

declare global {
  interface Window {
    YT: {
      Player?: YouTubePlayerConstructor;
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function VideoView({videoLink}:{videoLink:string, videoType:"youtube"|"facebook", title:string}){

    const {isMenuOpen, isSearchOpen} = useNavigationUI()

    const playerRef = useRef<YouTubePlayerInstance | null>(null);

    const handleScriptLoad = () => {
    if (window.YT && window.YT.Player) {
      initializePlayer();
    } else {
      // Fallback: If YT exists but Player doesn't, wait for the global callback
      window.onYouTubeIframeAPIReady = () => {
        initializePlayer();
      };
    }
  };

  const initializePlayer = () => {
    if (playerRef.current || !window.YT.Player) return; // Prevent double initialization

    playerRef.current = new window.YT.Player('youtube-player', {
      height: '390',
      width: '640',
      videoId: videoLink,
      events: { onReady: () => undefined },
    });
  };
   

    return <>
        <div className="flex flex-col items-center">
            <Script
                src="https://www.youtube.com/iframe_api"
                strategy="afterInteractive"
                onReady={handleScriptLoad} // Triggered when script is ready
            />
            
            <div className="ratio ratio-16x9" style={{pointerEvents: isMenuOpen || isSearchOpen ? `none`:`auto`}}>
                <div id="youtube-player" className="p-0 m-0"></div>
            </div>
    </div>
    </>
}
