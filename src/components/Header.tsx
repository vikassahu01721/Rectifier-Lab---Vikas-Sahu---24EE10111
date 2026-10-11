import React, { useState } from 'react';
import {
  Zap,
  Calculator,
  SlidersHorizontal,
  BookText,
  RotateCcw,
  Sun,
  Moon,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface HeaderProps {
  onOpenDerivations: () => void;
  onOpenTheory: () => void;
  onOpenPresets: () => void;
  onResetAll: () => void;
  isLightMode: boolean;
  onToggleLightMode: () => void;
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenDerivations,
  onOpenTheory,
  onOpenPresets,
  onResetAll,
  isLightMode,
  onToggleLightMode,
  isFullScreen,
  onToggleFullScreen,
}) => {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 py-4 px-6 border-b border-slate-800/80 bg-[#070d1a]/95 backdrop-blur sticky top-0 z-40">
      {/* Brand & Subtitle */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-400 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-slate-950">
          <Zap className="w-6 h-6 fill-current" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white font-sans">
              RectifierLab
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-950/90 text-cyan-400 border border-cyan-800/60 font-mono tracking-wide">
              Power Electronics Studio
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Interactive Single-Phase & Three-Phase Diode/Thyristor Bridge Converter Simulation
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Light/Dark Mode */}
        <button
          onClick={onToggleLightMode}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
        >
          {isLightMode ? (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Dark Mode</span>
            </>
          ) : (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Light Mode</span>
            </>
          )}
        </button>

        {/* Full Screen Studio */}
        <button
          onClick={onToggleFullScreen}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
        >
          {isFullScreen ? (
            <>
              <Minimize2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Exit Studio</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Full Screen Studio</span>
            </>
          )}
        </button>

        {/* Waveform Analysis & Derivations Modal */}
        <button
          onClick={onOpenDerivations}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors shadow-sm"
        >
          <Calculator className="w-3.5 h-3.5 text-amber-400" />
          <span>Waveform Analysis & Derivations</span>
        </button>

        {/* Presets Modal */}
        <button
          onClick={onOpenPresets}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
          <span>Presets</span>
        </button>

        {/* Theory Modal */}
        <button
          onClick={onOpenTheory}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
        >
          <BookText className="w-3.5 h-3.5 text-emerald-400" />
          <span>Theory</span>
        </button>

        {/* Reset Button */}
        <button
          onClick={onResetAll}
          title="Reset Parameters to Default"
          className="p-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
