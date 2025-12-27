import React, { useMemo } from 'react';
import {
    ComposedChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';
import { calculateISA } from '../utils/isaCalculations';

const AtmosphereChart = ({ currentAltitude, isaDeviation, units = 'imperial' }) => {
    // Generate data points for the entire altitude range (0 - 60k ft)
    const data = useMemo(() => {
        const points = [];
        for (let h = 0; h <= 60000; h += 2000) {
            const standard = calculateISA(h, 0);       // STANDARD
            const actual = calculateISA(h, isaDeviation); // ACTUAL with deviation

            points.push({
                alt: h,
                altM: Math.round(h * 0.3048),
                // Standard values
                tempStd: standard.tempC,
                tempStdF: standard.tempF,
                pressureStd: standard.pressureInHg,
                pressureStdHPa: standard.pressureHPa,
                // Actual values
                tempActual: actual.tempC,
                tempActualF: actual.tempF,
                pressureActual: actual.pressureInHg,
                pressureActualHPa: actual.pressureHPa,
                densityActual: actual.densityKgM3,
            });
        }
        return points;
    }, [isaDeviation]);

    // Custom Tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const altData = payload[0]?.payload;
            return (
                <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl text-xs font-mono">
                    <p className="text-slate-300 font-bold mb-2 border-b border-slate-700 pb-1">
                        Alt: {units === 'metric' ? `${altData?.altM} m` : `${label} ft`}
                    </p>
                    <p className="text-orange-400">
                        Actual Temp: {units === 'metric' ? `${altData?.tempActual}°C` : `${altData?.tempActualF}°F`}
                    </p>
                    <p className="text-amber-300">
                        Std Temp: {units === 'metric' ? `${altData?.tempStd}°C` : `${altData?.tempStdF}°F`}
                    </p>
                    <p className="text-sky-400">
                        Pressure: {units === 'metric' ? `${altData?.pressureActualHPa} hPa` : `${altData?.pressureActual} inHg`}
                    </p>
                    <p className="text-emerald-400">
                        Density: {altData?.densityActual} kg/m³
                    </p>
                </div>
            );
        }
        return null;
    };

    // Determine axis labels based on units
    const tempUnit = units === 'metric' ? '°C' : '°F';
    const pressureUnit = units === 'metric' ? 'hPa' : 'inHg';
    const altUnit = units === 'metric' ? 'm' : 'ft';

    // Temp domain based on units
    const tempDomain = units === 'metric' ? [-80, 40] : [-112, 104];
    const pressureDomain = units === 'metric' ? [0, 1100] : [0, 32];

    return (
        <div className="w-full h-full bg-slate-900/50 rounded-xl p-4 border border-slate-700/50 backdrop-blur-sm relative min-h-[400px]">
            {/* Layer Indicators (Background) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
                {/* Troposphere background tint */}
                <div className="absolute bottom-0 w-full h-[60%] bg-blue-500/5" />
                {/* Stratosphere background tint */}
                <div className="absolute top-0 w-full h-[40%] bg-indigo-500/5" />

                {/* Tropopause line */}
                <div className="absolute bottom-[60%] w-full h-[1px] bg-slate-400/30 border-t border-dashed border-slate-500/50" />

                {/* Labels - Made brighter as requested */}
                <div className="absolute bottom-[62%] right-4 text-[10px] text-indigo-300 font-bold font-mono tracking-widest uppercase opacity-70">Stratosphere</div>
                <div className="absolute bottom-[57%] right-4 text-[10px] text-sky-300 font-bold font-mono tracking-widest uppercase opacity-70">Troposphere</div>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                    layout="vertical"
                    data={data}
                    margin={{ top: 60, right: 40, left: 20, bottom: 60 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />

                    {/* Y Axis: Altitude */}
                    <YAxis
                        dataKey="alt"
                        type="number"
                        domain={[0, 60000]}
                        tickCount={7}
                        stroke="#94a3b8"
                        tickFormatter={(value) => units === 'metric' ? `${Math.round(value * 0.3048 / 1000)}k` : `${value / 1000}k`}
                        width={45}
                        style={{ fontSize: '10px', fontFamily: 'monospace' }}
                        label={{
                            value: `ALTitude (${altUnit})`,
                            angle: -90,
                            position: 'insideLeft',
                            fill: '#94a3b8',
                            fontSize: 10,
                            offset: -10,
                            style: { textAnchor: 'middle', fontWeight: 'bold' }
                        }}
                    />

                    {/* X Axes */}
                    <XAxis
                        type="number"
                        xAxisId="temp"
                        orientation="top"
                        domain={tempDomain}
                        stroke="#f97316"
                        tick={{ fontSize: 10, fill: '#f97316' }}
                        label={{
                            value: `TEMP (${tempUnit})`,
                            position: 'top',
                            fill: '#f97316',
                            fontSize: 10,
                            offset: 15,
                            style: { fontWeight: 'bold' }
                        }}
                    />
                    <XAxis
                        type="number"
                        xAxisId="pressure"
                        orientation="bottom"
                        domain={pressureDomain}
                        stroke="#38bdf8"
                        tick={{ fontSize: 10, fill: '#38bdf8' }}
                        label={{
                            value: `PRESSURE (${pressureUnit})`,
                            position: 'bottom',
                            fill: '#38bdf8',
                            fontSize: 10,
                            offset: 20,
                            style: { fontWeight: 'bold' }
                        }}
                    />

                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        verticalAlign="top"
                        align="center"
                        height={40}
                        content={({ payload }) => (
                            <div className="flex flex-wrap justify-center gap-x-8 gap-y-1 mb-4 text-[10px] font-bold uppercase tracking-widest">
                                {payload.map((entry, index) => {
                                    const labels = {
                                        'tempStd': `Standard Temperature`,
                                        'tempActual': `Actual Temperature`,
                                        'pressureActual': `Atmospheric Pressure`
                                    };
                                    return (
                                        <div key={`item-${index}`} className="flex items-center gap-2" style={{ color: entry.color }}>
                                            <div className="flex items-center">
                                                {entry.payload.strokeDasharray ? (
                                                    <div className="w-4 h-[2px] border-t-2 border-dashed" style={{ borderColor: entry.color }} />
                                                ) : (
                                                    <div className="w-4 h-[2px]" style={{ backgroundColor: entry.color }} />
                                                )}
                                            </div>
                                            <span className="opacity-80 transition-opacity cursor-default">
                                                {labels[entry.value] || entry.value}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    />

                    {/* Reference Line for Current Altitude */}
                    <ReferenceLine
                        y={currentAltitude}
                        stroke="#ef4444"
                        strokeDasharray="4 4"
                        strokeWidth={2}
                        label={{
                            position: 'insideBottomRight',
                            value: '✈ YOU',
                            fill: '#ef4444',
                            fontSize: 12,
                            fontWeight: 'bold',
                            offset: 15
                        }}
                    />

                    {/* Standard Temp - Dashed Yellow */}
                    <Line
                        dataKey={units === 'metric' ? 'tempStd' : 'tempStdF'}
                        xAxisId="temp"
                        type="monotone"
                        stroke="#fcd34d"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                        name="tempStd"
                        animationDuration={0}
                    />

                    {/* Actual Temp - Solid Orange */}
                    <Line
                        dataKey={units === 'metric' ? 'tempActual' : 'tempActualF'}
                        xAxisId="temp"
                        type="monotone"
                        stroke="#f97316"
                        strokeWidth={3}
                        dot={false}
                        name="tempActual"
                        animationDuration={0}
                    />

                    {/* Pressure - Solid Cyan */}
                    <Line
                        dataKey={units === 'metric' ? 'pressureActualHPa' : 'pressureActual'}
                        xAxisId="pressure"
                        type="monotone"
                        stroke="#38bdf8"
                        strokeWidth={2}
                        dot={false}
                        name="pressureActual"
                        animationDuration={0}
                    />

                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AtmosphereChart;
