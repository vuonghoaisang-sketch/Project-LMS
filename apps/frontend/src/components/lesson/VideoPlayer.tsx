'use client';

import { useMemo, useState } from 'react';

interface VideoPlayerProps {
  url: string | null;
  title?: string;
  poster?: string | null;
}

export default function VideoPlayer({ url, title, poster }: VideoPlayerProps) {
  const [hasError, setHasError] = useState(false);

  const videoMeta = useMemo(() => {
    if (!url) return null;

    try {
      // 1. Check YouTube
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let videoId = '';
        if (url.includes('youtu.be/')) {
          videoId = url.split('youtu.be/')[1]?.split(/[?#]/)[0] || '';
        } else if (url.includes('youtube.com/watch')) {
          const parsed = new URL(url);
          videoId = parsed.searchParams.get('v') || '';
        } else if (url.includes('youtube.com/embed/')) {
          videoId = url.split('youtube.com/embed/')[1]?.split(/[?#]/)[0] || '';
        }

        if (videoId) {
          return {
            type: 'youtube' as const,
            src: `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`,
          };
        }
      }

      // 2. Check Vimeo
      if (url.includes('vimeo.com')) {
        const matches = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/);
        const vimeoId = matches ? matches[1] : null;
        if (vimeoId) {
          return {
            type: 'vimeo' as const,
            src: `https://player.vimeo.com/video/${vimeoId}`,
          };
        }
      }

      // 3. Direct uploaded video or external video stream (.mp4, .webm, /uploads/videos, cloud stream)
      return {
        type: 'direct' as const,
        src: url,
      };
    } catch {
      return {
        type: 'direct' as const,
        src: url,
      };
    }
  }, [url]);

  if (!url || !videoMeta) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-slate-900 text-slate-400">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <p className="mt-2 text-sm font-medium">No video source provided</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-slate-900 p-6 text-center text-slate-400">
        <div>
          <p className="text-base font-semibold text-rose-400">
            Cannot play this video
          </p>
          <p className="mt-1 text-sm text-slate-400">
            The video source may be offline, restricted, or in an unsupported format.
          </p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block rounded-lg bg-slate-800 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700"
          >
            Open Original Link ↗
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-lg">
      {videoMeta.type === 'youtube' || videoMeta.type === 'vimeo' ? (
        <iframe
          src={videoMeta.src}
          title={title || 'Lesson Video Player'}
          className="h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <video
          key={videoMeta.src}
          src={videoMeta.src}
          poster={poster || undefined}
          controls
          controlsList="nodownload" // Discourages unauthorized video downloads
          playsInline
          onError={() => setHasError(true)}
          className="h-full w-full object-contain"
        >
          Your browser does not support HTML5 video streaming.
        </video>
      )}
    </div>
  );
}
