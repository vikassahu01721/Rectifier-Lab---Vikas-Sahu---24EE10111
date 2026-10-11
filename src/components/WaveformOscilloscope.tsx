import React, { useRef, useState, useEffect } from 'react';
import { WaveformPoint, ConductionInterval, HarmonicComponent } from '../types/rectifier';
import {
  Layers,
  Activity,
  BarChart3,
  Download,
  Grid,
  Minimize2,
  Maximize2,
  FileSpreadsheet,
  FileImage,
} from 'lucide-react';

interface WaveformOscilloscopeProps {
  points: WaveformPoint[];
  intervals: ConductionInterval[];
  harmonics: HarmonicComponent[];
  vDc: number;
  currentAngleDeg: number;
  onSeekAngle: (angleDeg: number) => void;
  frequency: number;
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
}

export type OscilloscopeTab = 'superimposed' | 'channels' | 'fft';

export const WaveformOscilloscope: React.FC<WaveformOscilloscopeProps> = ({
  points,
  intervals,
  harmonics,
  vDc,
  currentAngleDeg,
  onSeekAngle,
  frequency,
  isFullScreen,
  onToggleFullScreen,
}) => {
  const [activeTab, setActiveTab] = useState<OscilloscopeTab>('superimposed');
  const [cycles, setCycles] = useState<1 | 2>(2);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showVavg, setShowVavg] = useState<boolean>(true);
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Filter points based on 1 cycle (0 - 360°) or 2 cycles (0 - 720°)
  const maxAngle = cycles === 1 ? 360 : 720;
  const displayPoints = points.filter((p) => p.angleDeg <= maxAngle);

  // Find max scale for voltage and current
  let maxV = 100;
  let maxI = 5;
  for (const p of displayPoints) {
    if (Math.abs(p.vSource) > maxV) maxV = Math.abs(p.vSource);
    if (Math.abs(p.vOutput) > maxV) maxV = Math.abs(p.vOutput);
    if (Math.abs(p.iOutput) > maxI) maxI = Math.abs(p.iOutput);
    if (Math.abs(p.iSource) > maxI) maxI = Math.abs(p.iSource);
  }
  const vScaleLimit = Math.ceil(maxV * 1.15 / 25) * 25;
  const iScaleLimit = Math.ceil(maxI * 1.25 / 2) * 2;

  // Active point at currentAngleDeg
  const activePoint =
    displayPoints.find(
      (p) => Math.abs(p.angleDeg - (currentAngleDeg % maxAngle)) < 1.0
    ) || displayPoints[0];

  // Draw on Canvas whenever parameters change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    if (width === 0 || height === 0) return;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    if (activeTab === 'superimposed') {
      drawSuperimposedView(
        ctx,
        width,
        height,
        displayPoints,
        maxAngle,
        vScaleLimit,
        iScaleLimit,
        vDc,
        showGrid,
        showVavg,
        currentAngleDeg % maxAngle
      );
    } else if (activeTab === 'channels') {
      drawChannelsView(
        ctx,
        width,
        height,
        displayPoints,
        maxAngle,
        vScaleLimit,
        iScaleLimit,
        showGrid,
        currentAngleDeg % maxAngle
      );
    }
  }, [
    displayPoints,
    activeTab,
    cycles,
    showGrid,
    showVavg,
    currentAngleDeg,
    vScaleLimit,
    iScaleLimit,
    vDc,
  ]);

  // Handle canvas mouse scrub
  const handleCanvasInteraction = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const paddingLeft = 55;
    const paddingRight = 40;
    const graphWidth = rect.width - paddingLeft - paddingRight;

    if (clickX >= paddingLeft && clickX <= paddingLeft + graphWidth) {
      const ratio = (clickX - paddingLeft) / graphWidth;
      const angle = Math.round(ratio * maxAngle);
      onSeekAngle(angle);
    }
  };

  // Export CSV Data
  const handleExportCSV = () => {
    const headers = [
      'Time (ms)',
      'Angle (deg)',
      'Source Voltage v_s (V)',
      'Load Voltage v_o (V)',
      'Load Current i_o (A)',
      'Source Current i_s (A)',
      'FWD Current i_fwd (A)',
      'Active Devices',
    ];
    const rows = points.map((p) => [
      p.timeMs.toFixed(3),
      p.angleDeg.toFixed(1),
      p.vSource.toFixed(2),
      p.vOutput.toFixed(2),
      p.iOutput.toFixed(3),
      p.iSource.toFixed(3),
      p.iFWD.toFixed(3),
      p.activeLabel,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rectifier_waveforms_${cycles}cycles.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  // Export High-Res PNG
  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `rectifier_oscilloscope_${activeTab}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setShowExportMenu(false);
  };

  return (
    <div
      ref={containerRef}
      className={`flex flex-col h-full bg-[#0d1527]/90 border border-slate-800/80 rounded-xl p-4 shadow-xl backdrop-blur-sm ${
        isFullScreen ? 'fixed inset-0 z-50 rounded-none bg-[#0a0f1d]' : ''
      }`}
    >
      {/* Top Oscilloscope Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3 mb-3">
        {/* View Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-900/90 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('superimposed')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'superimposed'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Superimposed
          </button>
          <button
            onClick={() => setActiveTab('channels')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'channels'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Oscilloscope Channels
          </button>
          <button
            onClick={() => setActiveTab('fft')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'fft'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Harmonics (FFT)
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Cycle Toggle */}
          <button
            onClick={() => setCycles(cycles === 1 ? 2 : 1)}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 transition-colors"
          >
            {cycles === 1 ? '1 Cycle (360°)' : '2 Cycles (720°)'}
          </button>

          {/* Grid Toggle */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1 ${
              showGrid
                ? 'bg-cyan-950/80 text-cyan-300 border-cyan-800'
                : 'bg-slate-800/80 text-slate-400 border-slate-700'
            }`}
          >
            <Grid className="w-3 h-3" />
            Grid
          </button>

          {/* V_avg Line Toggle */}
          <button
            onClick={() => setShowVavg(!showVavg)}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
              showVavg
                ? 'bg-purple-950/80 text-purple-300 border-purple-800'
                : 'bg-slate-800/80 text-slate-400 border-slate-700'
            }`}
          >
            V_avg
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-1 w-44 bg-[#0f172a] border border-slate-700 rounded-lg shadow-2xl py-1 z-30">
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 text-left"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  CSV Waveform Data
                </button>
                <button
                  onClick={handleExportPNG}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 text-left"
                >
                  <FileImage className="w-4 h-4 text-cyan-400" />
                  High-Res PNG
                </button>
              </div>
            )}
          </div>

          {/* Full Screen Toggle */}
          {onToggleFullScreen && (
            <button
              onClick={onToggleFullScreen}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Toggle Fullscreen"
            >
              {isFullScreen ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'fft' ? (
        <FFTHarmonicsView harmonics={harmonics} vDc={vDc} frequency={frequency} />
      ) : (
        <div className="flex flex-col flex-1 min-h-[360px] relative">
          {/* Canvas Waveform Plot */}
          <div className="relative flex-1 w-full bg-[#060a14] rounded-lg border border-slate-800/60 overflow-hidden">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasInteraction}
              className="w-full h-full cursor-crosshair block"
            />
          </div>

          {/* Active Conduction Strip Timeline (Matches Screenshot 3 & 4) */}
          <div className="mt-2.5 bg-[#070d1a] border border-slate-800/80 rounded-lg p-2">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider">
                ACTIVE CONDUCTION PAIR
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">
                ωt = {(currentAngleDeg % maxAngle).toFixed(1)}°
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">
                Vo: {activePoint?.vOutput.toFixed(1)}V
              </span>
              <span className="text-[10px] text-amber-400 font-mono">
                Io: {activePoint?.iOutput.toFixed(2)}A
              </span>
            </div>

            {/* Interval bar */}
            <div className="relative h-6 w-full bg-slate-900 rounded overflow-hidden flex border border-slate-800">
              {intervals
                .filter((int) => int.startDeg < maxAngle)
                .map((int, i) => {
                  const segStart = Math.max(0, int.startDeg);
                  const segEnd = Math.min(maxAngle, int.endDeg);
                  const widthPct = ((segEnd - segStart) / maxAngle) * 100;
                  if (widthPct <= 0) return null;

                  return (
                    <div
                      key={i}
                      style={{ width: `${widthPct}%` }}
                      className={`h-full border-r border-slate-800 flex items-center justify-center text-[10px] font-mono font-bold truncate px-1 transition-colors ${int.colorClass}`}
                      title={`${int.label}: ${segStart.toFixed(0)}° - ${segEnd.toFixed(0)}°`}
                    >
                      {int.label}
                    </div>
                  );
                })}

              {/* Cursor playhead on interval bar */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 shadow-[0_0_8px_#22d3ee] pointer-events-none"
                style={{
                  left: `${((currentAngleDeg % maxAngle) / maxAngle) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Interactive Scrubber Slider */}
          <div className="flex items-center gap-3 mt-3 px-1">
            <span className="text-xs font-mono font-semibold text-cyan-300 whitespace-nowrap">
              Angle ωt:
            </span>
            <input
              type="range"
              min="0"
              max={maxAngle}
              step="0.5"
              value={currentAngleDeg % maxAngle}
              onChange={(e) => onSeekAngle(parseFloat(e.target.value))}
              className="flex-1 accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-slate-100 min-w-[50px] text-right">
              {(currentAngleDeg % maxAngle).toFixed(1)}°
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

/* --------------------------------------------------------------------------
   Canvas Drawing: Superimposed View (Screenshot 4)
   - Voltage: v_s (cyan DOTTED), v_o (green SOLID), V_avg (purple DASHED)
   - Current: i_o (orange SOLID), i_s (purple SOLID)
-------------------------------------------------------------------------- */
function drawSuperimposedView(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  points: WaveformPoint[],
  maxAngle: number,
  vScaleLimit: number,
  iScaleLimit: number,
  vDc: number,
  showGrid: boolean,
  showVavg: boolean,
  currentAngle: number
) {
  const padLeft = 60;
  const padRight = 45;
  const padTop = 30;
  const padBottom = 35;
  const plotWidth = width - padLeft - padRight;
  const totalPlotHeight = height - padTop - padBottom;

  // Split into two graphs: Top (Voltage), Bottom (Current)
  const gap = 30;
  const vGraphHeight = (totalPlotHeight - gap) * 0.58;
  const iGraphHeight = (totalPlotHeight - gap) * 0.42;

  const vTop = padTop;
  const vMid = vTop + vGraphHeight / 2;
  const iTop = vTop + vGraphHeight + gap;
  const iMid = iTop + iGraphHeight / 2;

  // Helper coordinate transforms
  const xForAngle = (angle: number) => padLeft + (angle / maxAngle) * plotWidth;
  const yForV = (v: number) => vMid - (v / vScaleLimit) * (vGraphHeight / 2);
  const yForI = (i: number) => iMid - (i / iScaleLimit) * (iGraphHeight / 2);

  // 1. Grid & Axes
  if (showGrid) {
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;

    // Angle vertical grid lines at 90° intervals
    const angleStep = 90;
    for (let a = 0; a <= maxAngle; a += angleStep) {
      const x = xForAngle(a);
      ctx.beginPath();
      ctx.moveTo(x, vTop);
      ctx.lineTo(x, vTop + vGraphHeight);
      ctx.moveTo(x, iTop);
      ctx.lineTo(x, iTop + iGraphHeight);
      ctx.stroke();

      // Axis label
      ctx.fillStyle = '#64748b';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${a}°`, x, vTop + vGraphHeight + 14);
      ctx.fillText(`${a}°`, x, iTop + iGraphHeight + 14);
    }

    // Horizontal Zero lines
    ctx.strokeStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(padLeft, vMid);
    ctx.lineTo(padLeft + plotWidth, vMid);
    ctx.moveTo(padLeft, iMid);
    ctx.lineTo(padLeft + plotWidth, iMid);
    ctx.stroke();

    // Secondary voltage grid lines
    ctx.strokeStyle = '#162032';
    ctx.beginPath();
    ctx.moveTo(padLeft, yForV(vScaleLimit * 0.5));
    ctx.lineTo(padLeft + plotWidth, yForV(vScaleLimit * 0.5));
    ctx.moveTo(padLeft, yForV(-vScaleLimit * 0.5));
    ctx.lineTo(padLeft + plotWidth, yForV(-vScaleLimit * 0.5));
    ctx.stroke();
  }

  // 2. Titles & Y-Labels
  // Voltage Graph Title
  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px Plus Jakarta Sans, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Voltage Waveforms (v_s & v_o Superimposed)', padLeft, vTop - 12);
  ctx.fillStyle = '#64748b';
  ctx.textAlign = 'right';
  ctx.fillText('[V]', padLeft + plotWidth, vTop - 12);

  // Voltage Y-axis values
  ctx.fillStyle = '#64748b';
  ctx.font = '9px JetBrains Mono, monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`${vScaleLimit}V`, padLeft - 8, vTop + 6);
  ctx.fillText('0V', padLeft - 8, vMid + 3);
  ctx.fillText(`-${vScaleLimit}V`, padLeft - 8, vTop + vGraphHeight);

  // Current Graph Title
  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px Plus Jakarta Sans, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Current Waveforms (i_o & i_s)', padLeft, iTop - 10);
  ctx.fillStyle = '#64748b';
  ctx.textAlign = 'right';
  ctx.fillText('[A]', padLeft + plotWidth, iTop - 10);

  // Current Y-axis values
  ctx.fillStyle = '#64748b';
  ctx.font = '9px JetBrains Mono, monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`${iScaleLimit}A`, padLeft - 8, iTop + 6);
  ctx.fillText('0A', padLeft - 8, iMid + 3);
  ctx.fillText(`-${iScaleLimit}A`, padLeft - 8, iTop + iGraphHeight);

  // 3. Draw Source Voltage v_s(t) in DOTTED / DASHED Cyan line (Screenshot 4)
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 1.8;
  ctx.setLineDash([4, 4]); // Dotted line!
  ctx.beginPath();
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const x = xForAngle(p.angleDeg);
    const y = yForV(p.vSource);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // 4. Draw Load Voltage v_o(t) in SOLID Bright Green Line
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2.4;
  ctx.setLineDash([]); // Solid line!
  ctx.beginPath();
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const x = xForAngle(p.angleDeg);
    const y = yForV(p.vOutput);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // 5. Draw V_avg Line (dashed purple)
  if (showVavg && vDc > 0) {
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    const yVavg = yForV(vDc);
    ctx.moveTo(padLeft, yVavg);
    ctx.lineTo(padLeft + plotWidth, yVavg);
    ctx.stroke();

    ctx.fillStyle = '#c084fc';
    ctx.font = '9px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`V_avg = ${vDc.toFixed(1)}V`, padLeft + 6, yVavg - 4);
  }

  // 6. Draw Load Current i_o(t) in SOLID Amber/Orange Line
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2.4;
  ctx.setLineDash([]);
  ctx.beginPath();
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const x = xForAngle(p.angleDeg);
    const y = yForI(p.iOutput);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // 7. Draw Source Current i_s(t) in Lavender Line
  ctx.strokeStyle = '#818cf8';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const x = xForAngle(p.angleDeg);
    const y = yForI(p.iSource);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // 8. Draw Cursor Line at currentAngle (Screenshot 4)
  const cursorX = xForAngle(currentAngle);
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(cursorX, vTop - 5);
  ctx.lineTo(cursorX, iTop + iGraphHeight + 5);
  ctx.stroke();
  ctx.setLineDash([]);

  // Top and bottom handles
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(cursorX, vTop, 4, 0, Math.PI * 2);
  ctx.arc(cursorX, iTop + iGraphHeight, 4, 0, Math.PI * 2);
  ctx.fill();
}

/* --------------------------------------------------------------------------
   Canvas Drawing: 4 Oscilloscope Channels View (Screenshot 3)
   - 1. Load Voltage v_o(t) (green)
   - 2. Load Current i_o(t) (amber)
   - 3. Source AC Voltage v_s(t) (cyan)
   - 4. Source AC Current i_s(t) (purple)
-------------------------------------------------------------------------- */
function drawChannelsView(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  points: WaveformPoint[],
  maxAngle: number,
  vScaleLimit: number,
  iScaleLimit: number,
  showGrid: boolean,
  currentAngle: number
) {
  const padLeft = 60;
  const padRight = 45;
  const padTop = 20;
  const padBottom = 25;
  const plotWidth = width - padLeft - padRight;
  const totalPlotHeight = height - padTop - padBottom;

  const chCount = 4;
  const chHeight = totalPlotHeight / chCount;

  const channels = [
    { title: 'Load Voltage v_o(t)', unit: '[V]', color: '#10b981', key: 'vOutput', scale: vScaleLimit },
    { title: 'Load Current i_o(t)', unit: '[A]', color: '#f59e0b', key: 'iOutput', scale: iScaleLimit },
    { title: 'Source AC Voltage v_s(t)', unit: '[V]', color: '#06b6d4', key: 'vSource', scale: vScaleLimit },
    { title: 'Source AC Current i_s(t)', unit: '[A]', color: '#818cf8', key: 'iSource', scale: iScaleLimit },
  ];

  const xForAngle = (angle: number) => padLeft + (angle / maxAngle) * plotWidth;

  channels.forEach((ch, idx) => {
    const chTop = padTop + idx * chHeight;
    const chMid = chTop + chHeight / 2;

    // Grid line
    if (showGrid) {
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let a = 0; a <= maxAngle; a += 90) {
        const x = xForAngle(a);
        ctx.beginPath();
        ctx.moveTo(x, chTop);
        ctx.lineTo(x, chTop + chHeight);
        ctx.stroke();
      }

      // Zero baseline
      ctx.strokeStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(padLeft, chMid);
      ctx.lineTo(padLeft + plotWidth, chMid);
      ctx.stroke();
    }

    // Title & Unit
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(ch.title, padLeft, chTop + 12);
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'right';
    ctx.fillText(ch.unit, padLeft + plotWidth, chTop + 12);

    // Y values
    ctx.font = '8px JetBrains Mono, monospace';
    ctx.fillText(`${ch.scale}`, padLeft - 6, chTop + 10);
    ctx.fillText('0', padLeft - 6, chMid + 3);
    ctx.fillText(`-${ch.scale}`, padLeft - 6, chTop + chHeight - 2);

    // Waveform line
    ctx.strokeStyle = ch.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const val = (p as any)[ch.key] as number;
      const x = xForAngle(p.angleDeg);
      const y = chMid - (val / ch.scale) * (chHeight * 0.44);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  });

  // Cursor Line
  const cursorX = xForAngle(currentAngle);
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(cursorX, padTop);
  ctx.lineTo(cursorX, padTop + totalPlotHeight);
  ctx.stroke();
  ctx.setLineDash([]);
}

/* --------------------------------------------------------------------------
   Harmonics FFT Spectrum View
-------------------------------------------------------------------------- */
function FFTHarmonicsView({
  harmonics,
  vDc,
  frequency,
}: {
  harmonics: HarmonicComponent[];
  vDc: number;
  frequency: number;
}) {
  return (
    <div className="flex flex-col flex-1 bg-[#060a14] rounded-lg border border-slate-800/60 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">
            Harmonic Spectrum Analysis (FFT)
          </h3>
          <p className="text-xs text-slate-400">
            Fourier series decomposition of Rectifier Output Voltage & Input Source Current
          </p>
        </div>
        <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800">
          Base: {frequency} Hz
        </span>
      </div>

      {/* Bar Chart Visualization */}
      <div className="h-44 w-full flex items-end gap-2 pb-6 border-b border-slate-800 mb-4 px-2">
        {harmonics.slice(0, 9).map((h) => {
          const barHeight = Math.min(100, Math.max(4, h.vPercentage));
          return (
            <div key={h.harmonic} className="flex-1 flex flex-col items-center h-full justify-end">
              <span className="text-[9px] font-mono text-cyan-300 mb-1">
                {h.vPercentage.toFixed(1)}%
              </span>
              <div
                style={{ height: `${barHeight}%` }}
                className={`w-full max-w-[28px] rounded-t transition-all ${
                  h.harmonic === 0
                    ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
                    : h.harmonic === 1
                    ? 'bg-cyan-500 shadow-[0_0_8px_#06b6d4]'
                    : 'bg-indigo-500'
                }`}
              />
              <span className="text-[10px] font-mono text-slate-400 mt-2">
                {h.harmonic === 0 ? 'DC' : `${h.harmonic}f`}
              </span>
            </div>
          );
        })}
      </div>

      {/* Tabular Harmonics Breakdown */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="py-2 px-3">Order (n)</th>
              <th className="py-2 px-3">Frequency</th>
              <th className="py-2 px-3">Output V_n (RMS)</th>
              <th className="py-2 px-3">% of V_dc</th>
              <th className="py-2 px-3">Source I_n (RMS)</th>
              <th className="py-2 px-3">Phase Angle</th>
            </tr>
          </thead>
          <tbody>
            {harmonics.map((h) => (
              <tr
                key={h.harmonic}
                className="border-b border-slate-900 hover:bg-slate-900/50 transition-colors"
              >
                <td className="py-2 px-3 font-bold text-slate-200">
                  {h.harmonic === 0 ? 'DC (0)' : `Harmonic ${h.harmonic}`}
                </td>
                <td className="py-2 px-3 text-slate-400">{h.frequencyHz} Hz</td>
                <td className="py-2 px-3 text-cyan-300 font-bold">
                  {h.vMagnitude.toFixed(2)} V
                </td>
                <td className="py-2 px-3 text-slate-300">
                  {h.vPercentage.toFixed(1)}%
                </td>
                <td className="py-2 px-3 text-amber-300 font-bold">
                  {h.iMagnitude.toFixed(2)} A
                </td>
                <td className="py-2 px-3 text-slate-400">
                  {h.phaseDeg.toFixed(1)}°
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
