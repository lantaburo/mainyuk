"use client";

import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

export function RaporAudio() {
  const [isMuted, setIsMuted] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const bgm = new Audio("/sounds/PapanSkorCeria.mp3");
    bgm.loop = true;
    bgm.volume = 0.5;
    
    // Attempt to play immediately (might be blocked by browser autoplay policy)
    bgm.play().catch(e => console.log("Autoplay prevented:", e));
    
    setAudio(bgm);

    return () => {
      bgm.pause();
      bgm.src = "";
    };
  }, []);

  useEffect(() => {
    if (audio) {
      audio.muted = isMuted;
    }
  }, [isMuted, audio]);

  return (
    <button
      onClick={() => {
        setIsMuted(!isMuted);
        if (isMuted && audio && audio.paused) {
          audio.play().catch(e => console.error(e));
        }
      }}
      className="fixed bottom-6 right-6 p-4 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 hover:-translate-y-1 transition-all z-50 flex items-center justify-center"
      title={isMuted ? "Bunyikan Musik" : "Matikan Musik"}
    >
      {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
    </button>
  );
}
