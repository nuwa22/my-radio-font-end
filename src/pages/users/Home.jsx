import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import useRadioStore from '../../store/useRadioStore';
import { Play, Pause, SkipBack, SkipForward, Heart, Radio, Search, Volume1, VolumeX, ListMusic, Volume2 } from 'lucide-react';

// --- Visualizer ---
const ModernVisualizer = ({ isPlaying }) => {
  return (
    <div className="flex justify-center items-end h-12 md:h-20 gap-1 md:gap-1.5 w-full px-4 my-4 animate-hue">
      {[...Array(30)].map((_, i) => {
        const heightPattern = [20, 40, 60, 90, 50, 80, 100, 40, 70, 30, 60, 90, 50, 30, 60]; 
        const randomHeight = heightPattern[i % 15] + Math.random() * 20;
        return (
          <div
            key={i}
            className={`w-1.5 md:w-2 rounded-t-full transition-all duration-75 ease-linear 
              ${isPlaying ? 'bg-gradient-to-t from-pink-600 via-purple-500 to-cyan-400' : 'bg-white/5 h-1'}`}
            style={{
              height: isPlaying ? `${Math.max(10, randomHeight)}%` : '5px',
              animation: isPlaying ? `sound-wave ${0.4 + Math.random() * 0.5}s infinite alternate` : 'none',
              opacity: 0.8
            }}
          />
        );
      })}
    </div>
  );
};

