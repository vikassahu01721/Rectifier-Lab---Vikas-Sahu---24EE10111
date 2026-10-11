import {
  ConverterConfig,
  WaveformPoint,
  RectifierMetrics,
  ConductionInterval,
  HarmonicComponent,
} from '../types/rectifier';

export function simulateRectifier(config: ConverterConfig): {
  points: WaveformPoint[];
  metrics: RectifierMetrics;
  intervals: ConductionInterval[];
  harmonics: HarmonicComponent[];
} {
  const {
    phase,
    bridge,
    deviceSetup,
    firingAngle,
    hasFWD,
    loadType,
    resistance: R,
    inductance: L_mH,
    backEMF: E_param,
    sourceRms: V_rms,
    frequency: f,
  } = config;

  const L = loadType === 'R' ? 0.0001 : Math.max(0.0005, L_mH * 1e-3); // Henries
  const E = loadType === 'RLE' ? Math.min(E_param, V_rms * 0.9) : 0; // Back EMF
  const omega = 2 * Math.PI * f;
  const T = 1 / f; // Period in seconds
  const Vm = V_rms * Math.sqrt(2); // Peak phase voltage

  // Step resolution: 720 points per cycle (0.5 degree resolution)
  const stepsPerCycle = 720;
  const totalCycles = 5; // Run 5 cycles to settle into periodic steady-state
  const totalSteps = totalCycles * stepsPerCycle;
  const dt = T / stepsPerCycle;
  const alphaRad = (firingAngle * Math.PI) / 180;

  // Track raw output voltage and load current
  let iCurrent = 0;
  const rawVo: number[] = new Array(totalSteps);
  const rawIo: number[] = new Array(totalSteps);
  const rawIs: number[] = new Array(totalSteps);
  const rawIfwd: number[] = new Array(totalSteps);
  const rawDevices: string[][] = new Array(totalSteps);
  const rawLabels: string[] = new Array(totalSteps);

  // Helper to determine conducting switch & output voltage at time step
  for (let step = 0; step < totalSteps; step++) {
    const t = step * dt;
    const theta = (omega * t) % (2 * Math.PI); // angle in [0, 2pi)

    let voNominal = 0;
    let isNominal = 0;
    let activeDevs: string[] = [];
    let label = 'OFF';

    if (phase === '1P') {
      const vs = Vm * Math.sin(theta);

      if (bridge === 'half') {
        // 1-Phase Half-Wave
        const isThyristor = deviceSetup === 'all_thyristors';
        const fireAngle = isThyristor ? alphaRad : 0;

        if (theta >= fireAngle && theta < Math.PI) {
          // Normal forward conduction
          voNominal = vs;
          isNominal = iCurrent;
          activeDevs = [isThyristor ? 'T1' : 'D1'];
          label = isThyristor ? 'T1' : 'D1';
        } else if (theta >= Math.PI && theta < 2 * Math.PI) {
          if (hasFWD && iCurrent > 0.05) {
            // Freewheeling diode conducts, clamps vo to 0
            voNominal = 0;
            isNominal = 0; // source is disconnected
            activeDevs = ['DFW'];
            label = 'DFW';
          } else if (!hasFWD && iCurrent > 0.05) {
            // Inductor maintains conduction, vo follows vs < 0
            voNominal = vs;
            isNominal = iCurrent;
            activeDevs = [isThyristor ? 'T1' : 'D1'];
            label = isThyristor ? 'T1' : 'D1';
          } else {
            // Discontinuous mode, both off
            voNominal = E;
            isNominal = 0;
            activeDevs = [];
            label = 'OFF';
          }
        } else if (theta < fireAngle) {
          if (hasFWD && iCurrent > 0.05) {
            voNominal = 0;
            isNominal = 0;
            activeDevs = ['DFW'];
            label = 'DFW';
          } else if (!hasFWD && iCurrent > 0.05) {
            voNominal = vs;
            isNominal = iCurrent;
            activeDevs = [isThyristor ? 'T1' : 'D1'];
            label = isThyristor ? 'T1' : 'D1';
          } else {
            voNominal = E;
            isNominal = 0;
            activeDevs = [];
            label = 'OFF';
          }
        }
      } else {
        // 1-Phase Full-Bridge
        const isThyristor = deviceSetup === 'all_thyristors';
        const isSemi = deviceSetup === 'semi_converter';
        const fireAngle = (isThyristor || isSemi) ? alphaRad : 0;

        // Positive half-cycle: 0 <= theta < pi
        if (theta >= fireAngle && theta < Math.PI) {
          voNominal = vs;
          isNominal = iCurrent;
          activeDevs = isThyristor ? ['T1', 'T2'] : isSemi ? ['T1', 'D2'] : ['D1', 'D2'];
          label = activeDevs.join('-');
        } else if (theta >= Math.PI + fireAngle && theta < 2 * Math.PI) {
          voNominal = -vs;
          isNominal = -iCurrent;
          activeDevs = isThyristor ? ['T3', 'T4'] : isSemi ? ['T3', 'D4'] : ['D3', 'D4'];
          label = activeDevs.join('-');
        } else if (theta >= Math.PI && theta < Math.PI + fireAngle) {
          // Between pi and pi + alpha
          if (hasFWD || isSemi) {
            voNominal = 0;
            isNominal = 0;
            activeDevs = ['DFW'];
            label = 'DFW';
          } else if (iCurrent > 0.05) {
            voNominal = vs; // negative excursion in fully-controlled bridge
            isNominal = iCurrent;
            activeDevs = ['T1', 'T2'];
            label = 'T1-T2';
          } else {
            voNominal = E;
            isNominal = 0;
            activeDevs = [];
            label = 'OFF';
          }
        } else if (theta < fireAngle) {
          // Between 0 and alpha
          if (hasFWD || isSemi) {
            voNominal = 0;
            isNominal = 0;
            activeDevs = ['DFW'];
            label = 'DFW';
          } else if (iCurrent > 0.05) {
            voNominal = -vs; // negative excursion from previous half cycle
            isNominal = -iCurrent;
            activeDevs = ['T3', 'T4'];
            label = 'T3-T4';
          } else {
            voNominal = E;
            isNominal = 0;
            activeDevs = [];
            label = 'OFF';
          }
        }
      }
    } else {
      // 3-Phase Converter
      // Phase voltages relative to neutral
      const va = Vm * Math.sin(theta);
      const vb = Vm * Math.sin(theta - (2 * Math.PI) / 3);
      const vc = Vm * Math.sin(theta + (2 * Math.PI) / 3);

      if (bridge === 'half') {
        // 3-Phase Half-Wave (3-pulse)
        // Natural crossover: Va highest from pi/6 to 5pi/6
        const isThyristor = deviceSetup === 'all_thyristors';
        const delay = isThyristor ? alphaRad : 0;

        const aStart = Math.PI / 6 + delay;
        const bStart = (5 * Math.PI) / 6 + delay;
        const cStart = (9 * Math.PI) / 6 + delay;

        let selectedV = 0;
        let selectedDev = '';

        const normTheta = (theta + 2 * Math.PI) % (2 * Math.PI);

        if (normTheta >= aStart && normTheta < bStart) {
          selectedV = va;
          selectedDev = isThyristor ? 'T1 (Phase A)' : 'D1 (Phase A)';
        } else if (normTheta >= bStart && normTheta < cStart) {
          selectedV = vb;
          selectedDev = isThyristor ? 'T2 (Phase B)' : 'D2 (Phase B)';
        } else {
          selectedV = vc;
          selectedDev = isThyristor ? 'T3 (Phase C)' : 'D3 (Phase C)';
        }

        if (selectedV < 0 && hasFWD && iCurrent > 0.05) {
          voNominal = 0;
          isNominal = 0;
          activeDevs = ['DFW'];
          label = 'DFW';
        } else {
          voNominal = selectedV;
          isNominal = iCurrent;
          activeDevs = [selectedDev.split(' ')[0]];
          label = selectedDev.split(' ')[0];
        }
      } else {
        // 3-Phase Full-Bridge (6-Pulse)
        // Line voltages
        const vab = va - vb;
        const vac = va - vc;
        const vbc = vb - vc;
        const vba = vb - va;
        const vca = vc - va;
        const vcb = vc - vb;

        const isThyristor = deviceSetup === 'all_thyristors';
        const delay = isThyristor ? alphaRad : 0;

        // 60-degree commutation intervals shifted by delay
        // Reference: vab peaks at pi/2 (90 deg), natural crossover at pi/3 (60 deg)
        const tShift = (theta - delay + 2 * Math.PI) % (2 * Math.PI);
        const deg = (tShift * 180) / Math.PI;

        let vLine = 0;
        let pair = ['D1', 'D6'];
        let pairLabel = 'D1-D6';
        let isA = 0;

        if (deg >= 60 && deg < 120) {
          vLine = vab;
          pair = isThyristor ? ['T1', 'T6'] : ['D1', 'D6'];
          pairLabel = isThyristor ? 'T1-T6 (v_ab)' : 'D1-D6';
          isA = iCurrent;
        } else if (deg >= 120 && deg < 180) {
          vLine = vac;
          pair = isThyristor ? ['T1', 'T2'] : ['D1', 'D2'];
          pairLabel = isThyristor ? 'T1-T2 (v_ac)' : 'D1-D2';
          isA = iCurrent;
        } else if (deg >= 180 && deg < 240) {
          vLine = vbc;
          pair = isThyristor ? ['T3', 'T2'] : ['D3', 'D2'];
          pairLabel = isThyristor ? 'T3-T2 (v_bc)' : 'D3-D2';
          isA = 0;
        } else if (deg >= 240 && deg < 300) {
          vLine = vba;
          pair = isThyristor ? ['T3', 'T4'] : ['D3', 'D4'];
          pairLabel = isThyristor ? 'T3-T4 (v_ba)' : 'D3-D4';
          isA = -iCurrent;
        } else if (deg >= 300 && deg < 360) {
          vLine = vca;
          pair = isThyristor ? ['T5', 'T4'] : ['D5', 'D4'];
          pairLabel = isThyristor ? 'T5-T4 (v_ca)' : 'D5-D4';
          isA = -iCurrent;
        } else {
          vLine = vcb;
          pair = isThyristor ? ['T5', 'T6'] : ['D5', 'D6'];
          pairLabel = isThyristor ? 'T5-T6 (v_cb)' : 'D5-D6';
          isA = 0;
        }

        if (vLine < 0 && hasFWD && iCurrent > 0.05) {
          voNominal = 0;
          isNominal = 0;
          activeDevs = ['DFW'];
          label = 'DFW';
        } else {
          voNominal = vLine;
          isNominal = isA;
          activeDevs = pair;
          label = pairLabel.split(' ')[0];
        }
      }
    }

    // Solve load current ODE: L * di/dt + R * i = vo - E
    // For pure R load: i = max(0, (vo - E) / R)
    if (loadType === 'R') {
      iCurrent = Math.max(0, (voNominal - E) / R);
    } else {
      // Numerical integration (Euler / Trapezoidal)
      const di = ((voNominal - E - R * iCurrent) / L) * dt;
      iCurrent = Math.max(0, iCurrent + di);
    }

    // If current reached zero, voltage may clamp to E or 0 in DCM
    if (iCurrent <= 0.001) {
      iCurrent = 0;
      if (voNominal < E) {
        voNominal = E;
      }
    }

    rawVo[step] = voNominal;
    rawIo[step] = iCurrent;
    rawIs[step] = isNominal;
    rawIfwd[step] = label === 'DFW' ? iCurrent : 0;
    rawDevices[step] = activeDevs;
    rawLabels[step] = label;
  }

  // We take the last 2 cycles (steps: 3 * stepsPerCycle to 5 * stepsPerCycle)
  const sampleStart = 3 * stepsPerCycle;
  const samplePointsCount = 2 * stepsPerCycle; // 2 cycles = 720 degrees
  const points: WaveformPoint[] = [];

  let sumVo = 0;
  let sumVoSq = 0;
  let sumIo = 0;
  let sumIoSq = 0;
  let sumIsSq = 0;
  let sumP = 0;
  let zeroCurrentCount = 0;

  for (let i = 0; i < samplePointsCount; i++) {
    const rawIdx = sampleStart + i;
    const t = i * dt;
    const totalAngleDeg = (i * 360) / stepsPerCycle;
    const cycleAngleRad = ((totalAngleDeg % 360) * Math.PI) / 180;

    const vs = Vm * Math.sin(cycleAngleRad);
    const vsB = phase === '3P' ? Vm * Math.sin(cycleAngleRad - (2 * Math.PI) / 3) : undefined;
    const vsC = phase === '3P' ? Vm * Math.sin(cycleAngleRad + (2 * Math.PI) / 3) : undefined;

    const vo = rawVo[rawIdx];
    const io = rawIo[rawIdx];
    const is = rawIs[rawIdx];
    const ifwd = rawIfwd[rawIdx];
    const devs = rawDevices[rawIdx];
    const lbl = rawLabels[rawIdx];

    sumVo += vo;
    sumVoSq += vo * vo;
    sumIo += io;
    sumIoSq += io * io;
    sumIsSq += is * is;
    sumP += vo * io;

    if (io <= 0.01) {
      zeroCurrentCount++;
    }

    points.push({
      index: i,
      timeMs: t * 1000,
      angleDeg: totalAngleDeg,
      angleRad: (totalAngleDeg * Math.PI) / 180,
      vSource: vs,
      vSourceB: vsB,
      vSourceC: vsC,
      vOutput: vo,
      iOutput: io,
      iSource: is,
      iFWD: ifwd,
      activeDevices: devs,
      activeLabel: lbl,
    });
  }

  // Performance metrics
  const N = samplePointsCount;
  const vDc = sumVo / N;
  const vRms = Math.sqrt(sumVoSq / N);
  const iDc = sumIo / N;
  const iRms = Math.sqrt(sumIoSq / N);
  const isRms = Math.sqrt(sumIsSq / N);
  const pLoad = sumP / N;
  const sIn = V_rms * Math.max(0.1, isRms);
  const powerFactor = sIn > 0 ? Math.min(1.0, Math.max(0, pLoad / sIn)) : 0;
  const rippleFactor = vDc > 1 ? Math.sqrt(Math.max(0, Math.pow(vRms / vDc, 2) - 1)) : 0;
  const formFactor = vDc > 1 ? vRms / vDc : 1.0;
  const isDCM = zeroCurrentCount > stepsPerCycle * 0.08;

  // Compute conduction intervals for the timeline bar
  const intervals: ConductionInterval[] = [];
  let currentStart = 0;
  let currentLbl = points[0]?.activeLabel || 'OFF';

  for (let i = 1; i < points.length; i++) {
    const lbl = points[i].activeLabel;
    if (lbl !== currentLbl) {
      intervals.push({
        startDeg: currentStart,
        endDeg: points[i].angleDeg,
        label: currentLbl,
        colorClass: getColorForLabel(currentLbl),
      });
      currentStart = points[i].angleDeg;
      currentLbl = lbl;
    }
  }
  intervals.push({
    startDeg: currentStart,
    endDeg: points[points.length - 1].angleDeg,
    label: currentLbl,
    colorClass: getColorForLabel(currentLbl),
  });

  // Theoretical analytical formula & ideal value
  const { theoreticalVdc, formulaLatex, formulaTitle, formulaDescription } =
    getAnalyticalFormula(config, Vm);

  // Discrete Fourier Transform for first 10 harmonics
  const harmonics: HarmonicComponent[] = [];
  const oneCycleN = stepsPerCycle;
  let fundamentalIsMag = 0;
  let harmonicIsEnergy = 0;

  for (let h = 0; h <= 10; h++) {
    let reV = 0;
    let imV = 0;
    let reI = 0;
    let imI = 0;

    for (let k = 0; k < oneCycleN; k++) {
      const angle = (2 * Math.PI * h * k) / oneCycleN;
      const vo = points[k].vOutput;
      const is = points[k].iSource;
      reV += vo * Math.cos(angle);
      imV -= vo * Math.sin(angle);
      reI += is * Math.cos(angle);
      imI -= is * Math.sin(angle);
    }

    const scale = h === 0 ? 1 / oneCycleN : 2 / oneCycleN;
    const vMag = Math.sqrt(reV * reV + imV * imV) * scale;
    const iMag = Math.sqrt(reI * reI + imI * imI) * scale;
    const phaseDeg = (Math.atan2(imV, reV) * 180) / Math.PI;

    if (h === 1) {
      fundamentalIsMag = iMag;
    } else if (h > 1) {
      harmonicIsEnergy += iMag * iMag;
    }

    harmonics.push({
      harmonic: h,
      frequencyHz: h * f,
      vMagnitude: vMag,
      iMagnitude: iMag,
      vPercentage: vDc > 0 ? (vMag / vDc) * 100 : 0,
      iPercentage: 0,
      phaseDeg,
    });
  }

  // Update iPercentages
  harmonics.forEach((h) => {
    h.iPercentage = fundamentalIsMag > 0 ? (h.iMagnitude / fundamentalIsMag) * 100 : 0;
  });

  const thdCurrent =
    fundamentalIsMag > 0.05
      ? Math.min(200, (Math.sqrt(harmonicIsEnergy) / fundamentalIsMag) * 100)
      : 5.0;

  const cosPhi1 = Math.cos(alphaRad);

  return {
    points,
    metrics: {
      vDc,
      vRms,
      iDc,
      iRms,
      pLoad,
      sIn,
      powerFactor,
      cosPhi1,
      rippleFactor,
      formFactor,
      thdCurrent,
      isDCM,
      extinctionAngleDeg: isDCM ? 180 + (alphaRad * 180) / Math.PI : 360,
      conductionAngleDeg: 180,
      theoreticalVdc,
      formulaLatex,
      formulaTitle,
      formulaDescription,
    },
    intervals,
    harmonics,
  };
}

