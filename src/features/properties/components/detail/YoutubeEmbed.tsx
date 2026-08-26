"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { getYoutubeEmbedUrl, getYoutubeThumbnailUrl } from "@/lib/youtube";

export function YoutubeEmbed({ videoId, title }: { videoId: string; title: string }) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded border bg-black">
      {isPlaying ? (
        <iframe
          src={getYoutubeEmbedUrl(videoId)}
          title={title}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setIsPlaying(true)}
          aria-label={`Reproduzir vídeo: ${title}`}
          className="group absolute inset-0 flex h-full w-full items-center justify-center"
        >
          <Image src={getYoutubeThumbnailUrl(videoId)} alt="" fill className="object-cover" sizes="(min-width: 1024px) 66vw, 100vw" />
          <span className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/30" />
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-red-600 shadow-lg transition-transform group-hover:scale-110">
            <Play size={28} className="ml-1 fill-white text-white" />
          </span>
        </button>
      )}
    </div>
  );
}
