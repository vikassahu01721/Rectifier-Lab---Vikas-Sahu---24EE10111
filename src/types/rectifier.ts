export type PhaseType = '1P' | '3P';
export type BridgeType = 'full' | 'half';
export type DeviceSetup = 'all_diodes' | 'all_thyristors' | 'semi_converter';
export type LoadType = 'R' | 'RL' | 'RLE';
export type SwitchType = 'diode' | 'thyristor';

export interface ConverterConfig {
  phase: PhaseType;
  bridge: BridgeType;
  deviceSetup: DeviceSetup;
  switchTypes: Record<string, SwitchType>; // e.g., { D1: 'diode', D2: 'thyristor', ... }
  firingAngle: number; // in degrees (0 - 180)
  hasFWD: boolean; // Freewheeling diode
  loadType: LoadType;
  resistance: number; // Ohms (1 - 100)
  inductance: number; // mH (0 - 200)
  backEMF: number; // Volts (0 - 150)
  sourceRms: number; // Volts (50 - 440)
  frequency: number; // Hz (50 or 60)
}

export interface WaveformPoint {
  index: number;
  timeMs: number;
  angleDeg: number;
  angleRad: number;
  vSource: number; // instantaneous source voltage v_s(t)
  vSourceB?: number; // Phase B (3-phase)
  vSourceC?: number; // Phase C (3-phase)
  vOutput: number; // instantaneous load output voltage v_o(t)
  iOutput: number; // instantaneous load output current i_o(t)
  iSource: number; // instantaneous source AC current i_s(t)
  iFWD: number; // current through freewheeling diode
  activeDevices: string[]; // active conducting switches e.g. ['D1'], ['DFW'], ['T1', 'T2']
  activeLabel: string; // readable label e.g. 'D1', 'DFW', 'T1-T2'
}

export interface ConductionInterval {
  startDeg: number;
  endDeg: number;
  label: string;
  colorClass: string;
}

export interface RectifierMetrics {
  vDc: number; // Average DC voltage
  vRms: number; // RMS DC voltage
  iDc: number; // Average DC current
  iRms: number; // RMS DC current
  pLoad: number; // Active output power (Watts)
  sIn: number; // Apparent input power (VA)
  powerFactor: number; // Displacement & distortion PF
  cosPhi1: number; // Fundamental displacement PF
  rippleFactor: number; // Voltage ripple factor
  formFactor: number; // Form factor V_rms / V_dc
  thdCurrent: number; // Input current THD in %
  isDCM: boolean; // True if Discontinuous Conduction Mode
  extinctionAngleDeg: number; // Beta angle in degrees
  conductionAngleDeg: number; // Gamma angle in degrees
  theoreticalVdc: number; // Analytical equation theoretical V_dc
  formulaLatex: string;
  formulaTitle: string;
  formulaDescription: string;
}

export interface HarmonicComponent {
  harmonic: number; // 0 (DC), 1 (fundamental), 2, 3, etc.
  frequencyHz: number;
  vMagnitude: number;
  iMagnitude: number;
  vPercentage: number;
  iPercentage: number;
  phaseDeg: number;
}
