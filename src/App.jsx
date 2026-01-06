import React, { useState, useMemo } from 'react';
import InputPanel from './components/InputPanel';
import DataCard from './components/DataCard';
import AtmosphereChart from './components/AtmosphereChart';
import { calculateISA } from './utils/isaCalculations';
import { Globe, LayoutDashboard, Thermometer, RotateCcw } from 'lucide-react';

function App() {
    const [altitude, setAltitude] = useState(0);
    const [isaDeviation, setIsaDeviation] = useState(0);
    const [units, setUnits] = useState('metric');

    // Chart visibility toggles
    const [showTemp, setShowTemp] = useState(true);
    const [showPressure, setShowPressure] = useState(true);
    const [showDensity, setShowDensity] = useState(true);

    const metrics = useMemo(() => calculateISA(altitude, isaDeviation), [altitude, isaDeviation]);

    const daDiff = metrics.densityAltitude - altitude;
    const daAlertLevel = daDiff > 3000 ? 'critical' : daDiff > 1000 ? 'warning' : 'normal';

    const ftToM = (ft) => Math.round(ft * 0.3048);
    const mToFt = (m) => Math.round(m / 0.3048);
    const ktsToKmh = (kts) => Math.round(kts * 1.852);

    const displayAlt = units === 'metric' ? `${ftToM(altitude).toLocaleString()} m` : `${altitude.toLocaleString()} ft`;
    const displayFL = `FL${Math.round(altitude / 100).toString().padStart(3, '0')}`;

    // Global reset function
    const handleGlobalReset = () => {
        setAltitude(0);
        setIsaDeviation(0);
        setShowTemp(true);
        setShowPressure(true);
        setShowDensity(true);
    };

    // Altitude slider max value
    const maxAltFt = 60000;
    const sliderPercent = (altitude / maxAltFt) * 100;
    const isaSliderPercent = ((isaDeviation + 30) / 60) * 100;

    return (
        <div className="flex flex-col lg:flex-row h-screen w-screen overflow-hidden bg-[#0a0f18] text-slate-100 font-sans selection:bg-blue-500/30">

            {/* Desktop Sidebar - Hidden on mobile */}
            <div className="hidden lg:block">
                <InputPanel
                    altitude={altitude}
                    setAltitude={setAltitude}
                    isaDeviation={isaDeviation}
                    setIsaDeviation={setIsaDeviation}
                    units={units}
                    setUnits={setUnits}
                    onReset={handleGlobalReset}
                />
            </div>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(51,65,85,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(51,65,85,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-transparent pointer-events-none" />

                {/* Mobile Compact Control Panel */}
                <div className="lg:hidden shrink-0 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/60 z-20">
                    {/* Header Row */}
                    <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/40">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-blue-600 rounded-lg">
                                <Globe className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-sm font-bold">ISA LAB</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${altitude > 36089 ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-sky-500/10 text-sky-400 border-sky-500/20'}`}>
                                {altitude > 36089 ? 'STRATO' : 'TROPO'}
                            </div>
                            <button
                                onClick={() => setUnits(units === 'metric' ? 'imperial' : 'metric')}
                                className="px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-[9px] font-bold uppercase"
                            >
                                {units === 'metric' ? 'M' : 'IMP'}
                            </button>
                            <button
                                onClick={handleGlobalReset}
                                className="p-1.5 rounded-md bg-slate-800 border border-slate-700 text-slate-400 hover:text-red-400 transition-colors"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Altitude Control Row */}
                    <div className="px-3 py-2">
                        <div className="flex items-center gap-3">
                            <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider w-8 shrink-0">ALT</span>
                            <div className="flex-1 relative h-6">
                                <div className="absolute inset-x-2 inset-y-0 bg-slate-800 rounded-full border border-slate-700">
                                    <div
                                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-sky-400 rounded-full"
                                        style={{ width: `${sliderPercent}%` }}
                                    />
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max={maxAltFt}
                                    step="100"
                                    value={altitude}
                                    onChange={(e) => setAltitude(Number(e.target.value))}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div
                                    className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-lg border-2 border-blue-500 pointer-events-none z-20"
                                    style={{ left: `calc(${sliderPercent}% - ${sliderPercent * 0.2}px)` }}
                                />
                            </div>
                            <div className="bg-slate-800 border border-slate-700 rounded-md px-2 py-1 min-w-[70px] text-center">
                                <span className="text-sm font-mono font-bold text-white">
                                    {units === 'metric' ? ftToM(altitude).toLocaleString() : altitude.toLocaleString()}
                                </span>
                                <span className="text-[8px] text-slate-500 ml-1">{units === 'metric' ? 'm' : 'ft'}</span>
                            </div>
                        </div>
                    </div>

                    {/* ISA Deviation Row */}
                    <div className="px-3 py-2 border-t border-slate-800/40">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 w-8 shrink-0">
                                <Thermometer className="w-3 h-3 text-orange-500" />
                                <span className="text-[9px] font-bold text-orange-400 uppercase">ISA</span>
                            </div>
                            <div className="flex-1 relative h-5">
                                <div className="absolute inset-x-2 inset-y-0 bg-slate-800 rounded-full border border-slate-700">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-[1px] h-full bg-slate-600" />
                                    </div>
                                </div>
                                <input
                                    type="range"
                                    min="-30"
                                    max="30"
                                    step="1"
                                    value={isaDeviation}
                                    onChange={(e) => setIsaDeviation(Number(e.target.value))}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div
                                    className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-lg border-2 pointer-events-none z-20 ${isaDeviation > 0 ? 'bg-orange-500 border-orange-400' :
                                            isaDeviation < 0 ? 'bg-sky-400 border-sky-300' :
                                                'bg-slate-400 border-slate-300'
                                        }`}
                                    style={{ left: `calc(${isaSliderPercent}% - ${isaSliderPercent * 0.16}px)` }}
                                />
                            </div>
                            <div className={`min-w-[50px] text-center font-mono font-bold text-sm ${isaDeviation > 0 ? 'text-orange-500' :
                                isaDeviation < 0 ? 'text-sky-400' :
                                    'text-slate-500'
                                }`}>
                                {isaDeviation > 0 ? '+' : ''}{isaDeviation}°C
                            </div>
                        </div>
                    </div>
                </div>

                {/* Desktop Header */}
                <header className="hidden lg:flex h-14 border-b border-slate-800/60 items-center px-6 justify-between bg-slate-900/40 backdrop-blur-md z-10">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 px-3 py-1 bg-slate-800/50 rounded-lg border border-slate-700/50">
                            <Globe className="w-3.5 h-3.5 text-blue-400" />
                            <span className="text-[11px] font-bold font-mono tracking-widest text-slate-300">
                                {displayFL} / {displayAlt}
                            </span>
                        </div>
                        <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-[0.2em] border ${altitude > 36089 ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-sky-500/10 text-sky-400 border-sky-500/20'}`}>
                            {altitude > 36089 ? 'Stratosphere' : 'Troposphere'}
                        </div>
                    </div>
                </header>

                {/* Dashboard */}
                <div className="flex-1 p-2 sm:p-3 lg:p-6 flex flex-col gap-2 sm:gap-3 lg:gap-6 overflow-y-auto">

                    {/* Metrics Grid - Responsive columns */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5 sm:gap-2 lg:gap-4">
                        <DataCard
                            label="Temperature"
                            value={units === 'metric' ? metrics.tempC : metrics.tempF}
                            unit={units === 'metric' ? '°C' : '°F'}
                            subValue={units === 'metric' ? `${metrics.tempF}°F` : `${metrics.tempC}°C`}
                        />
                        <DataCard
                            label="Pressure"
                            value={units === 'metric' ? metrics.pressureHPa : metrics.pressureInHg}
                            unit={units === 'metric' ? 'hPa' : 'inHg'}
                            subValue={units === 'metric' ? `${metrics.pressureInHg} inHg` : `${metrics.pressureHPa} hPa`}
                        />
                        <DataCard
                            label="Density"
                            value={metrics.densityKgM3}
                            unit="kg/m³"
                            subValue={`Ratio: ${metrics.densityRatio}%`}
                        />
                        <DataCard
                            label="Speed of Sound"
                            value={(metrics.speedOfSoundKts * 0.514444).toFixed(1)}
                            unit="m/s"
                            subValue={units === 'metric' ? `${ktsToKmh(metrics.speedOfSoundKts)} km/h` : `${metrics.speedOfSoundKts} kts`}
                        />
                        <DataCard
                            label="Density Altitude"
                            value={units === 'metric' ? ftToM(metrics.densityAltitude).toLocaleString() : metrics.densityAltitude.toLocaleString()}
                            unit={units === 'metric' ? 'm' : 'ft'}
                            subValue={`Offset: +${units === 'metric' ? ftToM(daDiff).toLocaleString() : daDiff.toLocaleString()}`}
                            alert={daAlertLevel !== 'normal'}
                        />
                    </div>

                    {/* Chart Area */}
                    <div className="flex-1 flex flex-col gap-1.5 lg:gap-4 min-h-[250px] lg:min-h-[450px]">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 px-1">
                            <div className="flex items-center gap-2 lg:gap-3">
                                <div className="w-5 h-5 lg:w-8 lg:h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                                    <LayoutDashboard className="w-2.5 h-2.5 lg:w-4 lg:h-4 text-slate-400" />
                                </div>
                                <h2 className="text-[9px] lg:text-xs font-bold text-slate-200 uppercase tracking-[0.15em] lg:tracking-[0.2em] leading-none">Graph</h2>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-3">
                                <button
                                    onClick={() => setShowTemp(!showTemp)}
                                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md transition-all ${showTemp ? 'opacity-100 bg-slate-800/50' : 'opacity-40 hover:opacity-70'}`}
                                >
                                    <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-orange-500 ${showTemp ? 'shadow-[0_0_8px_rgba(249,115,22,0.4)]' : ''}`} />
                                    <span className="text-[8px] sm:text-[10px] font-bold text-orange-400 uppercase tracking-wider">Temp</span>
                                </button>
                                <button
                                    onClick={() => setShowPressure(!showPressure)}
                                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md transition-all ${showPressure ? 'opacity-100 bg-slate-800/50' : 'opacity-40 hover:opacity-70'}`}
                                >
                                    <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-sky-500 ${showPressure ? 'shadow-[0_0_8px_rgba(56,189,248,0.4)]' : ''}`} />
                                    <span className="text-[8px] sm:text-[10px] font-bold text-sky-400 uppercase tracking-wider">Pressure</span>
                                </button>
                                <button
                                    onClick={() => setShowDensity(!showDensity)}
                                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md transition-all ${showDensity ? 'opacity-100 bg-slate-800/50' : 'opacity-40 hover:opacity-70'}`}
                                >
                                    <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 ${showDensity ? 'shadow-[0_0_8px_rgba(16,185,129,0.4)]' : ''}`} />
                                    <span className="text-[8px] sm:text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Density</span>
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 relative">
                            <AtmosphereChart
                                currentAltitude={altitude}
                                isaDeviation={isaDeviation}
                                units={units}
                                showTemp={showTemp}
                                showPressure={showPressure}
                                showDensity={showDensity}
                            />
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}

export default App;
