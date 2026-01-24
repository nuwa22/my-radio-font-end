// src/components/ErrorMessage.jsx
import React from 'react';

const ErrorMessage = ({ message, onRetry }) => {
  return (

    <div className="flex flex-col items-center justify-center p-8 bg-[#1a0b2e]/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-lg mx-auto text-center mt-10 relative overflow-hidden">
      
    
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-50"></div>
      
   
      <div className="text-5xl mb-6 animate-bounce drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]">
        ⚠️
      </div>

     
      <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">
        Something went wrong!
      </h3>

      
      <p className="text-gray-300 mb-8 leading-relaxed font-light">
        {message || "We encountered an error while loading the data. Please check your connection or try again later."}
      </p>

    
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-8 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full font-bold hover:scale-105 hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all duration-300 focus:outline-none border border-white/10"
        >
          Retry Connection
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;