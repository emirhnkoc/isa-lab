import React, { useState, useMemo } from 'react';
import InputPanel from './components/InputPanel';
import DataCard from './components/DataCard';
import AtmosphereChart from './components/AtmosphereChart';
import { calculateISA } from './utils/isaCalculations';
import { Globe, LayoutDashboard, Menu, X } from 'lucide-react';

function App() {
    const [altitude, setAltitude] = useState(0);
    const [isaDeviation, setIsaDeviation] = useState(0);
    const [units, setUnits] = useState('metric');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const metrics = useMemo(() => calculateISA(altitude, isaDeviation), [altitude, isaDeviation]);

    const daDiff = metrics.densityAltitude - altitude;
    const daAlertLevel = daDiff > 3000 ? 'critical' : daDiff > 1000 ? 'warning' : 'normal';

    const ftToM = (ft) => Math.round(ft * 0.3048);
    const ktsToKmh = (kts) => Math.round(kts * 1.852);

    const displayAlt = units === 'metric' ? `${ftToM(altitude).toLocaleString()} m` : `${altitude.toLocaleString()} ft`;
    const displayFL = `FL${Math.round(altitude / 100).toString().padStart(3, '0')}`;

    return (
        <div className="flex flex-col lg:flex-row h-screen w-screen overflow-hidden bg-[#0a0f18] text-slate-100 font-sans selection:bg-blue-500/30">

            {/* Mobile Header */}
            <header className="lg:hidden h-14 border-b border-slate-800/60 flex items-center px-4 justify-between bg-slate-900/80 backdrop-blur-md z-30 shrink-0">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 transition-all"
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-600 rounded-lg">
                            <Globe className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-bold">ISA LAB</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-2 py-1 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <span className="text-[10px] font-bold font-mono text-slate-300">
                        {displayFL} / {displayAlt}
                    </span>
                </div>
            </header>

            {/* Mobile Drawer Overlay */}
            {mobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar - Desktop always visible, Mobile as drawer */}
            <div className={`
        fixed lg:relative inset-y-0 left-0 z-50
        transform transition-transform duration-300 ease-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <InputPanel
                    altitude={altitude}
                    setAltitude={setAltitude}
                    isaDeviation={isaDeviation}
                    setIsaDeviation={setIsaDeviation}
                    units={units}
                    setUnits={setUnits}
                    onClose={() => setMobileMenuOpen(false)}
                    isMobile={mobileMenuOpen}
                />
            </div>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(51,65,85,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(51,65,85,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-transparent pointer-events-none" />

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
                <div className="flex-1 p-3 sm:p-4 lg:p-6 flex flex-col gap-4 lg:gap-6 overflow-y-auto">

                    {/* Metrics Grid - Responsive columns */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
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
                    <div className="flex-1 flex flex-col gap-2 lg:gap-4 min-h-[300px] lg:min-h-[450px]">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 px-1">
                            <div className="flex items-center gap-2 lg:gap-3">
                                <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                                    <LayoutDashboard className="w-3 h-3 lg:w-4 lg:h-4 text-slate-400" />
                                </div>
                                <div>
                                    <h2 className="text-[10px] lg:text-xs font-bold text-slate-200 uppercase tracking-[0.15em] lg:tracking-[0.2em] leading-none">Graph</h2>
                                </div>
                            </div>
                            <div className="hidden sm:flex gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Temperature</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(56,189,248,0.4)]" />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pressure</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 relative">
                            <AtmosphereChart currentAltitude={altitude} isaDeviation={isaDeviation} units={units} />
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}

export default App;
