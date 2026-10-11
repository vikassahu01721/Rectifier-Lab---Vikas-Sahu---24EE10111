import React from 'react';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Gauge } from 'lucide-react';

interface PlaybackBarProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStepBack: () => void;
  onStepForward: () => void;
  onReset: () => void;
  speed: number;
  onChangeSpeed: (newSpeed: number) => void;
}

export const PlaybackBar: React.FC<PlaybackBarProps> = ({
  isPlaying,
  onTogglePlay,
  onStepBack,
  onStepForward,
  onReset,
  speed,
  onChangeSpeed,
}) => {
  const speedOptions = [0.05, 0.1, 0.2, 0.5, 1, 2];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0d1527]/90 border border-slate-800/80 rounded-xl px-4 py-2.5 mb-4 shadow-xl backdrop-blur-sm">
      {/* Playback Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onTogglePlay}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-xs transition-all shadow-md ${
            isPlaying
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Run Real-Time</span>
            </>
          )}
        </button>

        <button
          onClick={onStepBack}
          title="Step Back 5°"
          className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={onStepForward}
          title="Step Forward 5°"
          className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          onClick={onReset}
          title="Reset to 0°"
          className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Speed Slider & Quick Selectors */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <Gauge className="w-3.5 h-3.5 text-cyan-400" />
          <span>Speed:</span>
        </div>

        <input
          type="range"
          min="0.05"
          max="2"
          step="0.05"
          value={speed}
          onChange={(e) => onChangeSpeed(parseFloat(e.target.value))}
          className="w-24 sm:w-36 accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
        />

        <div className="flex items-center gap-1">
          {speedOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => onChangeSpeed(opt)}
              className={`px-2 py-0.5 text-[11px] font-mono font-semibold rounded transition-colors ${
                Math.abs(speed - opt) < 0.02
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}
            >
              {opt}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