const Home = () => {
  const { 
    stations, setStations, activeStation, playStation, 
    isPlaying, togglePlay, setIsPlaying, 
    playNext, playPrev, favorites, toggleFavorite,
    volume, setVolume, toggleMute 
  } = useRadioStore();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileListOpen, setIsMobileListOpen] = useState(true);
  const [viewMode, setViewMode] = useState('all');
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
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;

    if (isPlaying) {
      audio.play().catch(e => console.log("Auto-play prevented", e));
    } else {
      audio.pause();
    }

    const handleDrop = () => {
      if (isPlaying) {
        audio.load();
        audio.play().catch(e => console.log(e));
      }
    };

    audio.addEventListener('stalled', handleDrop);
    audio.addEventListener('error', handleDrop);

    return () => {
      audio.removeEventListener('stalled', handleDrop);
      audio.removeEventListener('error', handleDrop);
    };
  }, [isPlaying, activeStation, volume]);

  const handleStationSelect = (station) => {
    playStation(station);
    setIsMobileListOpen(false);
  };


  const getDisplayedStations = () => {
    let data = stations;

    // 1. Filter by Tab (All vs Favorites)
    if (viewMode === 'favorites') {
        data = data.filter(s => favorites.includes(s._id));
    }

    // 2. Filter by Search
    if (searchTerm) {
        data = data.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    return data;
  };

  const displayedStations = getDisplayedStations();

  return (
    <div className="flex h-screen w-screen bg-[#050011] text-white overflow-hidden font-sans relative">
      
      {/* --- Sidebar --- */}
      <div className={`
          absolute inset-0 z-30 bg-[#0e0024] flex flex-col transition-transform duration-300
          md:relative md:translate-x-0 md:w-80 md:border-r md:border-white/5 md:shadow-2xl
          ${isMobileListOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4 border-b border-white/5 bg-[#140033]/50 flex-shrink-0 pt-safe-top">
            <h1 className="text-lg font-bold flex items-center gap-2 text-white animate-hue">
                <span className="bg-gradient-to-br from-pink-500 to-cyan-500 p-1 rounded-md shadow-lg">
                    <Radio size={16} className="text-white" />
                </span>
                Nuwa Radio
            </h1>
            
            {/* --- NEW: TABS (All / Favorites) --- */}
            <div className="flex items-center gap-2 mt-4 bg-[#1e0542] p-1 rounded-lg">
                <button 
                    onClick={() => setViewMode('all')}
                    className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-all cursor-pointer ${viewMode === 'all' ? 'bg-pink-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                >
                    All Stations
                </button>
                <button 
                    onClick={() => setViewMode('favorites')}
                    className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-all cursor-pointer flex items-center justify-center gap-1 ${viewMode === 'favorites' ? 'bg-pink-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                >
                    <Heart size={10} fill={viewMode === 'favorites' ? "currentColor" : "none"}/> Favorites
                </button>
            </div>

            <div className="mt-3 relative group">
                <Search size={14} className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-pink-400 transition"/>
                <input 
                    type="text" 
                    placeholder="Search..." 
                    className="w-full bg-[#1e0542] text-xs py-2 pl-9 pr-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-500/50 text-gray-300 transition-all border border-transparent focus:border-pink-500/30 cursor-text"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar pb-20 md:pb-2">
            {displayedStations.length > 0 ? (
                displayedStations.map((station) => (
                    <div 
                        key={station._id}
                        onClick={() => handleStationSelect(station)}
                        className={`p-2 rounded-lg cursor-pointer flex items-center justify-between group transition-all duration-300
                            ${activeStation?._id === station._id 
                                ? 'bg-gradient-to-r from-purple-900/80 to-pink-900/80 border-l-4 border-pink-500' 
                                : 'hover:bg-white/5'}`}
                    >
                        <div className="flex items-center gap-2 overflow-hidden">
                            <div className={`w-10 h-10 flex-shrink-0 rounded flex items-center justify-center font-bold text-base
                                ${activeStation?._id === station._id ? 'bg-pink-600 text-white' : 'bg-[#24123a] text-gray-500'}`}>
                                {station.name.charAt(0)}
                            </div>
                            <div className="truncate">
                                <h4 className="font-medium text-sm truncate">{station.name}</h4>
                                <p className="text-[10px] text-gray-500 uppercase">{station.category}</p>
                            </div>
                        </div>
                        {/* List Favorite Indicator */}
                        {favorites.includes(station._id) && (
                            <Heart size={12} fill="#ec4899" className="text-pink-500 mr-2 opacity-50"/>
                        )}
                        {activeStation?._id === station._id && isPlaying && (
                           <div className="flex gap-1 items-end h-3">
                              <div className="w-1 bg-pink-500 animate-[bounce_1s_infinite]"></div>
                              <div className="w-1 bg-purple-500 animate-[bounce_1.2s_infinite]"></div>
                              <div className="w-1 bg-cyan-500 animate-[bounce_0.8s_infinite]"></div>
                           </div>
                        )}
                    </div>
                ))
            ) : (
                <div className="text-center text-gray-500 mt-10 text-xs">
                    {viewMode === 'favorites' ? "No favorites yet." : "No stations found."}
                </div>
            )}
        </div>
        
        {/* Mobile "Back to Player" Button */}
        {activeStation && (
            <div className="md:hidden absolute bottom-4 left-0 right-0 px-4">
                <button onClick={() => setIsMobileListOpen(false)} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-lg font-bold text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer">
                    <Volume1 size={16}/> Now Playing
                </button>
            </div>
        )}
      </div>

      {/* --- Main Player --- */}
      <div className="flex-1 relative h-full flex flex-col overflow-hidden bg-[#050011] w-full">
        
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#10002b] via-[#240046] to-[#000000] animate-hue opacity-50"></div>
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>

        {activeStation ? (
            <div className="z-10 w-full h-full flex flex-col items-center p-4 md:p-8 relative">
                
                {/* Top Nav */}
                <div className="w-full flex justify-between items-center mb-2 flex-shrink-0">
                    <button onClick={() => setIsMobileListOpen(true)} className="md:hidden p-2 rounded-full bg-white/5 text-gray-300 hover:text-white cursor-pointer">
                        <ListMusic size={24} />
                    </button>
                    <button 
                        onClick={() => toggleFavorite(activeStation._id)}
                        className={`p-2 rounded-full backdrop-blur-md border border-white/10 transition hover:scale-110 ml-auto cursor-pointer ${favorites.includes(activeStation._id) ? 'bg-pink-500/20 text-pink-500 border-pink-500/30' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                    >
                        <Heart size={20} fill={favorites.includes(activeStation._id) ? "currentColor" : "none"} />
                    </button>
                </div>

                <div className="flex-1 w-full flex flex-col items-center justify-center min-h-0 gap-4 md:gap-6">
                    
                    {/* Album Art */}
                    <div className={`relative group flex-shrink-0 h-auto max-h-[35vh] md:max-h-[40vh] aspect-square mt-2 
                        ${isPlaying ? 'animate-heartbeat' : ''} transition-transform duration-500`}>
                        <div className="w-full h-full rounded-full bg-gradient-to-tr from-gray-900 to-black p-2 shadow-[0_0_50px_rgba(236,72,153,0.3)] border border-white/10 flex items-center justify-center relative z-10">
                             <div className={`absolute inset-0 rounded-full border-2 border-dashed border-pink-500/50 ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`}></div>
                             <div className={`absolute inset-2 rounded-full border border-cyan-500/30 ${isPlaying ? 'animate-[spin_8s_linear_infinite_reverse]' : ''}`}></div>
                             <div className="w-full h-full bg-[#12081f] rounded-full flex items-center justify-center overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 animate-hue"></div>
                                <span className="text-[8vh] md:text-[10vh] font-bold text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 via-purple-400 to-pink-500 select-none relative z-10 animate-hue">
                                    {activeStation.name.charAt(0)}
                                </span>
                             </div>
                        </div>
                    </div>

                    <div className="text-center w-full flex flex-col items-center flex-shrink-0">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 tracking-tight drop-shadow-lg truncate max-w-[90vw] animate-hue">
                            {activeStation.name}
                        </h2>
                        <span className="px-4 py-1 rounded-full bg-white/5 border border-pink-500/20 text-pink-300 text-xs md:text-sm uppercase tracking-widest font-medium">
                            {activeStation.category}
                        </span>
                        <ModernVisualizer isPlaying={isPlaying} />
                    </div>

                    <div className="flex items-center justify-center gap-8 md:gap-12 w-full flex-shrink-0 mb-4">
                        <button onClick={playPrev} className="text-gray-400 hover:text-white hover:scale-110 transition p-2 cursor-pointer">
                            <SkipBack size={32} fill="currentColor" />
                        </button>

                        <button 
                            onClick={togglePlay}
                            className={`w-18 h-18 md:w-20 md:h-20 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-105 transition duration-300 border-4 border-[#12081f] cursor-pointer
                            bg-gradient-to-br from-pink-500 to-purple-600 animate-hue shadow-purple-500/40`}
                        >
                            {isPlaying ? <Pause size={32} fill="white" /> : <Play size={32} fill="white" className="ml-1" />}
                        </button>

                        <button onClick={playNext} className="text-gray-400 hover:text-white hover:scale-110 transition p-2 cursor-pointer">
                            <SkipForward size={32} fill="currentColor" />
                        </button>
                    </div>
                </div>

                {/* Volume Slider with FIX */}
                <div className="w-full max-w-sm bg-[#1a0b2e]/80 backdrop-blur-xl rounded-2xl p-3 flex items-center gap-3 border border-white/5 mt-auto flex-shrink-0 mb-safe-bottom shadow-lg cursor-pointer">
                    <button onClick={toggleMute} className="text-gray-400 hover:text-pink-500 transition cursor-pointer">
                        {volume === 0 ? <VolumeX size={20} /> : (volume < 0.5 ? <Volume1 size={20} /> : <Volume2 size={20} />)}
                    </button>
                    
                    <div className="flex-1 relative h-1.5 bg-gray-800 rounded-full overflow-hidden group cursor-pointer">
                        <div 
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 animate-hue" 
                            style={{width: `${volume * 100}%`}}
                        ></div>
                        <input 
                            type="range" min="0" max="1" step="0.01" value={volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </div>
                </div>
            </div>
        ) : (
            <div className="z-10 w-full h-full flex flex-col items-center justify-center text-white/20">
                <div className="w-32 h-32 rounded-full border-4 border-white/5 flex items-center justify-center mb-6 animate-pulse">
                    <Radio size={64} />
                </div>
                <p className="text-xl font-light tracking-wider">Select a station</p>
                <button onClick={() => setIsMobileListOpen(true)} className="md:hidden mt-6 px-6 py-2 rounded-full bg-white/10 text-white font-bold flex items-center gap-2 cursor-pointer">
                    <ListMusic /> Open List
                </button>
            </div>
        )}

        <audio 
            ref={audioRef}
            src={activeStation?.streamUrl}
            preload="auto"
            playsInline
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            autoPlay={true}
            onError={(e) => {
                setTimeout(() => {
                    if(activeStation && audioRef.current) {
                        audioRef.current.load();
                        audioRef.current.play().catch(e => console.log(e));
                    }
                }, 3000);
            }}
        />
      </div>
    </div>
  );
};

export default Home;