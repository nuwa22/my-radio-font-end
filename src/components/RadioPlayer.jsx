import React, { useRef, useEffect } from 'react';
import useRadioStore from '../store/useRadioStore';
import { Play, Pause, Radio } from 'lucide-react';

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
        {/* ✅ FIXED: 'flඩ්ex' තිබුණ තැන 'flex' කළා */}
        <div className="flex items-center gap-3 md:gap-4">
          
          {/* Logo / Icon Area */}
          <div className={`relative w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-2 border-purple-500/50 shadow-lg flex-shrink-0
            ${isPlaying ? 'animate-[spin_6s_linear_infinite]' : ''} transition-all duration-700 bg-[#080410]`}>
            
            {activeStation.logoUrl ? (
                // ✅ UPDATE: 'object-cover' දැම්මා (කිසිම හිස් තැනක් නැතුව රවුම පිරෙනවා)
                <img 
                    src={activeStation.logoUrl} 
                    alt={activeStation.name} 
                    className="w-full h-full object-cover" 
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} 
                />
            ) : null}

            {/* Fallback Icon */}
            <div className={`w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center absolute top-0 left-0 ${activeStation.logoUrl ? 'hidden' : 'flex'}`}>
                <Radio size={24} className="text-white" />
            </div>
          </div>

          {/* Text Info */}
          <div className="overflow-hidden">
            <h3 className="font-bold text-sm md:text-lg text-white truncate max-w-[150px] md:max-w-xs">
                {activeStation.name}
            </h3>
            <p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <span className="text-purple-400 font-bold">{activeStation.language || 'Radio'}</span>
                <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                <span>{activeStation.category}</span>
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
            <button 
            onClick={togglePlay}
            className="bg-white text-slate-900 p-3 rounded-full hover:scale-110 transition shadow-lg shadow-white/10 flex-shrink-0"
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