import React from 'react';
import { ConverterConfig, WaveformPoint } from '../types/rectifier';
import { Zap, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';

interface CircuitSchematicProps {
  config: ConverterConfig;
  onUpdateConfig: (updated: Partial<ConverterConfig>) => void;
  currentPoint: WaveformPoint | null;
}

export const CircuitSchematic: React.FC<CircuitSchematicProps> = ({
  config,
  onUpdateConfig,
  currentPoint,
}) => {
  const { phase, bridge, deviceSetup, hasFWD } = config;

  const currentDevs = currentPoint?.activeDevices || [];
  const activeLabel = currentPoint?.activeLabel || 'OFF';
  const vsVal = currentPoint?.vSource ?? 0;
  const ioVal = currentPoint?.iOutput ?? 0;
  const isVal = currentPoint?.iSource ?? 0;
  const isFWDActive = activeLabel.includes('DFW');

  // Topology display label
  const topoLabel = `${phase === '1P' ? '1-PHASE' : '3-PHASE'} ${
    bridge === 'full' ? 'FULL-BRIDGE' : 'HALF-WAVE'
  }`;

  const loopLabel = isFWDActive
    ? 'Freewheeling Diode (D_FW)'
    : activeLabel === 'OFF'
    ? 'DCM No Conduction (i_o = 0)'
    : `${deviceSetup === 'all_thyristors' ? 'Thyristor' : 'Diode'} ${activeLabel}`;

  const handleToggleDeviceSetup = () => {
    if (deviceSetup === 'all_diodes') {
      onUpdateConfig({ deviceSetup: 'all_thyristors' });
    } else if (deviceSetup === 'all_thyristors') {
      onUpdateConfig({ deviceSetup: 'semi_converter' });
    } else {
      onUpdateConfig({ deviceSetup: 'all_diodes' });
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1527]/90 border border-slate-800/80 rounded-xl p-4 shadow-xl backdrop-blur-sm">
      {/* Header (Matches Screenshot 3) */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-wide text-slate-100">
                Circuit Schematic Diagram
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 font-mono tracking-wider">
                {topoLabel}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Switches point upwards to + rail. Click switch to toggle Diode (D) ↔ Thyristor (T).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-medium block">ACTIVE CURRENT LOOP</span>
            <span
              className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border inline-block ${
                isFWDActive
                  ? 'bg-amber-950/80 text-amber-300 border-amber-600/60 shadow-[0_0_8px_rgba(245,158,11,0.25)]'
                  : activeLabel === 'OFF'
                  ? 'bg-slate-800/80 text-slate-400 border-slate-700'
                  : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60 shadow-[0_0_8px_rgba(16,185,129,0.25)]'
              }`}
            >
              {loopLabel}
            </span>
          </div>

          <button
            onClick={() => onUpdateConfig({ hasFWD: !hasFWD })}
            title="Toggle Freewheeling Diode"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
          >
            <span>FWD:</span>
            {hasFWD ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                CONNECTED <ToggleRight className="w-4 h-4 text-emerald-400" />
              </span>
            ) : (
              <span className="text-slate-500 font-bold flex items-center gap-1">
                DISCONNECTED <ToggleLeft className="w-4 h-4 text-slate-500" />
              </span>
            )}
          </button>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative flex-1 min-h-[370px] w-full flex items-center justify-center bg-[#070c18] rounded-lg border border-slate-800/60 overflow-hidden">
        {phase === '1P' && bridge === 'half' && (
          <OnePhaseHalfWaveSVG
            config={config}
            currentDevs={currentDevs}
            isFWDActive={isFWDActive}
            vsVal={vsVal}
            ioVal={ioVal}
            onToggleDeviceSetup={handleToggleDeviceSetup}
            onToggleFWD={() => onUpdateConfig({ hasFWD: !hasFWD })}
          />
        )}

        {phase === '1P' && bridge === 'full' && (
          <OnePhaseFullBridgeSVG
            config={config}
            currentDevs={currentDevs}
            isFWDActive={isFWDActive}
            vsVal={vsVal}
            ioVal={ioVal}
            isVal={isVal}
            onToggleDeviceSetup={handleToggleDeviceSetup}
            onToggleFWD={() => onUpdateConfig({ hasFWD: !hasFWD })}
          />
        )}

        {phase === '3P' && bridge === 'half' && (
          <ThreePhaseHalfWaveSVG
            config={config}
            currentDevs={currentDevs}
            isFWDActive={isFWDActive}
            currentPoint={currentPoint}
            ioVal={ioVal}
            onToggleDeviceSetup={handleToggleDeviceSetup}
            onToggleFWD={() => onUpdateConfig({ hasFWD: !hasFWD })}
          />
        )}

        {phase === '3P' && bridge === 'full' && (
          <ThreePhaseFullBridgeSVG
            config={config}
            currentDevs={currentDevs}
            isFWDActive={isFWDActive}
            currentPoint={currentPoint}
            ioVal={ioVal}
            onToggleDeviceSetup={handleToggleDeviceSetup}
            onToggleFWD={() => onUpdateConfig({ hasFWD: !hasFWD })}
          />
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
   SVG 1: 1-Phase Half-Wave
   Matches Screenshot 3 in exact detail:
   - AC Source on left (with live vs readout)
   - D1/T1 on top rail (with glowing green box when ON)
   - D_FW vertical branch in parallel across load (pointing up)
   - RLE Load box on right (with R, L, E, and current readout pill)
   - Continuous flowing electron dots along active loop
------------------------------------------------------------- */
function OnePhaseHalfWaveSVG({
  config,
  currentDevs,
  isFWDActive,
  vsVal,
  ioVal,
  onToggleDeviceSetup,
  onToggleFWD,
}: {
  config: ConverterConfig;
  currentDevs: string[];
  isFWDActive: boolean;
  vsVal: number;
  ioVal: number;
  onToggleDeviceSetup: () => void;
  onToggleFWD: () => void;
}) {
  const isThyristor = config.deviceSetup === 'all_thyristors';
  const switchLabel = isThyristor ? 'T1' : 'D1';
  const isSwitchActive = currentDevs.includes(switchLabel);
  const hasFWD = config.hasFWD;
  const isCurrentFlowing = ioVal > 0.05;

  return (
    <svg viewBox="0 0 760 380" className="w-full h-full max-h-[380px] select-none">
      <defs>
        <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glow-amber" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ================= INACTIVE / BASE CONDUCTOR WIRES ================= */}
      {/* Loop 1: Source -> D1 -> Top Rail */}
      <path d="M 70 200 L 70 140 L 175 140" fill="none" stroke="#1e293b" strokeWidth="2.5" />
      <path d="M 245 140 L 400 140" fill="none" stroke="#1e293b" strokeWidth="2.5" />
      {/* Top Rail from FWD to Load */}
      <path d="M 400 140 L 570 140" fill="none" stroke="#1e293b" strokeWidth="2.5" />
      {/* FWD Branch (Vertical) */}
      <path d="M 400 280 L 400 240 M 400 180 L 400 140" fill="none" stroke="#1e293b" strokeWidth="2.5" />
      {/* Bottom Rail from Load back to FWD */}
      <path d="M 570 280 L 400 280" fill="none" stroke="#1e293b" strokeWidth="2.5" />
      {/* Bottom Rail from FWD back to Source */}
      <path d="M 400 280 L 70 280 L 70 200" fill="none" stroke="#1e293b" strokeWidth="2.5" />

      {/* ================= ACTIVE PATH & GLOWING FLOW DOTS ================= */}
      {/* Main Switch Conduction Path (Source -> D1 -> Top Rail -> Load -> Return -> Source) */}
      {isSwitchActive && isCurrentFlowing && (
        <>
          {/* Wire highlight */}
          <path
            d="M 70 200 L 70 140 L 175 140 M 245 140 L 570 140 M 570 280 L 70 280 L 70 200"
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2.5"
            filter="url(#glow-cyan)"
          />
          {/* Flowing Electron Beads (Cyan) */}
          <path
            d="M 70 200 L 70 140 L 175 140 M 245 140 L 570 140"
            fill="none"
            stroke="#22d3ee"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="0 24"
            className="animate-flow"
          />
          <path
            d="M 570 280 L 70 280 L 70 200"
            fill="none"
            stroke="#22d3ee"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="0 24"
            className="animate-flow"
          />
        </>
      )}

      {/* Freewheeling Conduction Path (FWD -> Top Rail -> Load -> Return -> FWD) */}
      {isFWDActive && isCurrentFlowing && (
        <>
          <path
            d="M 400 280 L 400 140 L 570 140 M 570 280 L 400 280"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2.5"
            filter="url(#glow-amber)"
          />
          {/* Flowing Electron Beads (Amber) */}
          <path
            d="M 400 280 L 400 140 L 570 140"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="0 24"
            className="animate-flow"
          />
          <path
            d="M 570 280 L 400 280"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="0 24"
            className="animate-flow"
          />
        </>
      )}

      {/* Junction Nodes */}
      <circle cx="400" cy="140" r="4.5" fill={isSwitchActive || isFWDActive ? '#06b6d4' : '#475569'} />
      <circle cx="400" cy="280" r="4.5" fill={isSwitchActive || isFWDActive ? '#06b6d4' : '#475569'} />
      <circle cx="570" cy="140" r="4.5" fill={isCurrentFlowing ? '#06b6d4' : '#475569'} />
      <circle cx="570" cy="280" r="4.5" fill={isCurrentFlowing ? '#06b6d4' : '#475569'} />

      {/* ================= AC SOURCE SYMBOL (x: 70, y: 200) ================= */}
      <g transform="translate(70, 200)">
        <circle
          cx="0"
          cy="0"
          r="26"
          fill="#0c1527"
          stroke={Math.abs(vsVal) > 5 ? '#06b6d4' : '#334155'}
          strokeWidth="2.5"
          filter={Math.abs(vsVal) > 5 ? 'url(#glow-cyan)' : undefined}
        />
        <path
          d="M -14 0 Q -7 -14 0 0 Q 7 14 14 0"
          fill="none"
          stroke="#06b6d4"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <text x="0" y="44" fill="#94a3b8" fontSize="11" textAnchor="middle" fontWeight="500">
          AC Source
        </text>
        <text
          x="0"
          y="58"
          fill={vsVal >= 0 ? '#38bdf8' : '#f43f5e'}
          fontSize="11"
          fontFamily="JetBrains Mono, monospace"
          textAnchor="middle"
          fontWeight="bold"
        >
          {`vs = ${vsVal >= 0 ? '+' : ''}${vsVal.toFixed(1)} V`}
        </text>
      </g>

      {/* ================= SWITCH D1 / T1 (x: 210, y: 140) ================= */}
      <g
        transform="translate(210, 140)"
        className="cursor-pointer group"
        onClick={onToggleDeviceSetup}
      >
        {/* Glow Box when ON (Matches Screenshot 3) */}
        <rect
          x="-35"
          y="-28"
          width="70"
          height="56"
          rx="8"
          fill={isSwitchActive ? 'rgba(6, 182, 212, 0.16)' : 'rgba(15, 23, 42, 0.6)'}
          stroke={isSwitchActive ? '#06b6d4' : '#334155'}
          strokeWidth={isSwitchActive ? '1.8' : '1'}
          className="transition-all group-hover:stroke-cyan-400"
          filter={isSwitchActive ? 'url(#glow-cyan)' : undefined}
        />

        {/* Diode/Thyristor Symbol pointing right */}
        {/* Triangle */}
        <polygon
          points="-12,-12 -12,12 12,0"
          fill={isSwitchActive ? '#06b6d4' : '#475569'}
          stroke={isSwitchActive ? '#22d3ee' : '#64748b'}
          strokeWidth="1.5"
        />
        {/* Cathode bar */}
        <line x1="12" y1="-12" x2="12" y2="12" stroke={isSwitchActive ? '#22d3ee' : '#64748b'} strokeWidth="2.5" />

        {/* Gate line if thyristor */}
        {isThyristor && (
          <path d="M -4 6 L 6 16 L 16 16" fill="none" stroke={isSwitchActive ? '#f59e0b' : '#64748b'} strokeWidth="2" />
        )}

        {/* Switch Labels */}
        <text
          x="0"
          y="-34"
          fill={isSwitchActive ? '#22d3ee' : '#cbd5e1'}
          fontSize="11"
          fontWeight="bold"
          textAnchor="middle"
          fontFamily="JetBrains Mono"
        >
          {switchLabel}
        </text>
        <text x="0" y="-45" fill="#64748b" fontSize="9" textAnchor="middle">
          Phase Leg
        </text>

        {/* ON / OFF Status Badge */}
        <rect
          x="-15"
          y="18"
          width="30"
          height="12"
          rx="3"
          fill={isSwitchActive ? '#059669' : '#1e293b'}
        />
        <text
          x="0"
          y="27"
          fill={isSwitchActive ? '#ffffff' : '#64748b'}
          fontSize="8"
          fontWeight="bold"
          textAnchor="middle"
        >
          {isSwitchActive ? 'ON' : 'OFF'}
        </text>
      </g>

      {/* ================= FREEWHEELING DIODE (x: 400, y: 210) ================= */}
      <g
        transform="translate(400, 210)"
        className="cursor-pointer"
        onClick={onToggleFWD}
        opacity={hasFWD ? 1 : 0.35}
      >
        {/* Triangle pointing UP (anode at bottom, cathode at top rail) */}
        <polygon
          points="-12,12 12,12 0,-12"
          fill={isFWDActive ? '#f59e0b' : '#334155'}
          stroke={isFWDActive ? '#fbbf24' : '#64748b'}
          strokeWidth="1.5"
          filter={isFWDActive ? 'url(#glow-amber)' : undefined}
        />
        {/* Horizontal cathode bar at top */}
        <line x1="-12" y1="-12" x2="12" y2="-12" stroke={isFWDActive ? '#fbbf24' : '#64748b'} strokeWidth="2.5" />

        {/* Badge */}
        <rect
          x="16"
          y="-9"
          width="44"
          height="18"
          rx="4"
          fill={hasFWD ? (isFWDActive ? '#78350f' : '#1e293b') : '#0f172a'}
          stroke={hasFWD ? (isFWDActive ? '#f59e0b' : '#334155') : '#1e293b'}
        />
        <text
          x="38"
          y="4"
          fill={hasFWD ? (isFWDActive ? '#fef3c7' : '#94a3b8') : '#475569'}
          fontSize="9"
          fontWeight="bold"
          textAnchor="middle"
          fontFamily="JetBrains Mono"
        >
          D_FW
        </text>

        <text
          x="0"
          y="28"
          fill={hasFWD ? (isFWDActive ? '#f59e0b' : '#64748b') : '#475569'}
          fontSize="9"
          fontWeight="bold"
          textAnchor="middle"
        >
          {hasFWD ? (isFWDActive ? 'CONDUCTING' : 'CONNECTED') : 'DISCONNECTED'}
        </text>
      </g>

      {/* ================= LOAD BLOCK (x: 570, y: 210) ================= */}
      <g transform="translate(570, 210)">
        {/* Container Box */}
        <rect
          x="-50"
          y="-65"
          width="100"
          height="130"
          rx="10"
          fill="#0c162c"
          stroke={isCurrentFlowing ? '#06b6d4' : '#334155'}
          strokeWidth="1.8"
          filter={isCurrentFlowing ? 'url(#glow-cyan)' : undefined}
        />

        {/* Load Title */}
        <text x="0" y="-48" fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle">
          {config.loadType} Load
        </text>

        {/* Resistor R */}
        <path
          d="M -22 -32 L -14 -37 L -6 -27 L 2 -37 L 10 -27 L 18 -37 L 22 -32"
          fill="none"
          stroke="#94a3b8"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <text x="0" y="-18" fill="#cbd5e1" fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle">
          R = {config.resistance} Ω
        </text>

        {/* Inductor L (if RL or RLE) */}
        {config.loadType !== 'R' && (
          <>
            <path
              d="M -20 0 C -16 -8, -10 -8, -6 0 C -2 -8, 4 -8, 8 0 C 12 -8, 18 -8, 20 0"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
            />
            <text x="0" y="14" fill="#fbbf24" fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle">
              L = {config.inductance} mH
            </text>
          </>
        )}

        {/* Back EMF E (if RLE) */}
        {config.loadType === 'RLE' && (
          <>
            <line x1="-12" y1="28" x2="12" y2="28" stroke="#f43f5e" strokeWidth="2.5" />
            <line x1="-6" y1="34" x2="6" y2="34" stroke="#f43f5e" strokeWidth="1.5" />
            <text x="0" y="48" fill="#fda4af" fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle">
              - E = {config.backEMF} V
            </text>
          </>
        )}

        {/* Live Instantaneous Current Pill */}
        <g transform="translate(0, 80)">
          <rect
            x="-46"
            y="-12"
            width="92"
            height="24"
            rx="6"
            fill="#082f49"
            stroke={isCurrentFlowing ? '#38bdf8' : '#1e293b'}
            strokeWidth="1.5"
            filter={isCurrentFlowing ? 'url(#glow-cyan)' : undefined}
          />
          <text
            x="0"
            y="4"
            fill={isCurrentFlowing ? '#38bdf8' : '#64748b'}
            fontSize="10"
            fontFamily="JetBrains Mono"
            fontWeight="bold"
            textAnchor="middle"
          >
            {`i = +${ioVal.toFixed(2)} A ►`}
          </text>
        </g>
      </g>
    </svg>
  );
}

/* -------------------------------------------------------------
   SVG 2: 1-Phase Full-Bridge
   - Correct Graetz H-Bridge topology:
     - 2 vertical legs, 4 switches (T1, T2, T3, T4) pointing UP towards (+) DC bus
     - AC Source terminals connect to the midpoints of Leg 1 and Leg 2
     - DC (+) top bus and DC (-) bottom bus connect to Load
     - Anti-parallel FWD across the load
     - Flowing electron dots along exact closed loop for each half cycle
------------------------------------------------------------- */
function OnePhaseFullBridgeSVG({
  config,
  currentDevs,
  isFWDActive,
  vsVal,
  ioVal,
  isVal,
  onToggleDeviceSetup,
  onToggleFWD,
}: {
  config: ConverterConfig;
  currentDevs: string[];
  isFWDActive: boolean;
  vsVal: number;
  ioVal: number;
  isVal: number;
  onToggleDeviceSetup: () => void;
  onToggleFWD: () => void;
}) {
  const isThyristor = config.deviceSetup === 'all_thyristors';
  const isSemi = config.deviceSetup === 'semi_converter';
  const hasFWD = config.hasFWD;
  const isCurrentFlowing = ioVal > 0.05;

  const isD1Active = currentDevs.includes(isThyristor ? 'T1' : isSemi ? 'T1' : 'D1');
  const isD2Active = currentDevs.includes(isThyristor ? 'T2' : isSemi ? 'D2' : 'D2');
  const isD3Active = currentDevs.includes(isThyristor ? 'T3' : isSemi ? 'T3' : 'D3');
  const isD4Active = currentDevs.includes(isThyristor ? 'T4' : isSemi ? 'D4' : 'D4');

  const isPair1Active = isD1Active && isD2Active;
  const isPair2Active = isD3Active && isD4Active;

  return (
    <svg viewBox="0 0 760 380" className="w-full h-full max-h-[380px] select-none">
      <defs>
        <filter id="glow-cyan-fw" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glow-amber-fw" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ================= INACTIVE BASE WIRES ================= */}
      {/* AC Source to Leg 1 Midpoint (x: 200, y: 190) */}
      <path d="M 60 174 L 60 140 L 200 140 L 200 190" fill="none" stroke="#1e293b" strokeWidth="2.5" />
      {/* AC Source to Leg 2 Midpoint (x: 320, y: 190) */}
      <path d="M 60 206 L 60 240 L 320 240 L 320 190" fill="none" stroke="#1e293b" strokeWidth="2.5" />

      {/* Leg 1 vertical connections */}
      <line x1="200" y1="70" x2="200" y2="310" stroke="#1e293b" strokeWidth="2.5" />
      {/* Leg 2 vertical connections */}
      <line x1="320" y1="70" x2="320" y2="310" stroke="#1e293b" strokeWidth="2.5" />

      {/* DC (+) Top Bus */}
      <path d="M 200 70 L 460 70 L 590 70" fill="none" stroke="#1e293b" strokeWidth="2.5" />
      {/* DC (-) Bottom Bus */}
      <path d="M 200 310 L 460 310 L 590 310" fill="none" stroke="#1e293b" strokeWidth="2.5" />

      {/* FWD Branch */}
      <path d="M 460 310 L 460 220 M 460 160 L 460 70" fill="none" stroke="#1e293b" strokeWidth="2.5" />

      {/* ================= ACTIVE PATH & GLOWING FLOW ================= */}
      {/* Positive Half-Cycle Pair (T1 & T2 active) */}
      {isPair1Active && isCurrentFlowing && (
        <>
          <path
            d="M 60 190 L 60 140 L 200 140 L 200 70 L 590 70 M 590 310 L 320 310 L 320 190 L 320 240 L 60 240 L 60 190"
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2.5"
            filter="url(#glow-cyan-fw)"
          />
          {/* Flowing beads */}
          <path
            d="M 60 190 L 60 140 L 200 140 L 200 70 L 590 70"
            fill="none"
            stroke="#22d3ee"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="0 24"
            className="animate-flow"
          />
          <path
            d="M 590 310 L 320 310 L 320 240 L 60 240 L 60 190"
            fill="none"
            stroke="#22d3ee"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="0 24"
            className="animate-flow"
          />
        </>
      )}

      {/* Negative Half-Cycle Pair (T3 & T4 active) */}
      {isPair2Active && isCurrentFlowing && (
        <>
          <path
            d="M 60 190 L 60 240 L 320 240 L 320 70 L 590 70 M 590 310 L 200 310 L 200 140 L 60 140 L 60 190"
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2.5"
            filter="url(#glow-cyan-fw)"
          />
          {/* Flowing beads */}
          <path
            d="M 60 190 L 60 240 L 320 240 L 320 70 L 590 70"
            fill="none"
            stroke="#22d3ee"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="0 24"
            className="animate-flow"
          />
          <path
            d="M 590 310 L 200 310 L 200 140 L 60 140 L 60 190"
            fill="none"
            stroke="#22d3ee"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="0 24"
            className="animate-flow"
          />
        </>
      )}

      {/* Freewheeling action */}
      {isFWDActive && isCurrentFlowing && (
        <>
          <path
            d="M 460 310 L 460 70 L 590 70 M 590 310 L 460 310"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2.5"
            filter="url(#glow-amber-fw)"
          />
          <path
            d="M 460 310 L 460 70 L 590 70"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="0 24"
            className="animate-flow"
          />
          <path
            d="M 590 310 L 460 310"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="0 24"
            className="animate-flow"
          />
        </>
      )}

      {/* Junction Nodes */}
      <circle cx="200" cy="190" r="4.5" fill="#06b6d4" />
      <circle cx="320" cy="190" r="4.5" fill="#06b6d4" />
      <circle cx="200" cy="70" r="4.5" fill="#06b6d4" />
      <circle cx="320" cy="70" r="4.5" fill="#06b6d4" />
      <circle cx="200" cy="310" r="4.5" fill="#06b6d4" />
      <circle cx="320" cy="310" r="4.5" fill="#06b6d4" />
      <circle cx="460" cy="70" r="4.5" fill={hasFWD ? '#06b6d4' : '#475569'} />
      <circle cx="460" cy="310" r="4.5" fill={hasFWD ? '#06b6d4' : '#475569'} />

      {/* AC Source Symbol */}
      <g transform="translate(60, 190)">
        <circle cx="0" cy="0" r="24" fill="#0c1527" stroke="#06b6d4" strokeWidth="2.5" />
        <path d="M -12 0 Q -6 -12 0 0 Q 6 12 12 0" fill="none" stroke="#06b6d4" strokeWidth="2.5" />
        <text x="0" y="38" fill="#94a3b8" fontSize="10" textAnchor="middle">
          AC Source
        </text>
        <text
          x="0"
          y="50"
          fill={vsVal >= 0 ? '#38bdf8' : '#f43f5e'}
          fontSize="10"
          fontFamily="JetBrains Mono"
          textAnchor="middle"
          fontWeight="bold"
        >
          {`vs = ${vsVal >= 0 ? '+' : ''}${vsVal.toFixed(1)} V`}
        </text>
      </g>

      {/* 4 Bridge Switches pointing UPWARDS towards DC (+) rail */}
      {/* T1 (Leg 1 Top, x: 200, y: 125) */}
      <StandardSwitchSymbol
        x={200}
        y={125}
        label={isThyristor ? 'T1' : isSemi ? 'T1' : 'D1'}
        isThyristor={isThyristor || isSemi}
        isActive={isD1Active}
        pointingUp={true}
        onClick={onToggleDeviceSetup}
      />

      {/* T4 (Leg 1 Bottom, x: 200, y: 255) */}
      <StandardSwitchSymbol
        x={200}
        y={255}
        label={isThyristor ? 'T4' : 'D4'}
        isThyristor={isThyristor}
        isActive={isD4Active}
        pointingUp={true}
        onClick={onToggleDeviceSetup}
      />

      {/* T3 (Leg 2 Top, x: 320, y: 125) */}
      <StandardSwitchSymbol
        x={320}
        y={125}
        label={isThyristor ? 'T3' : isSemi ? 'T3' : 'D3'}
        isThyristor={isThyristor || isSemi}
        isActive={isD3Active}
        pointingUp={true}
        onClick={onToggleDeviceSetup}
      />

      {/* T2 (Leg 2 Bottom, x: 320, y: 255) */}
      <StandardSwitchSymbol
        x={320}
        y={255}
        label={isThyristor ? 'T2' : 'D2'}
        isThyristor={isThyristor}
        isActive={isD2Active}
        pointingUp={true}
        onClick={onToggleDeviceSetup}
      />

      {/* Freewheeling Diode branch at x: 460 */}
      <g
        transform="translate(460, 190)"
        className="cursor-pointer"
        onClick={onToggleFWD}
        opacity={hasFWD ? 1 : 0.35}
      >
        <polygon
          points="-12,12 12,12 0,-12"
          fill={isFWDActive ? '#f59e0b' : '#334155'}
          stroke={isFWDActive ? '#fbbf24' : '#64748b'}
          strokeWidth="1.5"
          filter={isFWDActive ? 'url(#glow-amber-fw)' : undefined}
        />
        <line x1="-12" y1="-12" x2="12" y2="-12" stroke={isFWDActive ? '#fbbf24' : '#64748b'} strokeWidth="2.5" />
        <text x="22" y="4" fill={isFWDActive ? '#fef3c7' : '#94a3b8'} fontSize="9" fontWeight="bold">
          D_FW
        </text>
      </g>

      {/* Load Block at Right (x: 590, y: 190) */}
      <g transform="translate(590, 190)">
        <rect
          x="-45"
          y="-60"
          width="90"
          height="120"
          rx="8"
          fill="#0c162c"
          stroke={isCurrentFlowing ? '#06b6d4' : '#334155'}
          strokeWidth="1.8"
          filter={isCurrentFlowing ? 'url(#glow-cyan-fw)' : undefined}
        />
        <text x="0" y="-42" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">
          {config.loadType} Load
        </text>
        <path d="M -20 -24 L -14 -28 L -8 -20 L 0 -28 L 8 -20 L 14 -28 L 20 -24" fill="none" stroke="#94a3b8" strokeWidth="2" />
        <text x="0" y="-12" fill="#cbd5e1" fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle">
          R = {config.resistance} Ω
        </text>
        {config.loadType !== 'R' && (
          <>
            <path d="M -18 6 C -14 -1, -8 -1, -4 6 C 0 -1, 6 -1, 10 6 C 14 -1, 18 -1, 20 6" fill="none" stroke="#f59e0b" strokeWidth="1.8" />
            <text x="0" y="20" fill="#fbbf24" fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle">
              L = {config.inductance} mH
            </text>
          </>
        )}
        {config.loadType === 'RLE' && (
          <text x="0" y="34" fill="#fda4af" fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle">
            - E = {config.backEMF} V
          </text>
        )}
        <g transform="translate(0, 75)">
          <rect x="-42" y="-10" width="84" height="20" rx="5" fill="#082f49" stroke="#38bdf8" strokeWidth="1" />
          <text x="0" y="4" fill="#38bdf8" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold" textAnchor="middle">
            {`i = +${ioVal.toFixed(2)} A ►`}
          </text>
        </g>
      </g>
    </svg>
  );
}

/* -------------------------------------------------------------
   SVG 3: 3-Phase Half-Wave (3-Pulse)
   - 3 Phase lines (Va, Vb, Vc) each going to their respective diode/thyristor
   - Cathodes commoned to DC (+) bus feeding load
   - Load return connects directly to Source Neutral (N) line
   - Anti-parallel FWD between Neutral and DC (+) bus
------------------------------------------------------------- */
function ThreePhaseHalfWaveSVG({
  config,
  currentDevs,
  isFWDActive,
  currentPoint,
  ioVal,
  onToggleDeviceSetup,
  onToggleFWD,
}: {
  config: ConverterConfig;
  currentDevs: string[];
  isFWDActive: boolean;
  currentPoint: WaveformPoint | null;
  ioVal: number;
  onToggleDeviceSetup: () => void;
  onToggleFWD: () => void;
}) {
  const isThyristor = config.deviceSetup === 'all_thyristors';
  const hasFWD = config.hasFWD;
  const isCurrentFlowing = ioVal > 0.05;

  const isT1Active = currentDevs.includes(isThyristor ? 'T1' : 'D1');
  const isT2Active = currentDevs.includes(isThyristor ? 'T2' : 'D2');
  const isT3Active = currentDevs.includes(isThyristor ? 'T3' : 'D3');

  const va = currentPoint?.vSource ?? 0;
  const vb = currentPoint?.vSourceB ?? 0;
  const vc = currentPoint?.vSourceC ?? 0;

  return (
    <svg viewBox="0 0 760 380" className="w-full h-full max-h-[380px] select-none">
      {/* 3-Phase Sources at Left */}
      <g transform="translate(60, 90)">
        <circle cx="0" cy="0" r="18" fill="#0c1527" stroke="#ef4444" strokeWidth="2" />
        <path d="M -8 0 Q -4 -8 0 0 Q 4 8 8 0" fill="none" stroke="#ef4444" strokeWidth="1.5" />
        <text x="-26" y="4" fill="#ef4444" fontSize="9" fontWeight="bold" textAnchor="end">
          Va: {va.toFixed(0)}V
        </text>
      </g>
      <g transform="translate(60, 190)">
        <circle cx="0" cy="0" r="18" fill="#0c1527" stroke="#eab308" strokeWidth="2" />
        <path d="M -8 0 Q -4 -8 0 0 Q 4 8 8 0" fill="none" stroke="#eab308" strokeWidth="1.5" />
        <text x="-26" y="4" fill="#eab308" fontSize="9" fontWeight="bold" textAnchor="end">
          Vb: {vb.toFixed(0)}V
        </text>
      </g>
      <g transform="translate(60, 290)">
        <circle cx="0" cy="0" r="18" fill="#0c1527" stroke="#3b82f6" strokeWidth="2" />
        <path d="M -8 0 Q -4 -8 0 0 Q 4 8 8 0" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
        <text x="-26" y="4" fill="#3b82f6" fontSize="9" fontWeight="bold" textAnchor="end">
          Vc: {vc.toFixed(0)}V
        </text>
      </g>

      {/* Switches for Phases A, B, C */}
      <path d="M 78 90 L 190 90" fill="none" stroke={isT1Active ? '#ef4444' : '#1e293b'} strokeWidth="2.5" />
      <StandardSwitchSymbol
        x={230}
        y={90}
        label={isThyristor ? 'T1' : 'D1'}
        isThyristor={isThyristor}
        isActive={isT1Active}
        pointingRight={true}
        onClick={onToggleDeviceSetup}
      />
      <path d="M 270 90 L 360 90 L 360 160" fill="none" stroke={isT1Active ? '#06b6d4' : '#1e293b'} strokeWidth="2.5" />

      <path d="M 78 190 L 190 190" fill="none" stroke={isT2Active ? '#eab308' : '#1e293b'} strokeWidth="2.5" />
      <StandardSwitchSymbol
        x={230}
        y={190}
        label={isThyristor ? 'T2' : 'D2'}
        isThyristor={isThyristor}
        isActive={isT2Active}
        pointingRight={true}
        onClick={onToggleDeviceSetup}
      />
      <path d="M 270 190 L 360 190" fill="none" stroke={isT2Active ? '#06b6d4' : '#1e293b'} strokeWidth="2.5" />

      <path d="M 78 290 L 190 290" fill="none" stroke={isT3Active ? '#3b82f6' : '#1e293b'} strokeWidth="2.5" />
      <StandardSwitchSymbol
        x={230}
        y={290}
        label={isThyristor ? 'T3' : 'D3'}
        isThyristor={isThyristor}
        isActive={isT3Active}
        pointingRight={true}
        onClick={onToggleDeviceSetup}
      />
      <path d="M 270 290 L 360 290 L 360 220" fill="none" stroke={isT3Active ? '#06b6d4' : '#1e293b'} strokeWidth="2.5" />

      {/* Common DC (+) Bus from x: 360 to Load */}
      <path
        d="M 360 190 L 460 190 L 590 190"
        fill="none"
        stroke={isCurrentFlowing ? '#06b6d4' : '#1e293b'}
        strokeWidth="2.5"
      />
      {isCurrentFlowing && (
        <path
          d="M 360 190 L 590 190"
          fill="none"
          stroke="#22d3ee"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="0 24"
          className="animate-flow"
        />
      )}

      {/* Neutral return wire */}
      <path d="M 590 330 L 60 330 L 60 110" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="6 6" />
      <text x="320" y="344" fill="#94a3b8" fontSize="10" textAnchor="middle" fontWeight="bold">
        Neutral Return Bus (N)
      </text>

      {/* FWD Branch */}
      {hasFWD && (
        <g transform="translate(460, 260)" className="cursor-pointer" onClick={onToggleFWD}>
          <path d="M 0 -70 L 0 -15 M 0 15 L 0 70" fill="none" stroke={isFWDActive ? '#f59e0b' : '#334155'} strokeWidth="2" />
          <polygon points="-12,12 12,12 0,-12" fill={isFWDActive ? '#f59e0b' : '#334155'} stroke="#fbbf24" strokeWidth="1.5" />
          <line x1="-12" y1="-12" x2="12" y2="-12" stroke="#fbbf24" strokeWidth="2.5" />
          <text x="20" y="4" fill={isFWDActive ? '#fef3c7' : '#94a3b8'} fontSize="9" fontWeight="bold">
            D_FW
          </text>
        </g>
      )}

      {/* Load Block */}
      <g transform="translate(590, 240)">
        <rect x="-40" y="-45" width="80" height="90" rx="8" fill="#0c162c" stroke="#06b6d4" strokeWidth="1.5" />
        <text x="0" y="-30" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">
          {config.loadType} Load
        </text>
        <text x="0" y="-12" fill="#cbd5e1" fontSize="8" textAnchor="middle">
          R = {config.resistance} Ω
        </text>
        <text x="0" y="6" fill="#fbbf24" fontSize="8" textAnchor="middle">
          L = {config.inductance} mH
        </text>
        <g transform="translate(0, 56)">
          <rect x="-35" y="-9" width="70" height="18" rx="4" fill="#082f49" stroke="#38bdf8" />
          <text x="0" y="4" fill="#38bdf8" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold" textAnchor="middle">
            {`i = +${ioVal.toFixed(2)} A`}
          </text>
        </g>
      </g>
    </svg>
  );
}

/* -------------------------------------------------------------
   SVG 4: 3-Phase Full-Bridge (6-Pulse)
   - 3 Legs (Leg A, Leg B, Leg C)
   - 6 Switches: T1, T3, T5 on top; T4, T6, T2 on bottom
   - Top DC (+) bus, Bottom DC (-) bus
   - Anti-parallel FWD
------------------------------------------------------------- */
function ThreePhaseFullBridgeSVG({
  config,
  currentDevs,
  isFWDActive,
  currentPoint,
  ioVal,
  onToggleDeviceSetup,
  onToggleFWD,
}: {
  config: ConverterConfig;
  currentDevs: string[];
  isFWDActive: boolean;
  currentPoint: WaveformPoint | null;
  ioVal: number;
  onToggleDeviceSetup: () => void;
  onToggleFWD: () => void;
}) {
  const isThyristor = config.deviceSetup === 'all_thyristors';
  const hasFWD = config.hasFWD;
  const isCurrentFlowing = ioVal > 0.05;

  const isT1 = currentDevs.includes(isThyristor ? 'T1' : 'D1');
  const isT3 = currentDevs.includes(isThyristor ? 'T3' : 'D3');
  const isT5 = currentDevs.includes(isThyristor ? 'T5' : 'D5');
  const isT4 = currentDevs.includes(isThyristor ? 'T4' : 'D4');
  const isT6 = currentDevs.includes(isThyristor ? 'T6' : 'D6');
  const isT2 = currentDevs.includes(isThyristor ? 'T2' : 'D2');

  return (
    <svg viewBox="0 0 760 380" className="w-full h-full max-h-[380px] select-none">
      {/* 3 AC Phase Inputs */}
      <g transform="translate(45, 190)">
        <text x="0" y="-55" fill="#ef4444" fontSize="10" fontWeight="bold">Phase A (R)</text>
        <text x="0" y="0" fill="#eab308" fontSize="10" fontWeight="bold">Phase B (Y)</text>
        <text x="0" y="55" fill="#3b82f6" fontSize="10" fontWeight="bold">Phase C (B)</text>
      </g>

      {/* Top Positive Bus (x: 160 to x: 580) */}
      <path d="M 160 60 L 460 60 L 580 60" fill="none" stroke={isCurrentFlowing ? '#06b6d4' : '#1e293b'} strokeWidth="2.5" />
      {/* Bottom Negative Bus (x: 160 to x: 580) */}
      <path d="M 160 320 L 460 320 L 580 320" fill="none" stroke={isCurrentFlowing ? '#06b6d4' : '#1e293b'} strokeWidth="2.5" />

      {/* 3 Vertical Legs */}
      <line x1="200" y1="60" x2="200" y2="320" stroke="#1e293b" strokeWidth="2" />
      <line x1="290" y1="60" x2="290" y2="320" stroke="#1e293b" strokeWidth="2" />
      <line x1="380" y1="60" x2="380" y2="320" stroke="#1e293b" strokeWidth="2" />

      {/* 6 Switches pointing UPWARDS */}
      {/* Leg 1: Phase A */}
      <StandardSwitchSymbol x={200} y={110} label={isThyristor ? 'T1' : 'D1'} isThyristor={isThyristor} isActive={isT1} pointingUp={true} onClick={onToggleDeviceSetup} />
      <StandardSwitchSymbol x={200} y={260} label={isThyristor ? 'T4' : 'D4'} isThyristor={isThyristor} isActive={isT4} pointingUp={true} onClick={onToggleDeviceSetup} />

      {/* Leg 2: Phase B */}
      <StandardSwitchSymbol x={290} y={110} label={isThyristor ? 'T3' : 'D3'} isThyristor={isThyristor} isActive={isT3} pointingUp={true} onClick={onToggleDeviceSetup} />
      <StandardSwitchSymbol x={290} y={260} label={isThyristor ? 'T6' : 'D6'} isThyristor={isThyristor} isActive={isT6} pointingUp={true} onClick={onToggleDeviceSetup} />

      {/* Leg 3: Phase C */}
      <StandardSwitchSymbol x={380} y={110} label={isThyristor ? 'T5' : 'D5'} isThyristor={isThyristor} isActive={isT5} pointingUp={true} onClick={onToggleDeviceSetup} />
      <StandardSwitchSymbol x={380} y={260} label={isThyristor ? 'T2' : 'D2'} isThyristor={isThyristor} isActive={isT2} pointingUp={true} onClick={onToggleDeviceSetup} />

      {/* Phase A line to Leg 1 midpoint */}
      <path d="M 115 135 L 200 135 L 200 185" fill="none" stroke="#ef4444" strokeWidth="2" />
      {/* Phase B line to Leg 2 midpoint */}
      <path d="M 115 190 L 290 190" fill="none" stroke="#eab308" strokeWidth="2" />
      {/* Phase C line to Leg 3 midpoint */}
      <path d="M 115 245 L 380 245 L 380 195" fill="none" stroke="#3b82f6" strokeWidth="2" />

      {/* FWD Branch */}
      {hasFWD && (
        <g transform="translate(470, 190)" className="cursor-pointer" onClick={onToggleFWD}>
          <path d="M 0 -130 L 0 -15 M 0 15 L 0 130" fill="none" stroke={isFWDActive ? '#f59e0b' : '#334155'} strokeWidth="2" />
          <polygon points="-12,12 12,12 0,-12" fill={isFWDActive ? '#f59e0b' : '#334155'} stroke="#fbbf24" strokeWidth="1.5" />
          <line x1="-12" y1="-12" x2="12" y2="-12" stroke="#fbbf24" strokeWidth="2.5" />
          <text x="20" y="4" fill={isFWDActive ? '#fef3c7' : '#94a3b8'} fontSize="9" fontWeight="bold">
            D_FW
          </text>
        </g>
      )}

      {/* Load Block at x: 580 */}
      <g transform="translate(580, 190)">
        <rect x="-40" y="-55" width="80" height="110" rx="8" fill="#0c162c" stroke="#06b6d4" strokeWidth="1.8" />
        <text x="0" y="-38" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">
          {config.loadType} Load
        </text>
        <text x="0" y="-18" fill="#cbd5e1" fontSize="8" textAnchor="middle">
          R = {config.resistance} Ω
        </text>
        <text x="0" y="2" fill="#fbbf24" fontSize="8" textAnchor="middle">
          L = {config.inductance} mH
        </text>
        <g transform="translate(0, 70)">
          <rect x="-35" y="-9" width="70" height="18" rx="4" fill="#082f49" stroke="#38bdf8" />
          <text x="0" y="4" fill="#38bdf8" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold" textAnchor="middle">
            {`i = +${ioVal.toFixed(2)} A`}
          </text>
        </g>
      </g>
    </svg>
  );
}

/* -------------------------------------------------------------
   Standard Switch Symbol (Diode / Thyristor)
------------------------------------------------------------- */
function StandardSwitchSymbol({
  x,
  y,
  label,
  isThyristor,
  isActive,
  pointingUp,
  pointingRight,
  onClick,
}: {
  x: number;
  y: number;
  label: string;
  isThyristor: boolean;
  isActive: boolean;
  pointingUp?: boolean;
  pointingRight?: boolean;
  onClick: () => void;
}) {
  return (
    <g transform={`translate(${x}, ${y})`} className="cursor-pointer group" onClick={onClick}>
      {/* Box */}
      <rect
        x="-22"
        y="-22"
        width="44"
        height="44"
        rx="6"
        fill={isActive ? 'rgba(6, 182, 212, 0.18)' : '#0c1527'}
        stroke={isActive ? '#06b6d4' : '#334155'}
        strokeWidth={isActive ? '1.8' : '1'}
        className="transition-colors group-hover:stroke-cyan-400"
      />

      {pointingRight ? (
        <>
          <polygon
            points="-8,-8 -8,8 8,0"
            fill={isActive ? '#06b6d4' : '#475569'}
            stroke={isActive ? '#22d3ee' : '#64748b'}
            strokeWidth="1.2"
          />
          <line x1="8" y1="-8" x2="8" y2="8" stroke={isActive ? '#22d3ee' : '#64748b'} strokeWidth="2.2" />
        </>
      ) : (
        <>
          <polygon
            points="-8,8 8,8 0,-8"
            fill={isActive ? '#06b6d4' : '#475569'}
            stroke={isActive ? '#22d3ee' : '#64748b'}
            strokeWidth="1.2"
          />
          <line x1="-8" y1="-8" x2="8" y2="-8" stroke={isActive ? '#22d3ee' : '#64748b'} strokeWidth="2.2" />
        </>
      )}

      {isThyristor && (
        <path d="M -2 4 L 4 10 L 8 10" fill="none" stroke={isActive ? '#f59e0b' : '#64748b'} strokeWidth="1.5" />
      )}

      <text
        x="0"
        y={-14}
        fill={isActive ? '#22d3ee' : '#cbd5e1'}
        fontSize="9"
        fontWeight="bold"
        textAnchor="middle"
        fontFamily="JetBrains Mono"
      >
        {label}
      </text>

      {/* Mini Active Dot */}
      <circle
        cx="14"
        cy="-14"
        r="2.5"
        fill={isActive ? '#10b981' : '#334155'}
      />
    </g>
  );
}
