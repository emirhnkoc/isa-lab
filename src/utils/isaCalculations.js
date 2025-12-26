export const calculateISA = (altitudeFt, isaDeviation = 0) => {
  // Constants
  const g = 9.80665; // m/s^2
  const R = 287.05287; // J/(kg*K)
  const gamma = 1.40; // Adiabatic index

  // Standard Sea Level values
  const P0 = 101325; // Pa
  const T0 = 288.15; // K (15°C)
  const L = 0.0065; // K/m (Lapse rate in Troposphere)

  // Tropopause values
  const H_tropopause_m = 11000; // m
  const H_tropopause_ft = H_tropopause_m * 3.28084;

  // Convert altitude to meters for calculation
  const altitudeM = altitudeFt / 3.28084;

  let T_isa_K;
  let P_Pa;

  if (altitudeM <= H_tropopause_m) {
    // Troposphere
    T_isa_K = T0 - (L * altitudeM);
    P_Pa = P0 * Math.pow(1 - (L * altitudeM) / T0, (g / (R * L)));
  } else {
    // Stratosphere (Isothermal region up to 20km, simplified for 0-60k ft app)
    // First calculate values at Tropopause
    const T_tropo = T0 - (L * H_tropopause_m);
    const P_tropo = P0 * Math.pow(1 - (L * H_tropopause_m) / T0, (g / (R * L)));

    // In Stratosphere, T is constant (Isothermal)
    T_isa_K = T_tropo;
    // Pressure formula for isothermal layer
    // P = P1 * exp(-g/RT * (H-H1))
    const deltaH = altitudeM - H_tropopause_m;
    P_Pa = P_tropo * Math.exp((-g * deltaH) / (R * T_tropo));
  }

  // Apply ISA Deviation to Temperature
  // Deviation is usually given in Delta C (or K)
  const T_actual_K = T_isa_K + isaDeviation;
  const T_actual_C = T_actual_K - 273.15;
  const T_actual_F = (T_actual_C * 9 / 5) + 32;

  // Calculate Density (rho)
  // rho = P / (R * T)
  const density = P_Pa / (R * T_actual_K);

  // Standard Sea Level Density
  const rho0 = 1.225; // kg/m^3
  const densityRatio = (density / rho0) * 100; // Percentage of SL equivalent

  // Speed of Sound (a)
  // a = sqrt(gamma * R * T)
  const speedOfSoundMps = Math.sqrt(gamma * R * T_actual_K);
  const speedOfSoundKts = speedOfSoundMps * 1.94384;

  // Pressure conversions
  const pressureHPa = P_Pa / 100;
  const pressureInHg = pressureHPa * 0.02953;

  // Density Altitude Calculation (Approximation)
  // DA = Pressure Altitude + (120 * (T_actual_C - T_isa_C))
  // We can calculate T_isa_C from T_isa_K
  const T_isa_C = T_isa_K - 273.15;
  // This is a rough pilot's rule of thumb: DA = PA + 120 * (Ostdev)
  // More precise: DA is the altitude in ISA where density equals current density.
  // In Troposphere: density_isa(H_da) = current_density
  // current_density = P_actual / (R * T_actual)
  // In ISA: P(H) = P0 * ... , T(H) = T0 - L*H
  // Solving this analytically is complex, stick to the rule of thumb or an iterative approach if needed.
  // For this app, the rule of thumb is usually sufficient for aviation displays:
  const densityAltitude = altitudeFt + (120 * (T_actual_C - T_isa_C));

  return {
    altitudeFt,
    isaDeviation,
    tempC: parseFloat(T_actual_C.toFixed(1)),
    tempF: parseFloat(T_actual_F.toFixed(1)),
    pressureHPa: parseFloat(pressureHPa.toFixed(1)),
    pressureInHg: parseFloat(pressureInHg.toFixed(2)),
    densityKgM3: parseFloat(density.toFixed(3)),
    densityRatio: parseFloat(densityRatio.toFixed(1)),
    speedOfSoundKts: parseFloat(speedOfSoundKts.toFixed(1)),
    speedOfSoundMach: 1.0, // Reference for Mach 1 at this temp
    densityAltitude: Math.round(densityAltitude),
    isaTempC: parseFloat(T_isa_C.toFixed(1))
  };
};
