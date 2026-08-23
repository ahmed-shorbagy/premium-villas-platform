import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/config";

const HeroBackground = () => {
  const { heroVideoMp4, heroVideoWebm, heroPoster } = siteConfig.assets;
  const hasVideo = Boolean(heroVideoMp4 || heroVideoWebm);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [allowVideo, setAllowVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 768px)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const reducedData = window.matchMedia("(prefers-reduced-data: reduce)").matches;
    setAllowVideo(hasVideo && !mobile && !reducedMotion && !reducedData);
  }, [hasVideo]);

  const showVideo = allowVideo && !videoFailed;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !showVideo) return;

    const onReady = () => setVideoReady(true);
    const onError = () => setVideoFailed(true);

    video.addEventListener("canplay", onReady);
    video.addEventListener("error", onError);
    video.play().catch(onError);

    return () => {
      video.removeEventListener("canplay", onReady);
      video.removeEventListener("error", onError);
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
          preload="metadata"
          poster={heroPoster}
        >
          {heroVideoWebm ? <source src={heroVideoWebm} type="video/webm" /> : null}
          {heroVideoMp4 ? <source src={heroVideoMp4} type="video/mp4" /> : null}
        </video>
      ) : null}

      <img
        src={heroPoster}
        alt=""
        fetchPriority="high"
        decoding="async"
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
