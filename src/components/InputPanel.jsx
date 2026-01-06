import React, { useState, useEffect } from 'react';
import { Thermometer, Wind, RotateCcw } from 'lucide-react';

const InputPanel = ({
    altitude,
    setAltitude,
    isaDeviation,
    setIsaDeviation,
    units,
    setUnits,
    onReset
}) => {
    const [manualAltitude, setManualAltitude] = useState('');

    const ftToM = (ft) => Math.round(ft * 0.3048);
    const mToFt = (m) => Math.round(m / 0.3048);

    useEffect(() => {
        const val = units === 'metric' ? ftToM(altitude) : altitude;
        setManualAltitude(val.toString());
    }, [altitude, units]);

    const handleManualAltitudeChange = (e) => {
        const val = e.target.value;
        setManualAltitude(val);
        const num = parseInt(val, 10);
        if (!isNaN(num)) {
            const ftValue = units === 'metric' ? mToFt(num) : num;
            const clamped = Math.max(0, Math.min(60000, ftValue));
            setAltitude(clamped);
        }
    };

    const handleSliderChange = (e) => {
        const val = Number(e.target.value);
        setAltitude(val);
    };

    const handleIsaReset = () => {
        setIsaDeviation(0);
    };

    const sliderPercent = (altitude / 60000) * 100;

    return (
        <div className="h-full bg-slate-900 border-r border-slate-700 p-4 lg:p-6 flex flex-col gap-4 lg:gap-6 text-slate-100 shadow-2xl z-20 w-72 lg:w-80 relative shrink-0 overflow-y-auto">

            {/* Header */}
            <div className="flex items-center border-b border-slate-700 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-600/20">
                        <Wind className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-base lg:text-lg tracking-wider leading-none">ISA LAB</h1>
                        <p className="text-[9px] lg:text-[10px] text-slate-500 font-bold tracking-tighter uppercase mt-1">Atmosphere Analyzer</p>
                    </div>
                </div>
            </div>

            {/* Altitude Control */}
            <div className="flex-1 flex flex-col gap-3 min-h-0">
                <div className="flex justify-between items-end mb-1">
                    <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest leading-none">Altitude</label>
                    <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 shadow-inner group focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">
                        <input
                            type="number"
                            value={manualAltitude}
                            onChange={handleManualAltitudeChange}
                            className="w-16 lg:w-20 bg-transparent text-right font-mono font-bold text-white text-base lg:text-lg focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="text-[10px] text-slate-500 font-black ml-1 uppercase">{units === 'metric' ? 'm' : 'ft'}</span>
                    </div>
                </div>

                {/* Vertical Slider */}
                <div className="relative flex-1 min-h-[200px] lg:min-h-0 bg-slate-950/50 rounded-2xl shadow-inner border border-slate-700/50 overflow-hidden flex p-1">

                    <div className="w-12 lg:w-16 h-full relative flex items-center justify-center">
                        <div className="w-2 lg:w-2.5 h-[92%] bg-slate-800 rounded-full relative overflow-hidden ring-1 ring-slate-700/50">
                            <div
                                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-700 via-blue-500 to-sky-400 rounded-full transition-all duration-0"
                                style={{ height: `${sliderPercent}%` }}
                            />
                        </div>

                        <div
                            className="absolute left-1/2 -translate-x-1/2 w-8 lg:w-10 h-1.5 bg-slate-100 rounded-sm shadow-xl shadow-blue-500/40 transition-all duration-0 z-10 cursor-pointer ring-1 ring-blue-400"
                            style={{ bottom: `calc(${sliderPercent}% * 0.92 + 4% - 3px)` }}
                        />
                    </div>

                    <input
                        type="range"
                        min="0"
                        max="60000"
                        step="100"
                        value={altitude}
                        onChange={handleSliderChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                        style={{
                            writingMode: 'vertical-lr',
                            direction: 'rtl',
                        }}
                    />

                    <div className="flex-1 h-full flex flex-col justify-between py-4 lg:py-5 px-2 lg:px-3 text-[9px] lg:text-[10px] font-bold font-mono text-slate-500 select-none">
                        <div className="flex items-center gap-1 lg:gap-2">
                            <div className="w-2 h-[1px] bg-slate-700" />
                            <span>{units === 'metric' ? `${ftToM(60000).toLocaleString()}m` : '60k ft'}</span>
                        </div>
                        {[50000, 40000, 30000, 20000, 10000].map(val => (
                            <div key={val} className="flex items-center gap-1 lg:gap-2">
                                <div className="w-2 h-[1px] bg-slate-700" />
                                <span>{units === 'metric' ? `${ftToM(val).toLocaleString()}` : `${val / 1000}k`}</span>
                            </div>
                        ))}
                        <div className="flex items-center gap-1 lg:gap-2">
                            <div className="w-3 h-[1.5px] bg-slate-600" />
                            <span className="text-slate-400 uppercase tracking-widest">SL</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ISA Deviation */}
            <div className="flex flex-col gap-2 lg:gap-3 bg-slate-800/40 p-3 lg:p-4 rounded-xl border border-slate-700/60 shadow-lg">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Thermometer className="w-4 h-4 text-orange-500" />
                        <label className="text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">ISA Deviation</label>
                    </div>
                    <button
                        onClick={handleIsaReset}
                        className="text-[9px] font-bold text-slate-500 hover:text-orange-400 uppercase tracking-tighter flex items-center gap-1 transition-colors"
                    >
                        <RotateCcw className="w-2.5 h-2.5" />
                        Reset
                    </button>
                </div>
                <div className="flex justify-between items-center mb-1">
                    <span className={`font-mono font-bold text-base lg:text-lg ${isaDeviation > 0 ? 'text-orange-500' : isaDeviation < 0 ? 'text-sky-400' : 'text-slate-500'}`}>
                        {isaDeviation > 0 ? '+' : ''}{isaDeviation}°C
                    </span>
                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Offset</span>
                </div>
                <input
                    type="range"
                    min="-30"
                    max="30"
                    step="1"
                    value={isaDeviation}
                    onChange={(e) => setIsaDeviation(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <div className="flex justify-between text-[9px] lg:text-[10px] text-slate-500 font-bold font-mono">
                    <span>-30°C</span>
                    <span className="text-slate-600">STD</span>
                    <span>+30°C</span>
                </div>
            </div>

            {/* Unit Toggle */}
            <div className="flex items-center justify-between bg-slate-800/40 p-3 lg:p-4 rounded-xl border border-slate-700/60">
                <span className={`text-[10px] font-bold uppercase tracking-widest transition-all ${units === 'imperial' ? 'text-blue-400' : 'text-slate-600'}`}>Imperial</span>
                <button
                    onClick={() => setUnits(units === 'metric' ? 'imperial' : 'metric')}
                    className="relative w-12 h-6 bg-slate-800 rounded-full border border-slate-700 p-0.5 transition-all hover:border-slate-500 group"
                >
                    <div className={`w-5 h-5 bg-blue-600 rounded-full shadow-lg shadow-blue-600/40 transition-all duration-300 transform ${units === 'metric' ? 'translate-x-6' : 'translate-x-0'} group-hover:scale-110`} />
                </button>
                <span className={`text-[10px] font-bold uppercase tracking-widest transition-all ${units === 'metric' ? 'text-blue-400' : 'text-slate-600'}`}>Metric</span>
            </div>

            {/* Footer - Reset Only */}
            <div className="pt-3 lg:pt-4 border-t border-slate-800 flex items-center justify-center">
                <button
                    onClick={onReset}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-500 hover:text-red-400 hover:border-red-500/30 transition-all text-[10px] lg:text-[11px] font-bold uppercase tracking-wider"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset All</span>
                </button>
            </div>
        </div>
    );
};

export default InputPanel;
