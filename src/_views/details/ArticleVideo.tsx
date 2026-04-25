"use client"
import { useId, useRef } from "react";
import Script from 'next/script';
import { useNavigationUI } from "@/_navigation";

type YouTubePlayerInstance = object;

type YouTubePlayerConstructor = new (
  elementId: string,
  config: {
    height: string;
    width: string;
    videoId: string;
    playerVars?: {
      origin?: string;
      enablejsapi?: number;
    };
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

function normalizeYouTubeVideoId(input: string) {
  const value = input.trim();
  if (!value) return "";

  // already an 11-char youtube id
  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) return value;

  try {
    const parsed = new URL(value);
    const hostname = parsed.hostname.toLowerCase();

    if (hostname.includes("youtu.be")) {
      return parsed.pathname.replace(/^\/+/, "").slice(0, 11);
    }

    if (hostname.includes("youtube.com")) {
      const fromQuery = parsed.searchParams.get("v");
      if (fromQuery) return fromQuery.slice(0, 11);

      const embedded = parsed.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
      if (embedded?.[1]) return embedded[1];
    }
  } catch {
    // Fallback below
  }

  return value.slice(0, 11);
}

export default function VideoView({videoLink}:{videoLink:string, videoType:"youtube"|"facebook", title:string}){

    const {isMenuOpen, isSearchOpen} = useNavigationUI()

    const playerElementId = useId().replace(/:/g, "_");
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

    const normalizedVideoId = normalizeYouTubeVideoId(videoLink);
    if (!normalizedVideoId) return;

    playerRef.current = new window.YT.Player(playerElementId, {
      height: "100%",
      width: "100%",
      videoId: normalizedVideoId,
      playerVars: {
        origin: window.location.origin,
        enablejsapi: 1,
      },
      events: { onReady: () => undefined },
    });
  };
   

  return (
    <div className="w-100 d-flex flex-column">
      <Script
        src="https://www.youtube.com/iframe_api"
        strategy="afterInteractive"
        onReady={handleScriptLoad}
      />
      <div
        className="ratio ratio-16x9 w-100"
        style={{
          pointerEvents: isMenuOpen || isSearchOpen ? "none" : "auto",
        }}
      >
        <div id={playerElementId} className="p-0 m-0" />
      </div>
    </div>
  );
}
