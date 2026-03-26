"use client"
import { HTMLAttributeReferrerPolicy, useEffect } from "react";
import { useNavigationUI } from "@/_navigation";

const VIDEO_CONFIG = {
  youtube: {
    src: "https://www.youtube.com/embed/",
    allow:
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
    referrerPolicy: "strict-origin-when-cross-origin" as const,
    allowFullScreen: true,
  },
  facebook: {
    src: "https://www.facebook.com/plugins/",
    allow: "autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share",
    allowFullScreen: true,
  },
};

export default function VideoView({videoLink, videoType, title}:{videoLink:string, videoType:"youtube"|"facebook", title:string}){

    const {isMenuOpen, isSearchOpen} = useNavigationUI()
    const videoConfig = 
        videoType && videoType in VIDEO_CONFIG
            ? VIDEO_CONFIG[videoType] : null

    return <>
        {videoConfig && videoLink ? (
            <div className="ratio ratio-16x9" style={{pointerEvents: isMenuOpen || isSearchOpen ? `none`:`auto`}}>
                <iframe
                    loading="eager"
                    className="p-0 m-0"
                    src={`${videoConfig.src}${videoLink}`}
                    title={title}
                    allow={videoConfig.allow}
                    referrerPolicy={
                        "referrerPolicy" in videoConfig ? videoConfig.referrerPolicy as HTMLAttributeReferrerPolicy : undefined
                    }
                    allowFullScreen={videoConfig.allowFullScreen}
                />
            </div>
        ):null}
    </>
}