import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import useRadioStore from '../../store/useRadioStore';
import { Play, Pause, SkipBack, SkipForward, Heart, Radio, Search, Volume1, VolumeX } from 'lucide-react';

// --- Waveform Visualizer ---
const AudioVisualizer = ({ isPlaying }) => {
  return (
    <div className="flex justify-center items-center h-8 md:h-16 gap-1 w-full px-10 my-2">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className={`w-1.5 md:w-2 rounded-full transition-all duration-150 ease-in-out ${isPlaying ? 'bg-gradient-to-t from-pink-500 to-purple-500 animate-pulse' : 'bg-white/5 h-1.5'}`}
          style={{
            height: isPlaying ? `${Math.max(20, Math.random() * 100)}%` : '6px',
            opacity: isPlaying ? 0.9 : 0.2
          }}
        />
      ))}
    </div>
  );
};

const Home = () => {
  const { 
    stations, setStations, activeStation, playStation, 
    isPlaying, togglePlay, setIsPlaying, 
    playNext, playPrev, favorites, toggleFavorite,
    volume, setVolume 
  } = useRadioStore();
  
  const [searchTerm, setSearchTerm] = useState("");
  const audioRef = useRef(null);

  useEffect(() => {
    const fetchStations = async () => {
        try {
            const res = await axios.get(import.meta.env.VITE_BACKEND_URL + "/api/stations/");
            setStations(res.data);
        } catch (error) {
            console.error("Error", error);
        }
    };
    fetchStations();
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      if (isPlaying) {
        audioRef.current.play().catch(e => console.log("Play error", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, activeStation, volume]);

  const filteredStations = stations.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen w-screen bg-[#0f0518] text-white overflow-hidden font-sans">
      
      {/* --- LEFT SIDEBAR (Channel List) --- */}
      <div className="w-72 flex-shrink-0 bg-[#150826] border-r border-white/5 flex flex-col z-20 h-full shadow-2xl">
        
        <div className="p-4 border-b border-white/5 bg-[#1a0b2e]/50 flex-shrink-0">
            <h1 className="text-lg font-bold flex items-center gap-2 text-white">
                <span className="bg-gradient-to-br from-pink-600 to-purple-600 p-1 rounded-md shadow-lg shadow-purple-500/20">
                    <Radio size={16} className="text-white" />
                </span>
                Nuwa
            </h1>
            <div className="mt-4 relative group">
                <Search size={14} className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-pink-500 transition"/>
                <input 
                    type="text" 
                    placeholder="Search stations..." 
                    className="w-full bg-[#24123a] text-xs py-2 pl-9 pr-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-500/50 text-gray-300 placeholder-gray-600 transition-all border border-transparent focus:border-pink-500/30"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {filteredStations.map((station) => (
                <div 
                    key={station._id}
                    onClick={() => playStation(station)}
                    className={`p-2 rounded-lg cursor-pointer flex items-center justify-between group transition-all duration-300 border border-transparent
                        ${activeStation?._id === station._id 
                            ? 'bg-gradient-to-r from-purple-900/80 to-pink-900/80 border-pink-500/20 shadow-md' 
                            : 'hover:bg-white/5 hover:border-white/5'}`}
                >
                    <div className="flex items-center gap-2 overflow-hidden">
                        <div className={`w-8 h-8 flex-shrink-0 rounded flex items-center justify-center font-bold text-base shadow-inner
                            ${activeStation?._id === station._id ? 'bg-pink-600 text-white' : 'bg-[#24123a] text-gray-500'}`}>
                            {station.name.charAt(0)}
                        </div>
                        <div className="truncate">
                            <h4 className={`font-medium text-xs truncate ${activeStation?._id === station._id ? 'text-white' : 'text-gray-400'}`}>{station.name}</h4>
                        </div>
                    </div>
                    {activeStation?._id === station._id && isPlaying && (
                       <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-ping"></div>
                    )}
                </div>
            ))}
        </div>
        
        <div className="p-3 text-center border-t border-white/5 flex-shrink-0">
             <a href="/admin" className="text-[10px] text-gray-600 hover:text-pink-500 transition uppercase tracking-wider">Admin Area</a>
        </div>
      </div>

      {/* --- RIGHT PLAYER AREA (Responsive Layout) --- */}
      <div className="flex-1 relative h-full flex flex-col overflow-hidden bg-[#0f0518]">
        
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#1a052b] via-[#240a3a] to-[#0f0518]"></div>
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[40%] bg-pink-900/10 rounded-full blur-[80px] pointer-events-none"></div>

        {activeStation ? (
            <div className="z-10 w-full h-full flex flex-col items-center p-4 md:p-8 relative">
                
                {/* Top Bar: Fav Button */}
                <div className="w-full flex justify-end mb-2 flex-shrink-0">
                    <button 
                        onClick={() => toggleFavorite(activeStation._id)}
                        className={`p-2 rounded-full backdrop-blur-md border border-white/10 transition hover:scale-110 ${favorites.includes(activeStation._id) ? 'bg-pink-500/20 text-pink-500 border-pink-500/30' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                    >
                        <Heart size={20} fill={favorites.includes(activeStation._id) ? "currentColor" : "none"} />
                    </button>
                </div>

                {/* Main Content Area (Expands to fill space) */}
                <div className="flex-1 w-full flex flex-col items-center justify-center min-h-0 gap-2 md:gap-6">
                    
                    {/* 1. Album Art (Dynamic Size - This was the issue!) */}
                    {/* h-auto max-h-[35%] means it will never take more than 35% of the screen height */}
                    <div className="relative group flex-shrink-0 h-auto max-h-[30vh] aspect-square">
                        <div className="w-full h-full rounded-full bg-gradient-to-tr from-gray-900 to-black p-1.5 shadow-2xl shadow-purple-900/40 border border-white/10 flex items-center justify-center relative z-10">
                             <div className={`absolute inset-0 rounded-full border-2 border-dashed border-pink-500/30 ${isPlaying ? 'animate-[spin_12s_linear_infinite]' : ''}`}></div>
                             <div className="w-full h-full bg-[#12081f] rounded-full flex items-center justify-center overflow-hidden">
                                <span className="text-[8vh] font-bold text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-pink-500 select-none">
                                    {activeStation.name.charAt(0)}
                                </span>
                             </div>
                        </div>
                    </div>

                    {/* 2. Info & Visualizer */}
                    <div className="text-center w-full flex flex-col items-center flex-shrink-0">
                        <h2 className="text-2xl md:text-4xl font-bold text-white mb-1 tracking-tight drop-shadow-md truncate max-w-2xl">{activeStation.name}</h2>
                        <span className="px-3 py-0.5 rounded-full bg-white/5 border border-white/5 text-pink-300/80 text-xs md:text-sm uppercase tracking-widest font-medium">
                            {activeStation.category}
                        </span>
                        <AudioVisualizer isPlaying={isPlaying} />
                    </div>

                    {/* 3. Controls */}
                    <div className="flex items-center justify-center gap-8 md:gap-12 w-full flex-shrink-0 mb-2">
                        <button onClick={playPrev} className="text-gray-400 hover:text-white hover:scale-110 transition p-2">
                            <SkipBack size={32} fill="currentColor" />
                        </button>

                        <button 
                            onClick={togglePlay}
                            className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-purple-500/30 hover:scale-105 hover:shadow-pink-500/50 transition duration-300 border-4 border-[#1a052b]"
                        >
                            {isPlaying ? <Pause size={32} fill="white" /> : <Play size={32} fill="white" className="ml-1" />}
                        </button>

                        <button onClick={playNext} className="text-gray-400 hover:text-white hover:scale-110 transition p-2">
                            <SkipForward size={32} fill="currentColor" />
                        </button>
                    </div>

                </div>

                {/* 4. Volume Slider (Sticks to bottom) */}
                <div className="w-full max-w-sm bg-[#1a0b2e]/60 backdrop-blur-md rounded-xl p-3 flex items-center gap-3 border border-white/5 mt-auto flex-shrink-0">
                    <button onClick={() => setVolume(0)} className="text-gray-400 hover:text-white transition">
                        {volume === 0 ? <VolumeX size={18} /> : <Volume1 size={18} />}
                    </button>
                    
                    <div className="flex-1 relative h-1 bg-gray-700 rounded-full overflow-hidden group">
                        <div 
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-pink-500" 
                            style={{width: `${volume * 100}%`}}
                        ></div>
                        <input 
                            type="range" 
                            min="0" 
                            max="1" 
                            step="0.01"
                            value={volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </div>
                </div>

            </div>
        ) : (
            // Empty State
            <div className="z-10 w-full h-full flex flex-col items-center justify-center text-white/20">
                <div className="w-32 h-32 rounded-full border-4 border-white/5 flex items-center justify-center mb-6 animate-pulse">
                    <Radio size={64} />
                </div>
                <p className="text-xl font-light tracking-wider">Select a station</p>
            </div>
        )}

        {/* Hidden Audio */}
        <audio 
            ref={audioRef}
            src={activeStation?.streamUrl}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            autoPlay={true}
            onError={() => console.log("Stream Error")}
        />

      </div>
    </div>
  );
};

export default Home;