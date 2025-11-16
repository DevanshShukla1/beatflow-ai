"use client";

export function LoadingAnimation() {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <div className="relative w-24 h-24">
        {/* Outer spinning ring */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-500 border-r-cyan-500 animate-spin"></div>
        
        {/* Middle spinning ring */}
        <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-blue-500 border-l-blue-500 animate-spin-slow"></div>
        
        {/* Inner pulsing circle */}
        <div className="absolute inset-6 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 animate-pulse"></div>
        
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-10 h-10 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>
      </div>
      
      <div className="text-center space-y-2">
        <p className="text-lg font-semibold text-cyan-400 animate-pulse">Generating Your Beat...</p>
        <p className="text-sm text-slate-400">AI is composing your unique music track</p>
      </div>
      
      {/* Animated sound waves */}
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-1 bg-gradient-to-t from-cyan-500 to-blue-500 rounded-full animate-wave"
            style={{
              height: '40px',
              animationDelay: `${i * 0.1}s`,
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}

