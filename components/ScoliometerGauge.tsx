import React from 'react';

interface ScoliometerGaugeProps {
  angle: number;
  isLocked: boolean;
}

const ScoliometerGauge: React.FC<ScoliometerGaugeProps> = ({ angle, isLocked }) => {
  const clampedAngle = Math.max(-30, Math.min(30, angle));
  const ballPosition = 50 + (clampedAngle / 30) * 45;

  return (
    <div className="relative w-full select-none">
      
      {/* Gauge Body - Attached to absolute bottom */}
      <div className="relative w-full h-28 bg-white border-t-[3px] border-rose-100 shadow-[0_-10px_30px_rgba(0,0,0,0.04)] flex items-center justify-center overflow-hidden gauge-gradient">
        
        {/* Alignment Cues - PLACED AT THE BOTTOM EDGE */}
        {/* Adjusted to px-[25%] to align roughly with the 15-degree marks */}
        <div className="absolute inset-x-0 bottom-0 flex justify-between px-[25%] pointer-events-none z-40 items-end">
           {/* Left Thumb Guide */}
           <div className="flex flex-col items-center opacity-40 pb-0.5">
              <span className="text-[6px] font-black text-slate-500 uppercase mb-0.5">L Thumb</span>
              <div className="w-8 h-4 border-t-2 border-x-2 border-slate-300 rounded-t-lg"></div>
           </div>
           
           {/* Center Spine Guide Notch - THE MOST IMPORTANT PART FOR PHYSICAL ALIGNMENT */}
           <div className="flex flex-col items-center pb-0">
              <span className="text-[7px] font-black text-rose-500 uppercase mb-1 tracking-tighter">Spine Center</span>
              <div className="w-14 h-8 bg-rose-50 border-x-2 border-t-2 border-rose-200 rounded-t-2xl flex flex-col items-center pt-1.5 shadow-sm">
                 <div className="w-1.5 h-4 bg-rose-600 rounded-t-full"></div>
              </div>
           </div>

           {/* Right Thumb Guide */}
           <div className="flex flex-col items-center opacity-40 pb-0.5">
              <span className="text-[6px] font-black text-slate-500 uppercase mb-0.5">R Thumb</span>
              <div className="w-8 h-4 border-t-2 border-x-2 border-slate-300 rounded-t-lg"></div>
           </div>
        </div>

        {/* Leveling Tube Container */}
        <div className="w-[96%] h-14 bg-rose-50/40 rounded-full border-2 border-rose-100 relative shadow-inner overflow-hidden flex items-center mb-6">
          
          {/* Vertical 0 reference line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[1.5px] bg-rose-300/40 z-10"></div>
          
          {/* Degree Ticks */}
          <div className="absolute inset-x-0 bottom-1.5 flex justify-between px-12 pointer-events-none text-[10px] font-black text-rose-300 uppercase tracking-tighter">
            <span>30°</span>
            <span className="opacity-30">15°</span>
            <span className="text-rose-500/30">0°</span>
            <span className="opacity-30">15°</span>
            <span>30°</span>
          </div>

          {/* The Measuring Ball - Smooth movement with transition-all */}
          <div 
            className={`absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full shadow-2xl transition-all duration-75 ease-out z-20 flex items-center justify-center
              ${isLocked ? 'bg-rose-600 scale-110' : 'bg-slate-800'}`}
            style={{ left: `${ballPosition}%`, marginLeft: '-1.25rem' }}
          >
             <div className="absolute top-1.5 left-2 w-3.5 h-2.5 bg-white/20 rounded-full blur-[1px]"></div>
             <div className="w-2 h-2 bg-white/40 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoliometerGauge;