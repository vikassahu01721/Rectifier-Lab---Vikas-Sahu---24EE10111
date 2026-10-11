import React from 'react';
import { ConverterConfig, DeviceSetup, LoadType, PhaseType, BridgeType } from '../types/rectifier';
import { Sliders, Zap, Cpu } from 'lucide-react';

interface ControlPanelProps {
  config: ConverterConfig;
  onChange: (updated: Partial<ConverterConfig>) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ config, onChange }) => {
  const {
    phase,
    bridge,
    deviceSetup,
    firingAngle,
    hasFWD,
    loadType,
    resistance,
    inductance,
    backEMF,
    sourceRms,
  } = config;

  const anglePresets = [0, 30, 45, 60, 90, 120, 150];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      {/* 1. CONVERTER TOPOLOGY CARD */}
      <div className="bg-[#0d1527]/90 border border-slate-800/80 rounded-xl p-4 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1 rounded bg-cyan-500/10 text-cyan-400">
            <Cpu className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold tracking-wider uppercase text-slate-200">
            Converter Topology
          </h3>
        </div>

        {/* Phase Selection */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/90 rounded-lg border border-slate-800 mb-3">
          <button
            onClick={() => onChange({ phase: '1P' })}
            className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
              phase === '1P'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Single-Phase (1Φ)
          </button>
          <button
            onClick={() => onChange({ phase: '3P' })}
            className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
              phase === '3P'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Three-Phase (3Φ)
          </button>
        </div>

        {/* Bridge Selection */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/90 rounded-lg border border-slate-800 mb-4">
          <button
            onClick={() => onChange({ bridge: 'full' })}
            className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
              bridge === 'full'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Full-Bridge
          </button>
          <button
            onClick={() => onChange({ bridge: 'half' })}
            className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
              bridge === 'half'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Half-Wave
          </button>
        </div>

        {/* Quick Device Setup */}
        <div>
          <span className="block text-[11px] text-slate-400 font-medium mb-1.5">
            Quick Device Setup:
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => onChange({ deviceSetup: 'all_diodes' })}
              className={`py-1.5 px-2 text-[11px] font-semibold rounded-lg border transition-all ${
                deviceSetup === 'all_diodes'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/80 shadow-sm'
                  : 'bg-slate-900/70 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              All Diodes
            </button>
            <button
              onClick={() => onChange({ deviceSetup: 'all_thyristors' })}
              className={`py-1.5 px-2 text-[11px] font-semibold rounded-lg border transition-all ${
                deviceSetup === 'all_thyristors'
                  ? 'bg-amber-950/80 text-amber-300 border-amber-500/80 shadow-sm'
                  : 'bg-slate-900/70 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              All Thyristors
            </button>
            <button
              onClick={() => onChange({ deviceSetup: 'semi_converter' })}
              className={`py-1.5 px-2 text-[11px] font-semibold rounded-lg border transition-all ${
                deviceSetup === 'semi_converter'
                  ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/80 shadow-sm'
                  : 'bg-slate-900/70 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              Semi-Conv
            </button>
          </div>
        </div>
      </div>

      {/* 2. FIRING ANGLE α & FWD CARD */}
      <div className="bg-[#0d1527]/90 border border-slate-800/80 rounded-xl p-4 shadow-xl backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-amber-500/10 text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold tracking-wider uppercase text-slate-200">
              Firing Angle α & FWD
            </h3>
          </div>
          <span className="text-sm font-mono font-bold text-amber-400">
            {firingAngle}°
          </span>
        </div>

        {/* Firing Angle Slider */}
        <div className="mb-3">
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span>Firing Angle (α):</span>
            <span className="text-amber-300 font-mono font-semibold">{firingAngle}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="180"
            step="1"
            value={firingAngle}
            disabled={deviceSetup === 'all_diodes'}
            onChange={(e) => onChange({ firingAngle: parseInt(e.target.value) })}
            className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer disabled:opacity-40"
          />
        </div>

        {/* Preset Angle Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          {anglePresets.map((deg) => (
            <button
              key={deg}
              disabled={deviceSetup === 'all_diodes'}
              onClick={() => onChange({ firingAngle: deg })}
              className={`px-2.5 py-1 text-[11px] font-mono font-semibold rounded-md border transition-all ${
                firingAngle === deg && deviceSetup !== 'all_diodes'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
              } disabled:opacity-30`}
            >
              {deg}°
            </button>
          ))}
        </div>

        {/* Freewheeling Diode (D_FW) Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <div>
            <span className="text-xs font-medium text-slate-300 block">
              Freewheeling Diode (D_FW):
            </span>
            <span className="text-[10px] text-slate-500">
              Clamps negative voltage excursions
            </span>
          </div>
          <button
            onClick={() => onChange({ hasFWD: !hasFWD })}
            className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
              hasFWD
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/80 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            {hasFWD ? 'Connected' : 'Disconnected'}
          </button>
        </div>
      </div>

      {/* 3. LOAD & SOURCE PARAMETERS CARD */}
      <div className="bg-[#0d1527]/90 border border-slate-800/80 rounded-xl p-4 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1 rounded bg-emerald-500/10 text-emerald-400">
            <Sliders className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold tracking-wider uppercase text-slate-200">
            Load & Source Parameters
          </h3>
        </div>

        {/* Load Selector */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900/90 rounded-lg border border-slate-800 mb-3">
          {(['R', 'RL', 'RLE'] as LoadType[]).map((t) => (
            <button
              key={t}
              onClick={() => onChange({ loadType: t })}
              className={`py-1 text-xs font-semibold rounded-md transition-all ${
                loadType === t
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t} Load
            </button>
          ))}
        </div>

        {/* R Slider */}
        <div className="mb-2">
          <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
            <span>R (Resistance):</span>
            <span className="text-emerald-400 font-mono font-bold">{resistance} Ω</span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            value={resistance}
            onChange={(e) => onChange({ resistance: parseInt(e.target.value) })}
            className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* L Slider */}
        <div className="mb-2">
          <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
            <span>L (Inductance):</span>
            <span className="text-amber-400 font-mono font-bold">{inductance} mH</span>
          </div>
          <input
            type="range"
            min="0"
            max="200"
            step="5"
            disabled={loadType === 'R'}
            value={inductance}
            onChange={(e) => onChange({ inductance: parseInt(e.target.value) })}
            className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer disabled:opacity-30"
          />
        </div>

        {/* Source RMS & Back EMF */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span>Source RMS:</span>
          <span className="text-cyan-400 font-mono font-bold">{sourceRms}V</span>
        </div>
        <input
          type="range"
          min="50"
          max="440"
          step="10"
          value={sourceRms}
          onChange={(e) => onChange({ sourceRms: parseInt(e.target.value) })}
          className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer mb-1"
        />

        {loadType === 'RLE' && (
          <div className="mt-1">
            <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
              <span>Back EMF (E):</span>
              <span className="text-rose-400 font-mono font-bold">{backEMF}V</span>
            </div>
            <input
              type="range"
              min="0"
              max="150"
              step="5"
              value={backEMF}
              onChange={(e) => onChange({ backEMF: parseInt(e.target.value) })}
              className="w-full accent-rose-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        )}
      </div>
    </div>
  );
};
