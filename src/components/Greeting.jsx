import React, { useState, useEffect } from 'react';
import { Sun, Moon, CloudSun, Sunset, Calendar, Clock, Heart, CheckCircle, PlusCircle } from 'lucide-react';

const useCurrentDateTime = () => {
  const [dateTime, setDateTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return dateTime;
};

// පොදු Style එක (දෙපැත්තටම එකම පෙනුම ගන්න)
const capsuleStyle = "h-10 bg-white/5 border border-white/10 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]";

// --- 1. LEFT SIDE: Info Ticker ---
export const InfoTicker = () => {
  const dateTime = useCurrentDateTime();
  const [currentIndex, setCurrentIndex] = useState(0);
  const hour = dateTime.getHours();
  
  let g = {};
  if (hour >= 5 && hour < 12) g = { t: 'Good Morning', c: 'text-yellow-300', i: <Sun size={15} className="text-yellow-400 inline mr-2"/> };
  else if (hour >= 12 && hour < 17) g = { t: 'Good Afternoon', c: 'text-orange-300', i: <CloudSun size={15} className="text-orange-400 inline mr-2"/> };
  else if (hour >= 17 && hour < 21) g = { t: 'Good Evening', c: 'text-pink-300', i: <Sunset size={15} className="text-pink-400 inline mr-2"/> };
  else g = { t: 'Good Night', c: 'text-indigo-300', i: <Moon size={15} className="text-indigo-400 inline mr-2"/> };

  const time = dateTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const date = dateTime.toLocaleDateString([], { month: 'short', day: 'numeric', weekday: 'long' });

  const items = [
    { id: 1, content: <span className={`${g.c} flex items-center font-bold`}>{g.i} {g.t}</span> },
    { id: 2, content: <span className="text-cyan-300 flex items-center font-mono font-bold"><Clock size={15} className="mr-2 text-cyan-400"/> {time}</span> },
    { id: 3, content: <span className="text-purple-300 flex items-center font-medium"><Calendar size={15} className="mr-2 text-purple-400"/> {date}</span> },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
    }, 3000); 
    return () => clearInterval(interval);
  }, [items.length]);

  return (
    // Fixed width to match the look
    <div className={`${capsuleStyle} w-40 md:w-56 overflow-hidden relative group cursor-default`}>
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`absolute w-full h-full flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]
            ${index === currentIndex ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-8 blur-sm'}
          `}
        >
          <div className="text-xs md:text-sm truncate px-4">
            {item.content}
          </div>
        </div>
      ))}
    </div>
  );
};

// --- 2. RIGHT SIDE: Favorite Pill Button ---
export const FavoritePill = ({ isFavorite, onToggle }) => {
  return (
    <button 
      onClick={onToggle}
      className={`${capsuleStyle} px-4 md:px-5 gap-2 group active:scale-95`}
    >
      {/* Icon Changes based on state */}
      <div className={`transition-transform duration-300 ${isFavorite ? 'scale-110' : 'group-hover:scale-110'}`}>
        {isFavorite ? (
          <Heart size={18} fill="#ec4899" className="text-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]" />
        ) : (
          <Heart size={18} className="text-gray-300 group-hover:text-white" />
        )}
      </div>

      {/* Text (Desktop Only) */}
      <span className={`hidden md:block text-xs md:text-sm font-bold tracking-wide transition-colors duration-300 uppercase
        ${isFavorite ? 'text-pink-400' : 'text-gray-300 group-hover:text-white'}
      `}>
        {isFavorite ? 'Saved Station' : 'Add to Favorites'}
      </span>
    </button>
  );
};