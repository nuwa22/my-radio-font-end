import React, { useMemo } from 'react';

const SpecialDayEffects = () => {
  // හදවත් ප්‍රමාණය 30කට සීමා කළා Performance එක පවත්වා ගන්න
  // useMemo පාවිච්චි කළේ Page එක refresh වෙද්දී හදවත් වල position වෙනස් නොවී තිබෙන්නයි
  const hearts = useMemo(() => Array.from({ length: 30 }), []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
      {hearts.map((_, i) => (
        <div
          key={i}
          className="absolute text-pink-500 animate-heart-rain opacity-0"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-10vh`,
            // එක එක හදවත වැටෙන වේගය වෙනස් කළා (තත්පර 10 සිට 20 දක්වා - ඉතා ස්ලෝ)
            animationDuration: `${10 + Math.random() * 10}s`,
            animationDelay: `${Math.random() * 15}s`,
            fontSize: `${Math.random() * (22 - 14) + 14}px`,
            // Smoothness එක වැඩි කරන්න GPU Acceleration පාවිච්චි කරනවා
            willChange: 'transform, opacity',
          }}
        >
          ❤️
        </div>
      ))}
      <style>{`
        @keyframes heart-rain {
          0% { 
            transform: translateY(0) rotate(0deg) scale(0.8); 
            opacity: 0; 
          }
          15% { 
            opacity: 0.6; 
          }
          85% { 
            opacity: 0.6; 
          }
          100% { 
            /* පහළට වැටෙන දුර සහ කරකැවෙන ප්‍රමාණය */
            transform: translateY(115vh) rotate(180deg) scale(1.1); 
            opacity: 0; 
          }
        }
        .animate-heart-rain { 
          /* linear පාවිච්චි කිරීමෙන් එකම වේගයකින් (Smooth) වැටේ */
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          animation-name: heart-rain;
        }
      `}</style>
    </div>
  );
};

export default SpecialDayEffects;