import React, { useRef, useEffect } from 'react';
import useRadioStore from '../store/useRadioStore';
import { Play, Pause, Radio, Volume2 } from 'lucide-react';

const RadioPlayer = () => {
  const { activeStation, isPlaying, togglePlay, setIsPlaying } = useRadioStore();
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => console.log("Playback prevented:", error));
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, activeStation]);

  if (!activeStation) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-white/10 p-3 text-white z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Info Area */}
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-purple-500/30">
            <Radio size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm md:text-lg text-white">{activeStation.name}</h3>
            <p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider">{activeStation.category}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
            <button 
            onClick={togglePlay}
            className="bg-white text-slate-900 p-3 rounded-full hover:scale-110 transition shadow-lg shadow-white/10"
            >
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
            </button>
        </div>

        {/* Audio Element */}
        <audio 
          ref={audioRef}
          src={activeStation.streamUrl}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          autoPlay={true}
        />
      </div>
    </div>
  );
};

export default RadioPlayer;