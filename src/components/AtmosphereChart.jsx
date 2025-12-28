import React, { useMemo } from 'react';
import {
    ComposedChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    ReferenceArea,
} from 'recharts';
import { calculateISA } from '../utils/isaCalculations';

const AtmosphereChart = ({ currentAltitude, isaDeviation, units = 'imperial', showTemp = true, showPressure = true, showDensity = true }) => {
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
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                    layout="vertical"
                    data={data}
                    margin={{ top: 25, right: 60, left: 20, bottom: 40 }}
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
                    {showTemp && (
                        <XAxis
                            type="number"
                            xAxisId="temp"
                            orientation="top"
                            domain={tempDomain}
                            stroke="#f97316"
                            tick={{ fontSize: 9, fill: '#f97316' }}
                            tickFormatter={(v) => `${v}°`}
                        />
                    )}
                    {showPressure && (
                        <XAxis
                            type="number"
                            xAxisId="pressure"
                            orientation="bottom"
                            domain={pressureDomain}
                            stroke="#38bdf8"
                            tick={{ fontSize: 9, fill: '#38bdf8' }}
                        />
                    )}
                    {showDensity && (
                        <XAxis
                            type="number"
                            xAxisId="density"
                            orientation="bottom"
                            domain={[0, 1.3]}
                            stroke="#10b981"
                            tick={{ fontSize: 9, fill: '#10b981' }}
                            tickFormatter={(v) => v.toFixed(1)}
                        />
                    )}
                    {/* Hidden axes for when lines are hidden but we still need axis references */}
                    {!showTemp && <XAxis type="number" xAxisId="temp" hide domain={tempDomain} />}
                    {!showPressure && <XAxis type="number" xAxisId="pressure" hide domain={pressureDomain} />}
                    {!showDensity && <XAxis type="number" xAxisId="density" hide domain={[0, 1.3]} />}

                    {/* Atmosphere Layers Background Areas */}
                    <ReferenceArea
                        y1={0}
                        y2={36089}
                        fill="#3b82f6"
                        fillOpacity={0.03}
                    />
                    <ReferenceArea
                        y1={36089}
                        y2={60000}
                        fill="#6366f1"
                        fillOpacity={0.05}
                    />

                    {/* Tropopause Boundary Line */}
                    <ReferenceLine
                        y={36089}
                        stroke="#94a3b8"
                        strokeDasharray="3 3"
                        strokeOpacity={0.5}
                        label={{
                            value: 'TROPOPAUSE',
                            position: 'insideTopRight',
                            fill: '#94a3b8',
                            fontSize: 9,
                            fontWeight: 'bold',
                            offset: 10
                        }}
                    />

                    {/* Stratosphere Label */}
                    <ReferenceLine
                        y={48000}
                        stroke="transparent"
                        label={{
                            value: 'STRATOSPHERE',
                            position: 'insideRight',
                            fill: '#818cf8',
                            fontSize: 9,
                            fontWeight: 'black',
                            letterSpacing: '0.2em'
                        }}
                    />

                    {/* Troposphere Label */}
                    <ReferenceLine
                        y={18000}
                        stroke="transparent"
                        label={{
                            value: 'TROPOSPHERE',
                            position: 'insideRight',
                            fill: '#38bdf8',
                            fontSize: 9,
                            fontWeight: 'black',
                            letterSpacing: '0.2em'
                        }}
                    />

                    <Tooltip content={<CustomTooltip />} />

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
                            offset: 20
                        }}
                    />

                    {/* Standard Temp - Dashed Yellow */}
                    {showTemp && (
                        <Line
                            dataKey={units === 'metric' ? 'tempStd' : 'tempStdF'}
                            xAxisId="temp"
                            type="monotone"
                            stroke="#fcd34d"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                            name="tempStd"
                            isAnimationActive={false}
                        />
                    )}

                    {/* Actual Temp - Solid Orange - INSTANT UPDATE */}
                    {showTemp && (
                        <Line
                            dataKey={units === 'metric' ? 'tempActual' : 'tempActualF'}
                            xAxisId="temp"
                            type="monotone"
                            stroke="#f97316"
                            strokeWidth={3}
                            dot={false}
                            name="tempActual"
                            isAnimationActive={false}
                        />
                    )}

                    {/* Pressure - Solid Cyan */}
                    {showPressure && (
                        <Line
                            dataKey={units === 'metric' ? 'pressureActualHPa' : 'pressureActual'}
                            xAxisId="pressure"
                            type="monotone"
                            stroke="#38bdf8"
                            strokeWidth={2}
                            dot={false}
                            name="pressureActual"
                            isAnimationActive={false}
                        />
                    )}

                    {/* Density - Solid Emerald */}
                    {showDensity && (
                        <Line
                            dataKey="densityActual"
                            xAxisId="density"
                            type="monotone"
                            stroke="#10b981"
                            strokeWidth={2}
                            dot={false}
                            name="densityActual"
                            isAnimationActive={false}
                        />
                    )}

                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AtmosphereChart;
