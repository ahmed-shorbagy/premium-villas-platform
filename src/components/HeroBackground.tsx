import { useEffect, useRef, useState } from "react";
import heroImage from "@/assets/hero-cairo.jpg";
import { siteConfig } from "@/config";

/**
 * Cinematic hero backdrop: optional short loop video (MP4/WebM in /public/hero/)
 * with Ken Burns + light shimmer on the static image fallback.
 */
const HeroBackground = () => {
  const { heroVideoMp4, heroVideoWebm } = siteConfig.assets;
  const hasVideo = Boolean(heroVideoMp4 || heroVideoWebm);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const showVideo = hasVideo && !videoFailed;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !showVideo) return;

    const play = () => {
      video.play().catch(() => setVideoFailed(true));
    };

    video.addEventListener("canplay", () => setVideoReady(true));
    video.addEventListener("error", () => setVideoFailed(true));
    play();

    return () => {
      video.removeEventListener("canplay", () => setVideoReady(true));
      video.removeEventListener("error", () => setVideoFailed(true));
    };
  }, [showVideo]);

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      {showVideo ? (
        <video
          ref={videoRef}
          className={`shima-hero-media h-full w-full object-cover transition-opacity duration-700 ${
            videoReady ? "opacity-100" : "opacity-0"
          }`}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster={heroImage}
        >
          {heroVideoWebm ? <source src={heroVideoWebm} type="video/webm" /> : null}
          {heroVideoMp4 ? <source src={heroVideoMp4} type="video/mp4" /> : null}
        </video>
      ) : null}

      <img
        src={heroImage}
        alt=""
        className={`shima-hero-media shima-hero-bg h-full w-full object-cover transition-opacity duration-700 ${
          showVideo && videoReady ? "opacity-0" : "opacity-100"
        }`}
      />

      <div className="shima-hero-shimmer pointer-events-none absolute inset-0" />
      <div className="absolute inset-0 bg-[image:var(--gradient-hero)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
    </div>
  );
};

export default HeroBackground;
