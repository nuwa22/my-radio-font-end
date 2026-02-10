import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import useRadioStore from '../../store/useRadioStore';
// මෙන්න මෙතනට Heart එක ආපහු එකතු කළා 👇
import { Play, Pause, SkipBack, SkipForward, Radio, Search, Volume1, VolumeX, ListMusic, Volume2, X, Heart } from 'lucide-react';
import ErrorMessage from '../../components/ErrorMessage'; 
import { InfoTicker, FavoritePill } from '../../components/Greeting';
import BackgroundEffects from '../../components/BackgroundEffects';

const Home = () => {
  const { 
    stations, setStations, activeStation, playStation, 
    isPlaying, togglePlay, setIsPlaying, 
    playNext, playPrev, favorites, toggleFavorite,
    volume, setVolume, toggleMute 
  } = useRadioStore();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileListOpen, setIsMobileListOpen] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState('Sinhala'); 
  const audioRef = useRef(null);

  const tabs = ['Sinhala', 'Tamil', 'English', 'Multi', 'Favorites'];

  const fetchStations = async () => {
    setError(false);
    try {
        const res = await axios.get(import.meta.env.VITE_BACKEND_URL + "/api/stations/");
        setStations(res.data);
    } catch (error) {
        console.error("Error", error);
        setError(true);
    }
  };

  useEffect(() => {
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
    if (activeTab === 'Favorites') {
        data = data.filter(s => favorites.includes(s._id));
    } else {
        data = data.filter(s => s.language === activeTab);
    }
    if (searchTerm) {
        data = data.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return data;
  };

  const displayedStations = getDisplayedStations();

  // --- ආරක්ෂිත Favorite Logic (Crash නොවෙන්න) ---
  const isCurrentStationFavorite = activeStation && favorites && Array.isArray(favorites) && favorites.includes(activeStation._id);

  const handleFavoriteToggle = () => {
    if (activeStation && activeStation._id) {
        toggleFavorite(activeStation._id);
    }
  };
  // ---------------------------------------------

  if (error) {
    return (
      <div className="flex h-[100dvh] w-screen bg-[#050011] text-white items-center justify-center relative overflow-hidden">
         <BackgroundEffects />
         <div className="z-50 w-full px-4">
            <ErrorMessage onRetry={fetchStations} />
         </div>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] w-screen bg-[#050011] text-white overflow-hidden font-sans relative select-none">
      
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>

      {/* Sidebar (Mobile List) */}
      <div className={`
          fixed inset-0 z-40 bg-[#0e0024] flex flex-col transition-transform duration-300
          md:relative md:inset-auto md:w-80 md:translate-x-0 md:border-r md:border-white/5 md:shadow-2xl md:z-50
          ${isMobileListOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4 border-b border-white/5 bg-[#140033]/50 flex-shrink-0 pt-safe-top">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-lg font-bold flex items-center gap-2 text-white animate-hue">
                    <span className="bg-gradient-to-br from-pink-500 to-cyan-500 p-1 rounded-md shadow-lg">
                        <Radio size={16} className="text-white" />
                    </span>
                    Nuwa Radio
                </h1>
                <button onClick={() => setIsMobileListOpen(false)} className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"><X size={24} /></button>
            </div>
            <div className="flex items-center gap-2 flex-wrap pb-1 mb-2">
                {tabs.map((tab) => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`
                            px-3 py-1.5 rounded-full text-xs font-bold transition-all border flex-grow text-center
                            ${activeTab === tab 
                                ? 'bg-pink-600 border-pink-500 text-white shadow-[0_0_10px_rgba(236,72,153,0.4)]' 
                                : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}
                        `}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            <div className="mt-2 relative group">
                <Search size={14} className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-pink-400 transition"/>
                <input type="text" placeholder={`Search ${activeTab} stations...`} className="w-full bg-[#1e0542] text-xs py-2 pl-9 pr-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-500/50 text-gray-300 transition-all border border-transparent focus:border-pink-500/30 cursor-text" onChange={(e) => setSearchTerm(e.target.value)}/>
            </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {displayedStations.length > 0 ? (
                displayedStations.map((station) => (
                    <div 
                        key={station._id}
                        onClick={() => handleStationSelect(station)}
                        className={`p-2 rounded-lg cursor-pointer flex items-center justify-between group transition-all duration-300
                            ${activeStation?._id === station._id ? 'bg-gradient-to-r from-purple-900/80 to-pink-900/80 border-l-4 border-pink-500' : 'hover:bg-white/5'}`}
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className={`w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden flex items-center justify-center border border-white/10 ${activeStation?._id === station._id ? 'bg-black/20' : 'bg-[#24123a]'}`}>
                                {station.logoUrl ? (<img src={station.logoUrl} alt={station.name} className="w-full h-full object-cover"/>) : (<span className="font-bold text-gray-500">{station.name.charAt(0)}</span>)}
                            </div>
                            <div className="truncate">
                                <h4 className="font-medium text-sm truncate">{station.name}</h4>
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-purple-300 uppercase">{station.language || 'Radio'}</span>
                                    <span className="text-[9px] text-gray-500 uppercase">{station.category}</span>
                                </div>
                            </div>
                        </div>
                        {/* List එකේ Heart එක මෙතන තියෙන නිසා තමයි Error එක ආවේ */}
                        <div className="flex items-center gap-2">
                            {favorites.includes(station._id) && (<Heart size={12} fill="#ec4899" className="text-pink-500 opacity-70"/>)}
                            {activeStation?._id === station._id && isPlaying && (
                               <div className="flex gap-0.5 items-end h-3 ml-1">
                                  <div className="w-1 bg-pink-500 animate-[bounce_0.8s_infinite] h-full"></div>
                                  <div className="w-1 bg-cyan-400 animate-[bounce_1.1s_infinite] h-2/3"></div>
                                  <div className="w-1 bg-purple-500 animate-[bounce_0.9s_infinite] h-full"></div>
                               </div>
                            )}
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center text-gray-500 mt-10 text-xs">
                    {activeTab === 'Favorites' ? "No favorites yet." : `No ${activeTab} stations found.`}
                </div>
            )}
        </div>
      </div>

      {/* Main Player Area */}
      <div className="flex-1 relative h-full flex flex-col overflow-hidden bg-[#050011] w-full">
        
        <BackgroundEffects />
        
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050011]/20 to-[#050011]/80 pointer-events-none"></div>

        {activeStation ? (
            <div className="z-10 w-full h-full flex flex-col p-4 md:p-10 relative">
                
                {/* === HEADER AREA === */}
                <div className="w-full flex justify-between items-center flex-shrink-0 h-12 relative z-30">
                    
                    {/* LEFT GROUP */}
                    <div className="flex items-center gap-3 animate-fade-in w-full md:w-auto">
                        <button onClick={() => setIsMobileListOpen(true)} className="md:hidden p-2.5 rounded-full bg-white/5 text-gray-300 hover:text-white cursor-pointer hover:bg-white/10 transition flex-shrink-0 backdrop-blur-sm">
                            <ListMusic size={22} />
                        </button>
                        
                        <InfoTicker />
                    </div>

                    {/* RIGHT GROUP */}
                    <div className="hidden md:flex items-center animate-fade-in">
                        <FavoritePill 
                            isFavorite={isCurrentStationFavorite}
                            onToggle={handleFavoriteToggle}
                        />
                    </div>
                    {/* Mobile එකේදි දකුණු පැත්තේ button එක පෙන්වන්නෙ නැත්නම් මෙතන හදන්න පුළුවන්, 
                        හැබැයි අපි Ticker එක වම් පැත්තට ගත්ත නිසා Mobile එකේදි Button එක නැති වෙන්න පුළුවන්.
                        Mobile එකටත් Button එක ඕන නම් පහළ කෑල්ල uncomment කරන්න: */}
                     <div className="md:hidden flex items-center animate-fade-in ml-auto">
                        <FavoritePill 
                            isFavorite={isCurrentStationFavorite}
                            onToggle={handleFavoriteToggle}
                        />
                    </div>
                </div>
                {/* ================================= */}


                {/* Player Info & Visualizer */}
                <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center gap-6 md:gap-12 py-4">
                    <div className="relative flex-shrink-0 h-auto max-h-[38%] md:max-h-[42%] aspect-square flex items-center justify-center group">
                        {isPlaying && (
                            <>
                                <div className="absolute inset-[-20px] rounded-full border border-pink-500/30 border-t-pink-500 border-l-transparent animate-spin-slow"></div>
                                <div className="absolute inset-[-10px] rounded-full border border-cyan-400/30 border-b-cyan-400 border-r-transparent animate-[spin_5s_linear_infinite_reverse]"></div>
                                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500/40 to-pink-500/40 blur-xl animate-pulse"></div>
                            </>
                        )}
                        
                        <div className={`w-full h-full rounded-full bg-gradient-to-tr from-gray-900 to-black shadow-[0_0_50px_rgba(236,72,153,0.2)] border border-white/10 flex items-center justify-center relative z-10 overflow-hidden transition-transform duration-700 ${isPlaying ? 'scale-105' : 'scale-100'}`}>
                             {activeStation.logoUrl ? (
                                <div className="w-full h-full rounded-full bg-[#080410] bg-cover flex items-center justify-center overflow-hidden relative z-20 border border-white/5">
                                    <img src={activeStation.logoUrl} alt={activeStation.name} className={`w-full h-full object-cover drop-shadow-md transition-transform duration-[20s] ${isPlaying ? 'scale-110' : 'scale-100'}`}/>
                                </div>
                             ) : (
                                <div className="w-full h-full bg-[#12081f] rounded-full flex items-center justify-center overflow-hidden relative z-20">
                                    <span className="text-[3rem] md:text-[5rem] font-bold text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 via-purple-400 to-pink-500">{activeStation.name.charAt(0)}</span>
                                </div>
                             )}
                             <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/10 to-transparent opacity-50 pointer-events-none"></div>
                        </div>
                    </div>

                    <div className="text-center w-full flex flex-col items-center flex-shrink-0 mt-2 md:mt-4 px-4 z-20">
                        <h2 className="text-2xl md:text-5xl font-bold text-white tracking-tight drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] w-full max-w-4xl animate-hue mb-3 leading-tight truncate">
                            {activeStation.name}
                        </h2>
                        <div className="flex gap-3">
                            <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/20 text-purple-300 text-[10px] md:text-sm uppercase tracking-widest font-bold shadow-lg backdrop-blur-sm">
                                {activeStation.language || 'Radio'}
                            </span>
                            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 text-[10px] md:text-sm uppercase tracking-widest font-bold shadow-lg backdrop-blur-sm">
                                {activeStation.category}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="w-full flex flex-col items-center gap-5 md:gap-8 flex-shrink-0 pb-4 md:pb-2 z-20">
                    <div className="flex items-center justify-center gap-6 md:gap-16 w-full">
                        <button onClick={playPrev} className="text-gray-400 hover:text-white hover:scale-110 transition p-2 cursor-pointer opacity-80 hover:opacity-100">
                            <SkipBack size={24} md:size={40} fill="currentColor" />
                        </button>
                        <button onClick={togglePlay} className={`w-14 h-14 md:w-20 md:h-20 rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:scale-105 hover:shadow-[0_0_40px_rgba(236,72,153,0.6)] transition duration-300 border-4 border-[#1a0b2e] cursor-pointer bg-gradient-to-br from-pink-500 to-purple-600 animate-hue group`}>
                            {isPlaying ? <Pause size={24} md:size={40} fill="white" /> : <Play size={24} md:size={40} fill="white" className="ml-1 group-hover:scale-110 transition" />}
                        </button>
                        <button onClick={playNext} className="text-gray-400 hover:text-white hover:scale-110 transition p-2 cursor-pointer opacity-80 hover:opacity-100">
                            <SkipForward size={24} md:size={40} fill="currentColor" />
                        </button>
                    </div>

                    <div className="w-full max-w-sm md:max-w-md bg-[#1a0b2e]/60 backdrop-blur-xl rounded-2xl p-2 md:p-3 flex items-center gap-3 border border-white/5 shadow-lg cursor-pointer hover:bg-[#1a0b2e]/80 transition mt-1">
                        <button onClick={toggleMute} className="text-gray-400 hover:text-pink-500 transition cursor-pointer">
                            {volume === 0 ? <VolumeX size={18} md:size={24} /> : (volume < 0.5 ? <Volume1 size={18} md:size={24} /> : <Volume2 size={18} md:size={24} />)}
                        </button>
                        <div className="flex-1 relative h-1.5 md:h-2 bg-gray-700/50 rounded-full overflow-hidden group cursor-pointer">
                            <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 animate-hue shadow-[0_0_10px_rgba(236,72,153,0.5)]" style={{width: `${volume * 100}%`}}></div>
                            <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
                        </div>
                    </div>
                </div>

            </div>
        ) : (
            <div className="z-10 w-full h-full flex flex-col items-center justify-center text-white/20">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white/5 flex items-center justify-center mb-6 animate-pulse"><Radio size={48} md:size={64} /></div>
                <p className="text-lg md:text-xl font-light tracking-wider">Select a station to tune in</p>
                <button onClick={() => setIsMobileListOpen(true)} className="md:hidden mt-8 px-8 py-3 rounded-full bg-white/10 text-white font-bold flex items-center gap-2 cursor-pointer hover:bg-white/20 transition"><ListMusic /> Open List</button>
            </div>
        )}

        <audio ref={audioRef} src={activeStation?.streamUrl} preload="auto" playsInline onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} autoPlay={true} onError={(e) => { setTimeout(() => { if(activeStation && audioRef.current) { audioRef.current.load(); audioRef.current.play().catch(e => console.log(e)); } }, 3000); }}/>
      </div>
    </div>
  );
};

export default Home;