function getColorForLabel(label: string): string {
  if (label.includes('DFW')) return 'bg-amber-900/60 text-amber-200 border-amber-600/50';
  if (label.includes('OFF')) return 'bg-slate-800 text-slate-400 border-slate-700';
  if (label.includes('D1') || label.includes('T1')) return 'bg-cyan-950/80 text-cyan-300 border-cyan-500/60';
  if (label.includes('T2') || label.includes('D2')) return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60';
  if (label.includes('T3') || label.includes('D3')) return 'bg-indigo-950/80 text-indigo-300 border-indigo-500/60';
  return 'bg-blue-950/70 text-blue-200 border-blue-600/50';
}

function getAnalyticalFormula(
  config: ConverterConfig,
  Vm: number
): {
  theoreticalVdc: number;
  formulaLatex: string;
  formulaTitle: string;
  formulaDescription: string;
} {
  const { phase, bridge, deviceSetup, firingAngle, hasFWD, loadType } = config;
  const aRad = (firingAngle * Math.PI) / 180;
  const cosA = Math.cos(aRad);
  const V_LLm = Math.sqrt(3) * Vm;

  if (phase === '1P') {
    if (bridge === 'half') {
      if (deviceSetup === 'all_diodes') {
        const vth = Vm / Math.PI;
        return {
          theoreticalVdc: vth,
          formulaLatex: 'V_{dc} = \\frac{V_m}{\\pi}',
          formulaTitle: '1-Phase Half-Wave Uncontrolled Diode Rectifier',
          formulaDescription: 'Single diode conducts during positive half-cycle [0, π]. Peak inverse voltage PIV = Vm.',
        };
      } else {
        // Thyristor
        if (hasFWD || loadType === 'R') {
          const vth = (Vm / (2 * Math.PI)) * (1 + cosA);
          return {
            theoreticalVdc: vth,
            formulaLatex: 'V_{dc} = \\frac{V_m}{2\\pi} (1 + \\cos\\alpha)',
            formulaTitle: '1-Phase Half-Wave Controlled Converter (with FWD / R Load)',
            formulaDescription: 'Freewheeling diode clamps negative inductive voltage excursions, maintaining V_o ≥ 0.',
          };
        } else {
          // RL without FWD
          const vth = (Vm / (2 * Math.PI)) * (cosA - Math.cos((210 * Math.PI) / 180));
          return {
            theoreticalVdc: Math.max(0, vth),
            formulaLatex: 'V_{dc} = \\frac{V_m}{2\\pi}(\\cos\\alpha - \\cos\\beta)',
            formulaTitle: '1-Phase Half-Wave Controlled Converter (RL without FWD)',
            formulaDescription: 'Conduction extends past π to extinction angle β due to inductor energy discharge.',
          };
        }
      }
    } else {
      // 1-Phase Full-Bridge
      if (deviceSetup === 'all_diodes') {
        const vth = (2 * Vm) / Math.PI;
        return {
          theoreticalVdc: vth,
          formulaLatex: 'V_{dc} = \\frac{2 V_m}{\\pi}',
          formulaTitle: '1-Phase Full-Wave Diode Bridge Rectifier',
          formulaDescription: 'Full two-pulse rectification. Peak inverse voltage PIV = Vm across each diode.',
        };
      } else if (deviceSetup === 'semi_converter' || hasFWD) {
        const vth = (Vm / Math.PI) * (1 + cosA);
        return {
          theoreticalVdc: vth,
          formulaLatex: 'V_{dc} = \\frac{V_m}{\\pi} (1 + \\cos\\alpha)',
          formulaTitle: '1-Phase Semi-Converter (Half-Controlled Bridge / with FWD)',
          formulaDescription: 'One quadrant operation with freewheeling action clamping negative voltage spikes.',
        };
      } else {
        // Fully controlled bridge without FWD
        const vth = ((2 * Vm) / Math.PI) * cosA;
        return {
          theoreticalVdc: vth,
          formulaLatex: 'V_{dc} = \\frac{2 V_m}{\\pi} \\cos\\alpha',
          formulaTitle: '1-Phase Fully-Controlled Bridge Converter (Continuous Conduction)',
          formulaDescription: 'Two quadrant converter. Operates as rectifier (α < 90°) or line-commutated inverter (α > 90°).',
        };
      }
    }
  } else {
    // 3-Phase
    if (bridge === 'half') {
      if (deviceSetup === 'all_diodes') {
        const vth = (3 * Math.sqrt(3) * Vm) / (2 * Math.PI);
        return {
          theoreticalVdc: vth,
          formulaLatex: 'V_{dc} = \\frac{3\\sqrt{3} V_m}{2\\pi} \\approx 0.827 V_m',
          formulaTitle: '3-Phase Half-Wave (3-Pulse) Diode Rectifier',
          formulaDescription: 'Each phase conducts for 120° when its instantaneous voltage exceeds the other two phases.',
        };
      } else {
        const vth = ((3 * Math.sqrt(3) * Vm) / (2 * Math.PI)) * cosA;
        return {
          theoreticalVdc: Math.max(0, vth),
          formulaLatex: 'V_{dc} = \\frac{3\\sqrt{3} V_m}{2\\pi} \\cos\\alpha',
          formulaTitle: '3-Phase Half-Wave (3-Pulse) Controlled Converter',
          formulaDescription: 'Fired at delay α after natural commutation points (30°, 150°, 270°).',
        };
      }
    } else {
      // 3-Phase Full-Bridge (6-Pulse)
      if (deviceSetup === 'all_diodes') {
        const vth = (3 * V_LLm) / Math.PI;
        return {
          theoreticalVdc: vth,
          formulaLatex: 'V_{dc} = \\frac{3 V_{LL,m}}{\\pi} = \\frac{3\\sqrt{3} V_m}{\\pi} \\approx 1.35 V_{LL,rms}',
          formulaTitle: '3-Phase Full-Wave 6-Pulse Diode Bridge Rectifier',
          formulaDescription: 'Lowest ripple 6-pulse output. Ripple frequency = 6fs (300 Hz for 50 Hz source).',
        };
      } else if (deviceSetup === 'semi_converter') {
        const vth = ((3 * V_LLm) / (2 * Math.PI)) * (1 + cosA);
        return {
          theoreticalVdc: vth,
          formulaLatex: 'V_{dc} = \\frac{3 V_{LL,m}}{2\\pi} (1 + \\cos\\alpha)',
          formulaTitle: '3-Phase Half-Controlled (Semi-Converter) Bridge',
          formulaDescription: 'Free of negative voltage spikes, improved power factor at delayed firing angles.',
        };
      } else {
        const vth = ((3 * V_LLm) / Math.PI) * cosA;
        return {
          theoreticalVdc: vth,
          formulaLatex: 'V_{dc} = \\frac{3 V_{LL,m}}{\\pi} \\cos\\alpha = \\frac{3\\sqrt{3}V_m}{\\pi} \\cos\\alpha',
          formulaTitle: '3-Phase Fully Controlled 6-Pulse Bridge Converter',
          formulaDescription: 'Standard 6-thyristor industrial drive bridge. Supports four-quadrant drives with dual converter.',
        };
      }
    }
  }
}
