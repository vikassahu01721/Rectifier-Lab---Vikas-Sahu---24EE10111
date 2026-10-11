import React, { useState } from 'react';
import { X, BookOpen, CheckCircle2, ChevronRight } from 'lucide-react';
import { ConverterConfig, RectifierMetrics } from '../types/rectifier';

interface DerivationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ConverterConfig;
  metrics: RectifierMetrics;
}

export const DerivationsModal: React.FC<DerivationsModalProps> = ({
  isOpen,
  onClose,
  config,
  metrics,
}) => {
  const [selectedTopic, setSelectedTopic] = useState<'current' | 'all' | 'harmonics'>('current');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[88vh] bg-[#0c1324] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#090f1d]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Waveform Analysis & Mathematical Derivations
              </h2>
              <p className="text-xs text-slate-400">
                Rigorous power electronics derivations for average voltage, RMS, ripple, and harmonics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-[#0b1222] px-6">
          <button
            onClick={() => setSelectedTopic('current')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              selectedTopic === 'current'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Active Converter Derivation
          </button>
          <button
            onClick={() => setSelectedTopic('all')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              selectedTopic === 'all'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Formulas Reference Matrix
          </button>
          <button
            onClick={() => setSelectedTopic('harmonics')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              selectedTopic === 'harmonics'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Fourier Series & THD Theory
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          {selectedTopic === 'current' && (
            <div className="space-y-6">
              {/* Header Box */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
                  Selected Topology
                </span>
                <h3 className="text-base font-bold text-white mb-1">
                  {metrics.formulaTitle}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {metrics.formulaDescription}
                </p>
              </div>

              {/* 1. Average DC Voltage Derivation */}
              <div className="p-4 rounded-xl bg-[#080e1b] border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-700 flex items-center justify-center text-xs text-cyan-400 font-mono">
                    1
                  </span>
                  Average Output Voltage Derivation ($V_{`{dc}`}$)
                </h4>
                <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 space-y-1.5 overflow-x-auto">
                  <p className="text-slate-400">// Integral definition over conduction period T:</p>
                  <p>V_dc = (1 / T) * ∫ [v_o(ωt)] d(ωt)</p>
                  <p className="text-cyan-400 font-bold">Formula: {metrics.formulaLatex}</p>
                  <p className="text-slate-400">// Substitution of peak voltage V_m = √2 * V_rms = √2 * {config.sourceRms}V = {(config.sourceRms * Math.sqrt(2)).toFixed(1)}V:</p>
                  <p className="text-emerald-400 font-bold">
                    Ideal V_dc = {metrics.theoreticalVdc.toFixed(2)} V
                  </p>
                  <p className="text-cyan-400">
                    Simulated V_dc = {metrics.vDc.toFixed(2)} V (Difference: {Math.abs(metrics.vDc - metrics.theoreticalVdc).toFixed(2)} V due to finite R/L transients)
                  </p>
                </div>
              </div>

              {/* 2. RMS Voltage Derivation */}
              <div className="p-4 rounded-xl bg-[#080e1b] border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-700 flex items-center justify-center text-xs text-cyan-400 font-mono">
                    2
                  </span>
                  Root-Mean-Square Output Voltage ($V_{`{rms}`}$)
                </h4>
                <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 space-y-1.5 overflow-x-auto">
                  <p>V_rms = √[ (1 / T) * ∫ [v_o(ωt)]^2 d(ωt) ]</p>
                  <p className="text-emerald-400 font-bold">
                    Computed V_rms = {metrics.vRms.toFixed(2)} V
                  </p>
                </div>
              </div>

              {/* 3. Ripple Factor & Form Factor */}
              <div className="p-4 rounded-xl bg-[#080e1b] border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-700 flex items-center justify-center text-xs text-cyan-400 font-mono">
                    3
                  </span>
                  Form Factor (FF) & Voltage Ripple Factor (RF)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 font-mono text-xs">
                    <span className="text-slate-400 block mb-1">Form Factor:</span>
                    <p className="text-slate-200">FF = V_rms / V_dc</p>
                    <p className="text-amber-400 font-bold mt-1">
                      FF = {metrics.formFactor.toFixed(3)}
                    </p>
                  </div>
                  <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 font-mono text-xs">
                    <span className="text-slate-400 block mb-1">Ripple Factor:</span>
                    <p className="text-slate-200">RF = √(FF² - 1) = √( (V_rms/V_dc)² - 1 )</p>
                    <p className="text-rose-400 font-bold mt-1">
                      RF = {metrics.rippleFactor.toFixed(3)}
                    </p>
                  </div>
                </div>
              </div>

              {/* 4. Freewheeling Diode (FWD) Effect */}
              <div className="p-4 rounded-xl bg-[#080e1b] border border-slate-800 space-y-2">
                <h4 className="text-sm font-bold text-amber-300">
                  Physics of Freewheeling Diode (FWD) Clamping
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  When supplying an inductive load (RL), the energy stored in the inductor is 0.5 * L * i^2.
                  As the source voltage crosses zero into the negative half cycle, the collapsing magnetic field creates a self-induced EMF v_L = L (di/dt) that forces current to continue flowing.
                </p>
                <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4 mt-2">
                  <li>
                    <strong className="text-white">Without FWD:</strong> Current flows back into the source, pulling the load voltage negative until current reaches zero at extinction angle β. This decreases V_dc.
                  </li>
                  <li>
                    <strong className="text-white">With FWD:</strong> As soon as v_o drops below 0V, the freewheeling diode becomes forward-biased and conducts, clamping v_o to 0V. The inductive energy dissipates through the closed loop of the load and FWD, increasing average V_dc and preventing negative voltage spikes.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {selectedTopic === 'all' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">
                Comprehensive Converter Formula Reference Table
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono border-collapse border border-slate-800">
                  <thead className="bg-slate-900 text-slate-300">
                    <tr>
                      <th className="p-2.5 border border-slate-800">Topology</th>
                      <th className="p-2.5 border border-slate-800">Type</th>
                      <th className="p-2.5 border border-slate-800">Theoretical V_dc Equation</th>
                      <th className="p-2.5 border border-slate-800">Output Ripple Freq</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    <tr className="hover:bg-slate-900/40">
                      <td className="p-2.5 font-bold text-cyan-300">1Φ Half-Wave</td>
                      <td className="p-2.5 text-slate-400">Diode (R)</td>
                      <td className="p-2.5 text-emerald-400 font-bold">V_m / π ≈ 0.318 V_m</td>
                      <td className="p-2.5">f_s (50 Hz)</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40">
                      <td className="p-2.5 font-bold text-cyan-300">1Φ Half-Wave</td>
                      <td className="p-2.5 text-slate-400">Thyristor (with FWD)</td>
                      <td className="p-2.5 text-emerald-400 font-bold">(V_m / 2π) · (1 + cos α)</td>
                      <td className="p-2.5">f_s (50 Hz)</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40">
                      <td className="p-2.5 font-bold text-cyan-300">1Φ Full-Bridge</td>
                      <td className="p-2.5 text-slate-400">Diode Bridge</td>
                      <td className="p-2.5 text-emerald-400 font-bold">2 V_m / π ≈ 0.636 V_m</td>
                      <td className="p-2.5">2 f_s (100 Hz)</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40">
                      <td className="p-2.5 font-bold text-cyan-300">1Φ Full-Bridge</td>
                      <td className="p-2.5 text-slate-400">Semi-Converter (FWD)</td>
                      <td className="p-2.5 text-emerald-400 font-bold">(V_m / π) · (1 + cos α)</td>
                      <td className="p-2.5">2 f_s (100 Hz)</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40">
                      <td className="p-2.5 font-bold text-cyan-300">1Φ Full-Bridge</td>
                      <td className="p-2.5 text-slate-400">Fully Controlled</td>
                      <td className="p-2.5 text-emerald-400 font-bold">(2 V_m / π) · cos α</td>
                      <td className="p-2.5">2 f_s (100 Hz)</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40">
                      <td className="p-2.5 font-bold text-indigo-300">3Φ Half-Wave (3-Pulse)</td>
                      <td className="p-2.5 text-slate-400">Diode / Controlled</td>
                      <td className="p-2.5 text-emerald-400 font-bold">(3√3 V_m / 2π) · cos α</td>
                      <td className="p-2.5">3 f_s (150 Hz)</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40">
                      <td className="p-2.5 font-bold text-indigo-300">3Φ Full-Bridge (6-Pulse)</td>
                      <td className="p-2.5 text-slate-400">Diode Bridge</td>
                      <td className="p-2.5 text-emerald-400 font-bold">3 V_LL,m / π ≈ 1.35 V_LL,rms</td>
                      <td className="p-2.5">6 f_s (300 Hz)</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40">
                      <td className="p-2.5 font-bold text-indigo-300">3Φ Full-Bridge (6-Pulse)</td>
                      <td className="p-2.5 text-slate-400">Fully Controlled Bridge</td>
                      <td className="p-2.5 text-emerald-400 font-bold">(3 V_LL,m / π) · cos α</td>
                      <td className="p-2.5">6 f_s (300 Hz)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedTopic === 'harmonics' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">
                Fourier Series Decomposition & Total Harmonic Distortion (THD)
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Any non-sinusoidal periodic rectifier waveform $f(\omega t)$ can be represented as an infinite sum of sinusoidal harmonics:
              </p>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300">
                f(ωt) = a_0 + ∑ [ a_n cos(n ωt) + b_n sin(n ωt) ]
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-4 rounded-xl bg-[#080e1b] border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase">Input Current THD</h4>
                  <p className="text-xs text-slate-300 font-mono">
                    THD_i = √[ ∑ (I_n)² / (I_1)² ] × 100% (for n = 2, 3, ...)
                  </p>
                  <p className="text-xs text-slate-400">
                    A 6-pulse bridge generates characteristic input harmonics of order $n = 6k \pm 1$ (5th, 7th, 11th, 13th, etc.), eliminating triplen harmonics.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#080e1b] border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-purple-400 uppercase">Power Factor Relations</h4>
                  <p className="text-xs text-slate-300 font-mono">
                    PF = (I_1 / I_rms) · cos(φ_1) = Distortion Factor · Displacement Factor
                  </p>
                  <p className="text-xs text-slate-400">
                    Phase-controlled thyristor converters suffer from lower displacement factor $\cos\alpha$ as firing angle delay $\alpha$ increases.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#090f1d] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Close Derivations
          </button>
        </div>
      </div>
    </div>
  );
};
