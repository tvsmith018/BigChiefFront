"use client";

import { useId, useRef } from "react";
import Script from "next/script";
import { useNavigationUI } from "@/_navigation";

type YouTubePlayerInstance = Record<string, unknown>;

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
    YT?: {
      Player?: YouTubePlayerConstructor;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

type VideoViewProps = {
  videoLink: string;
  videoType: "youtube" | "facebook";
  title: string;
};

function trimLeadingSlashes(value: string) {
  let start = 0;
  while (start < value.length && value[start] === "/") {
    start += 1;
  }
  return value.slice(start);
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
      return trimLeadingSlashes(parsed.pathname).slice(0, 11);
    }

    if (hostname.includes("youtube.com")) {
      const fromQuery = parsed.searchParams.get("v");
      if (fromQuery) return fromQuery.slice(0, 11);
      const embedPrefix = "/embed/";
      const embedStart = parsed.pathname.indexOf(embedPrefix);
      if (embedStart >= 0) {
        return parsed.pathname.slice(embedStart + embedPrefix.length, embedStart + embedPrefix.length + 11);
      }
    }
  } catch {
    // Fallback below
  }

  return value.slice(0, 11);
}

export default function VideoView({ videoLink }: Readonly<VideoViewProps>) {
  const { isMenuOpen, isSearchOpen } = useNavigationUI();
  const playerElementId = useId().replaceAll(":", "_");
  const playerRef = useRef<YouTubePlayerInstance | null>(null);

  const initializePlayer = () => {
    if (playerRef.current || !window.YT?.Player) return; // Prevent double initialization
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

  const handleScriptLoad = () => {
    if (window.YT?.Player) {
      initializePlayer();
    } else {
      // Fallback: If YT exists but Player doesn't, wait for the global callback
      window.onYouTubeIframeAPIReady = () => {
        initializePlayer();
      };
    }
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
