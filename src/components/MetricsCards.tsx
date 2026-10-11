import React from 'react';
import { RectifierMetrics } from '../types/rectifier';

interface MetricsCardsProps {
  metrics: RectifierMetrics;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ metrics }) => {
  const {
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
  } = metrics;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
      {/* 1. Avg DC Voltage */}
      <div className="bg-[#0d1527]/90 border border-slate-800/80 rounded-xl p-3.5 shadow-xl backdrop-blur-sm relative overflow-hidden group">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-medium text-slate-400">Avg DC Voltage</span>
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
            V_dc
          </span>
        </div>
        <div className="text-xl font-bold font-mono text-slate-100 my-0.5 tracking-tight">
          {vDc.toFixed(1)} <span className="text-xs text-slate-400 font-sans font-normal">V</span>
        </div>
        <div className="text-[10px] font-mono text-slate-400">
          V_rms = <span className="text-slate-300 font-semibold">{vRms.toFixed(1)} V</span>
        </div>
      </div>

      {/* 2. Avg DC Current */}
      <div className="bg-[#0d1527]/90 border border-slate-800/80 rounded-xl p-3.5 shadow-xl backdrop-blur-sm relative overflow-hidden group">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-medium text-slate-400">Avg DC Current</span>
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
            I_dc
          </span>
        </div>
        <div className="text-xl font-bold font-mono text-emerald-400 my-0.5 tracking-tight">
          {iDc.toFixed(2)} <span className="text-xs text-slate-400 font-sans font-normal">A</span>
        </div>
        <div className="text-[10px] font-mono text-slate-400">
          I_rms = <span className="text-slate-300 font-semibold">{iRms.toFixed(2)} A</span>
        </div>
      </div>

      {/* 3. Output Power */}
      <div className="bg-[#0d1527]/90 border border-slate-800/80 rounded-xl p-3.5 shadow-xl backdrop-blur-sm relative overflow-hidden group">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-medium text-slate-400">Output Power</span>
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-800/60">
            P_load
          </span>
        </div>
        <div className="text-xl font-bold font-mono text-amber-400 my-0.5 tracking-tight">
          {pLoad.toFixed(1)} <span className="text-xs text-slate-400 font-sans font-normal">W</span>
        </div>
        <div className="text-[10px] font-mono text-slate-400">
          S_in = <span className="text-slate-300 font-semibold">{sIn.toFixed(0)} VA</span>
        </div>
      </div>

      {/* 4. Power Factor */}
      <div className="bg-[#0d1527]/90 border border-slate-800/80 rounded-xl p-3.5 shadow-xl backdrop-blur-sm relative overflow-hidden group">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-medium text-slate-400">Power Factor</span>
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-400 border border-purple-800/60">
            PF
          </span>
        </div>
        <div className="text-xl font-bold font-mono text-purple-400 my-0.5 tracking-tight">
          {powerFactor.toFixed(3)}
        </div>
        <div className="text-[10px] font-mono text-slate-400">
          cos(φ1) = <span className="text-slate-300 font-semibold">{cosPhi1.toFixed(3)}</span>
        </div>
      </div>

      {/* 5. Ripple Factor */}
      <div className="bg-[#0d1527]/90 border border-slate-800/80 rounded-xl p-3.5 shadow-xl backdrop-blur-sm relative overflow-hidden group">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-medium text-slate-400">Ripple Factor</span>
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-800/60">
            RF
          </span>
        </div>
        <div className="text-xl font-bold font-mono text-rose-400 my-0.5 tracking-tight">
          {rippleFactor.toFixed(3)}
        </div>
        <div className="text-[10px] font-mono text-slate-400">
          Form Factor FF = <span className="text-slate-300 font-semibold">{formFactor.toFixed(2)}</span>
        </div>
      </div>

      {/* 6. Source THD_i */}
      <div className="bg-[#0d1527]/90 border border-slate-800/80 rounded-xl p-3.5 shadow-xl backdrop-blur-sm relative overflow-hidden group">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-medium text-slate-400">Source THD_i</span>
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
            THD
          </span>
        </div>
        <div className="text-xl font-bold font-mono text-cyan-400 my-0.5 tracking-tight">
          {thdCurrent.toFixed(1)} <span className="text-xs text-slate-400 font-sans font-normal">%</span>
        </div>
        <div className="text-[10px] font-mono flex items-center gap-1">
          {isDCM ? (
            <span className="text-amber-400 font-semibold flex items-center gap-0.5">
              ▲ DCM Mode
            </span>
          ) : (
            <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
              ● CCM Mode
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
