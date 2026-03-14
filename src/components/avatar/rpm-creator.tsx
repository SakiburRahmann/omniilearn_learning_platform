"use client";

import { useEffect, useRef, useState } from "react";
import { X, Loader2 } from "lucide-react";

interface RpmCreatorProps {
  onAvatarExported: (avatarUrl: string) => void;
  onClose: () => void;
  subdomain?: string;
}

export function RpmCreator({ 
  onAvatarExported, 
  onClose,
  subdomain = "demo" // Default RPM subdomain, can be replaced with a custom one later
}: RpmCreatorProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Ready Player Me iFrame URL
  // frameApi=true is required to receive postMessage events
  // clearCache=true forces a fresh creator
  const url = `https://${subdomain}.readyplayer.me/avatar?frameApi`;

  useEffect(() => {
    const handleMessageEvent = (event: MessageEvent) => {
      let data = event.data;
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch {
          return;
        }
      }

      // Ensure the message comes from the correct origin
      if (!data || data.source !== "readyplayerme") {
        return;
      }

      // Handle the different event types from the iFrame
      const evName = data.eventName;

      if (evName === "v1.frame.ready") {
        // The iFrame is fully loaded
        setIsLoading(false);
        // Subscribe to all avatar events
        iframeRef.current?.contentWindow?.postMessage(
          JSON.stringify({
            target: "readyplayerme",
            type: "subscribe",
            eventName: "v1.**",
          }),
          "*"
        );
      }

      if (evName === "v1.avatar.exported") {
        // The user clicked "Next" and the avatar was generated
        const avatarUrl = data.data?.url || data.url;
        if (avatarUrl) {
          onAvatarExported(avatarUrl);
        }
      }
    };

    window.addEventListener("message", handleMessageEvent);
    return () => window.removeEventListener("message", handleMessageEvent);
  }, [onAvatarExported]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex flex-col pt-safe backdrop-blur-sm">
      <div className="flex items-center justify-between px-6 py-4 bg-white">
        <h2 className="text-xl font-black text-[#4B4B4B] uppercase tracking-wide">
          Create Avatar
        </h2>
        <button 
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          title="Close Creator"
        >
          <X className="w-6 h-6 text-[#AFAFAF] hover:text-[#4B4B4B] transition-colors" />
        </button>
      </div>
      
      <div className="relative flex-1 bg-white">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="font-bold text-[#AFAFAF] animate-pulse">Loading 3D Engine...</p>
          </div>
        )}
        
        <iframe
          ref={iframeRef}
          src={url}
          className="w-full h-full border-none"
          allow="camera *; microphone *; clipboard-write"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          title="Ready Player Me"
        />
      </div>
    </div>
  );
}
