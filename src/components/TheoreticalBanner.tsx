import React from 'react';
import { BookOpen } from 'lucide-react';
import { RectifierMetrics } from '../types/rectifier';

interface TheoreticalBannerProps {
  metrics: RectifierMetrics;
}

export const TheoreticalBanner: React.FC<TheoreticalBannerProps> = ({ metrics }) => {
  const { formulaTitle, formulaDescription, formulaLatex, theoreticalVdc } = metrics;

  return (
    <div className="bg-[#0b1222]/90 border border-slate-800/80 rounded-xl p-4 mb-4 shadow-xl backdrop-blur-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      {/* Left Details */}
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mt-0.5">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-100">
              {formulaTitle}
            </h3>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950/70 text-cyan-400 border border-cyan-800/50">
              Analytical Equation
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            {formulaDescription}
          </p>
        </div>
      </div>

      {/* Right Formula & Theoretical Value */}
      <div className="flex flex-wrap items-center gap-4 bg-[#070c18] border border-slate-800/80 rounded-lg px-4 py-2.5 self-stretch md:self-auto justify-between md:justify-end">
        <div>
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
            Theoretical Formula
          </span>
          <code className="text-sm font-mono font-bold text-cyan-300">
            {formulaLatex}
          </code>
        </div>

        <div className="border-l border-slate-800 pl-4">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
            Ideal Theoretical V_dc
          </span>
          <div className="text-base font-bold font-mono text-emerald-400">
            {theoreticalVdc.toFixed(1)} <span className="text-xs font-sans text-slate-400">V</span>
          </div>
        </div>
      </div>
    </div>
  );
};
