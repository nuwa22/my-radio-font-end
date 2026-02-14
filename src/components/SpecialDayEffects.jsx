import React from 'react';

const SpecialDayEffects = () => {
  // දැනට දවස චෙක් කරන්නේ නැතුව කෙලින්ම Valentine පෙන්වන්න හදලා තියෙන්නේ
  return (
    <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
      <ValentineRain />
    </div>
  );
};

const ValentineRain = () => {
  // හදවත් 40ක් වැස්සක් වගේ වැටෙන්න හදල තියෙනවා
  const hearts = Array.from({ length: 40 });

  return (
    <div className="absolute inset-0">
      {hearts.map((_, i) => (
        <div
          key={i}
          className="absolute text-pink-500 animate-heart-rain opacity-0"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-5vh`, // උඩ ඉඳන් වැටෙන්න පටන් ගන්න
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${4 + Math.random() * 4}s`, // එක එක වේගයෙන් වැටෙන්න
            fontSize: `${Math.random() * (25 - 12) + 12}px`,
            filter: `blur(${Math.random() > 0.8 ? '1px' : '0px'})`, // සමහර ඒවා පොඩ්ඩක් blur කරන්න depth එක ගන්න
          }}
        >
          ❤️
        </div>
      ))}
      <style>{`
        @keyframes heart-rain {
          0% { 
            transform: translateY(0) rotate(0deg) scale(0.5); 
            opacity: 0; 
          }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { 
            transform: translateY(110vh) rotate(360deg) scale(1.2); 
            opacity: 0; 
          }
        }
        .animate-heart-rain { 
          animation: heart-rain linear infinite; 
        }
      `}</style>
    </div>
  );
};

export default SpecialDayEffects;