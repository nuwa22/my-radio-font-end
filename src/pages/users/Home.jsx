import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import useRadioStore from '../../store/useRadioStore';
import { Play, Pause, SkipBack, SkipForward, Heart, Radio, Search, Volume1, VolumeX, ListMusic, ArrowLeft } from 'lucide-react';

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
  const [isMobileListOpen, setIsMobileListOpen] = useState(true); // Mobile Navigation State
  const audioRef = useRef(null);

  // 1. Fetch Stations
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

  // 2. Audio Logic & Auto Reconnect (Fix for stopping issue)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;

    const handlePlay = () => {
      audio.play().catch(error => {
        console.log("Playback prevented. User interaction might be needed.", error);
      });
    };

    if (isPlaying) {
      handlePlay();
    } else {
      audio.pause();
    }

    // --- Auto Reconnect Logic ---
    const handleDrop = () => {
      console.log("Stream dropped, reconnecting...");
      if (isPlaying) {
        audio.load(); 
        audio.play().catch(e => console.log("Re-play error", e));
      }
    };

    audio.addEventListener('stalled', handleDrop);
    audio.addEventListener('error', handleDrop);
    audio.addEventListener('waiting', () => console.log("Buffering..."));

    return () => {
      audio.removeEventListener('stalled', handleDrop);
      audio.removeEventListener('error', handleDrop);
    };
  }, [isPlaying, activeStation, volume]);

  // 3. Mobile Logic: චැනල් එකක් තේරුවම ලිස්ට් එක වැහිලා ප්ලේයර් එක එන්න
  const handleStationSelect = (station) => {
    playStation(station);
    setIsMobileListOpen(false); // Close list on mobile
  };

  const filteredStations = stations.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen w-screen bg-[#0f0518] text-white overflow-hidden font-sans relative">
      
      {/* --- SIDEBAR (Channel List) --- */}
      {/* Mobile: Full Screen if open / Desktop: Fixed width (w-80) always visible */}
      <div className={`
          absolute inset-0 z-30 bg-[#150826] flex flex-col transition-transform duration-300
          md:relative md:translate-x-0 md:w-80 md:border-r md:border-white/5 md:shadow-2xl
          ${isMobileListOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        <div className="p-4 border-b border-white/5 bg-[#1a0b2e]/50 flex-shrink-0 pt-safe-top">
            <h1 className="text-lg font-bold flex items-center gap-2 text-white">
                <span className="bg-gradient-to-br from-pink-600 to-purple-600 p-1 rounded-md shadow-lg shadow-purple-500/20">
                    <Radio size={16} className="text-white" />
                </span>
                Nuwa Radio
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

        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar pb-20 md:pb-2">
            {filteredStations.map((station) => (
                <div 
                    key={station._id}
                    onClick={() => handleStationSelect(station)}
                    className={`p-2 rounded-lg cursor-pointer flex items-center justify-between group transition-all duration-300 border border-transparent
                        ${activeStation?._id === station._id 
                            ? 'bg-gradient-to-r from-purple-900/80 to-pink-900/80 border-pink-500/20 shadow-md' 
                            : 'hover:bg-white/5 hover:border-white/5'}`}
                >
                    <div className="flex items-center gap-2 overflow-hidden">
                        <div className={`w-10 h-10 flex-shrink-0 rounded flex items-center justify-center font-bold text-base shadow-inner
                            ${activeStation?._id === station._id ? 'bg-pink-600 text-white' : 'bg-[#24123a] text-gray-500'}`}>
                            {station.name.charAt(0)}
                        </div>
                        <div className="truncate">
                            <h4 className={`font-medium text-sm truncate ${activeStation?._id === station._id ? 'text-white' : 'text-gray-400'}`}>{station.name}</h4>
                            <p className="text-[10px] text-gray-500 uppercase">{station.category}</p>
                        </div>
                    </div>
                    {activeStation?._id === station._id && isPlaying && (
                       <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-ping"></div>
                    )}
                </div>
            ))}
        </div>
        
        {/* Mobile Only: Button to go back to player if station is selected */}
        {activeStation && (
            <div className="md:hidden absolute bottom-4 left-0 right-0 px-4">
                <button 
                    onClick={() => setIsMobileListOpen(false)}
                    className="w-full bg-pink-600 p-3 rounded-lg font-bold text-sm shadow-lg flex items-center justify-center gap-2"
                >
                    <Volume1 size={16}/> Back to Player
                </button>
            </div>
        )}
      </div>

      {/* --- RIGHT PLAYER AREA --- */}
      {/* Always visible on Desktop. On Mobile, it sits behind the list, unveiled when list closes */}
      <div className="flex-1 relative h-full flex flex-col overflow-hidden bg-[#0f0518] w-full">
        
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#1a052b] via-[#240a3a] to-[#0f0518]"></div>
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[100px] pointer-events-none"></div>

        {activeStation ? (
            <div className="z-10 w-full h-full flex flex-col items-center p-4 md:p-8 relative">
                
                {/* Top Bar: Mobile Menu Button & Fav Button */}
                <div className="w-full flex justify-between items-center mb-2 flex-shrink-0">
                    <button 
                        onClick={() => setIsMobileListOpen(true)}
                        className="md:hidden p-2 rounded-full bg-white/5 text-gray-300 hover:text-white"
                    >
                        <ListMusic size={24} />
                    </button>

                    <button 
                        onClick={() => toggleFavorite(activeStation._id)}
                        className={`p-2 rounded-full backdrop-blur-md border border-white/10 transition hover:scale-110 ml-auto ${favorites.includes(activeStation._id) ? 'bg-pink-500/20 text-pink-500 border-pink-500/30' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                    >
                        <Heart size={20} fill={favorites.includes(activeStation._id) ? "currentColor" : "none"} />
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 w-full flex flex-col items-center justify-center min-h-0 gap-4 md:gap-6">
                    
                    {/* Album Art */}
                    <div className="relative group flex-shrink-0 h-auto max-h-[35vh] md:max-h-[40vh] aspect-square mt-4">
                        <div className="w-full h-full rounded-full bg-gradient-to-tr from-gray-900 to-black p-1.5 shadow-2xl shadow-purple-900/40 border border-white/10 flex items-center justify-center relative z-10">
                             <div className={`absolute inset-0 rounded-full border-2 border-dashed border-pink-500/30 ${isPlaying ? 'animate-[spin_12s_linear_infinite]' : ''}`}></div>
                             <div className="w-full h-full bg-[#12081f] rounded-full flex items-center justify-center overflow-hidden">
                                <span className="text-[8vh] md:text-[10vh] font-bold text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-pink-500 select-none">
                                    {activeStation.name.charAt(0)}
                                </span>
                             </div>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="text-center w-full flex flex-col items-center flex-shrink-0">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-1 tracking-tight drop-shadow-md truncate max-w-[80vw]">{activeStation.name}</h2>
                        <span className="px-3 py-0.5 rounded-full bg-white/5 border border-white/5 text-pink-300/80 text-xs md:text-sm uppercase tracking-widest font-medium">
                            {activeStation.category}
                        </span>
                        <AudioVisualizer isPlaying={isPlaying} />
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-center gap-8 md:gap-12 w-full flex-shrink-0 mb-4">
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

                {/* Volume Slider */}
                <div className="w-full max-w-sm bg-[#1a0b2e]/60 backdrop-blur-md rounded-xl p-3 flex items-center gap-3 border border-white/5 mt-auto flex-shrink-0 mb-safe-bottom">
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
            // Empty State (Mobile: Hidden because List is top, Desktop: Visible)
            <div className="z-10 w-full h-full flex flex-col items-center justify-center text-white/20">
                <div className="w-32 h-32 rounded-full border-4 border-white/5 flex items-center justify-center mb-6 animate-pulse">
                    <Radio size={64} />
                </div>
                <p className="text-xl font-light tracking-wider">Select a station</p>
                {/* Mobile only helper */}
                <button onClick={() => setIsMobileListOpen(true)} className="md:hidden mt-4 text-pink-500 flex items-center gap-2">
                    <ListMusic /> Open List
                </button>
            </div>
        )}

        {/* Updated Audio Tag with Reconnect Props */}
        <audio 
            ref={audioRef}
            src={activeStation?.streamUrl}
            preload="auto"
            playsInline
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            autoPlay={true}
            onError={(e) => {
                console.log("Stream Error, Retrying...", e);
                // Simple retry logic inside component
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