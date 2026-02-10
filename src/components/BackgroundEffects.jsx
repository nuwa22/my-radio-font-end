import React from 'react';

const BackgroundEffects = () => {
  // තරු වලට අහඹු පාට තෝරාගැනීම (ලා පාටවල්)
  const getStarColor = () => {
    const colors = ['#ffffff', '#ffe4e1', '#e0ffff', '#fffacd', '#f0f8ff']; // Added AliceBlue for more variation
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    // Added a very subtle deep space gradient background
    <div className="absolute inset-0 overflow-hidden pointer-events-none bg-gradient-to-b from-[#050011] via-[#090022] to-[#050011]">
      <style>{`
        /* Blob Animation (වලාකුළු) - Slower movement */
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        /* Twinkle Animation (දිලිසෙන තරු) */
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); box-shadow: 0 0 5px rgba(255,255,255,0.6); }
        }

        .animate-blob {
          animation: blob 15s infinite ease-in-out; /* Slower speed for majestic feel */
        }
        .animation-delay-2000 { animation-delay: 3s; }
        .animation-delay-4000 { animation-delay: 6s; }

        .star {
          position: absolute;
          border-radius: 50%;
          animation: twinkle var(--duration) ease-in-out infinite;
          animation-delay: var(--delay);
        }
        
        /* Shooting stars removed as requested */
      `}</style>

      {/* 1. Moving Nebula Blobs (පාට වලාකුළු) - Larger and subtler */}
      <div className="absolute top-0 -left-20 w-[30rem] h-[30rem] bg-purple-700 rounded-full mix-blend-screen filter blur-[150px] opacity-25 animate-blob"></div>
      <div className="absolute top-1/3 -right-20 w-[30rem] h-[30rem] bg-cyan-700 rounded-full mix-blend-screen filter blur-[150px] opacity-25 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-20 left-1/3 w-[30rem] h-[30rem] bg-pink-700 rounded-full mix-blend-screen filter blur-[150px] opacity-25 animate-blob animation-delay-4000"></div>
      
      {/* Mobile only extra glow (Center) */}
      <div className="md:hidden absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-800 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-pulse"></div>

      {/* 2. Starfield Effect (Increased to 100 stars for a denser look) */}
      {[...Array(100)].map((_, i) => {
        // More variation in size, some tiny distant stars
        const size = Math.random() * 2.5 + 0.5; 
        return (
          <div
            key={i}
            className="star"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: getStarColor(),
              '--duration': `${Math.random() * 4 + 3}s`, // Slower, calmer twinkling
              '--delay': `${Math.random() * 5}s`,
            }}
          ></div>
        );
      })}
      
      {/* 3. Noise Texture (Film Grain) - Slightly reduced opacity for cleaner look */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150 mix-blend-overlay"></div>
    </div>
  );
};

export default BackgroundEffects;