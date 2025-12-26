import React from 'react';

const DataCard = ({ label, value, unit, subValue, trend, alert }) => {
    return (
        <div className={`relative overflow-hidden bg-slate-800 rounded-xl border p-4 transition-all duration-300 ${alert ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)] animate-pulse-glow' : 'border-slate-700 shadow-lg'}`}>

            {/* Background Decor */}
            <div className="absolute top-0 right-0 p-4 opacity-5">
                <div className="w-16 h-16 rounded-full bg-slate-400 blur-xl"></div>
            </div>

            <div className="flex flex-col h-full justify-between relative z-10 w-full">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 truncate">
                    {label}
                </div>

                <div className="flex items-baseline gap-1">
                    <span className={`text-3xl font-bold font-mono ${alert ? 'text-red-400' : 'text-slate-100'}`}>
                        {value}
                    </span>
                    <span className="text-sm text-slate-500 font-medium">{unit}</span>
                </div>

                {(subValue) && (
                    <div className="mt-2 pt-2 border-t border-slate-700/50 flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-mono">{subValue}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DataCard;
