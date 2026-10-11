import React from 'react';
import { X, BookText, Zap, Compass, CheckCircle2 } from 'lucide-react';

interface TheoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TheoryModal: React.FC<TheoryModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-[#0c1324] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#090f1d]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <BookText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Power Electronics Theory Guide</h2>
              <p className="text-xs text-slate-400">
                Core concepts of line-commutated rectifiers and controlled converters
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-slate-300 leading-relaxed">
          {/* Section 1: Diodes vs Thyristors */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <h3 className="text-sm font-bold text-cyan-300 mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              1. Uncontrolled (Diode) vs Controlled (Thyristor) Rectifiers
            </h3>
            <p>
              <strong>Diodes (Uncontrolled):</strong> Turn ON naturally whenever forward-biased (v_A &gt; v_K).
              They cannot control the average DC output voltage for a fixed AC input voltage.
            </p>
            <p className="mt-2">
              <strong>Thyristors / SCRs (Controlled):</strong> Turn ON only when forward-biased AND triggered by a gate pulse at delay angle $\alpha$ (firing angle).
              By delaying $\alpha$ from $0^\circ$ to $180^\circ$, the average DC output voltage can be smoothly regulated from maximum positive to zero (or even negative in full-bridge converters with continuous current).
            </p>
          </div>

          {/* Section 2: Freewheeling Diode (FWD) */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <h3 className="text-sm font-bold text-amber-300 mb-2 flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" />
              2. Freewheeling Diode (D_FW) Functionality
            </h3>
            <p>
              When an inductive load (RL) is connected, the inductor opposes changes in current (v_L = L di/dt).
              At ωt = π, the input AC voltage goes negative.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>
                <strong>Without FWD:</strong> The main thyristor or diode continues to conduct past π, pulling v_o negative until current extinguishes at extinction angle β. This drops the net average DC voltage and introduces high ripple.
              </li>
              <li>
                <strong>With FWD:</strong> As soon as v_o drops below zero, the freewheeling diode turns ON, providing an alternate path for the decaying inductor current. This clamps v_o to 0V, improving efficiency, increasing V_dc, and preventing reverse voltage spikes.
              </li>
            </ul>
          </div>

          {/* Section 3: CCM vs DCM Conduction Modes */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <h3 className="text-sm font-bold text-emerald-300 mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              3. Continuous (CCM) vs Discontinuous (DCM) Conduction Modes
            </h3>
            <p>
              <strong>CCM (Continuous Conduction Mode):</strong> The load current $i_o(t)$ never drops to zero between pulses.
              This occurs when load inductance $L$ is large or resistance $R$ is small.
              In CCM, the output voltage waveform depends purely on the firing angle and topology.
            </p>
            <p className="mt-2">
              <strong>DCM (Discontinuous Conduction Mode):</strong> The load current reaches zero before the next switch is triggered.
              During the dead interval where $i_o = 0$, the load voltage settles at the back EMF $E$ (or zero for passive $RL$).
            </p>
          </div>

          {/* Section 4: Single-Phase vs Three-Phase Rectifiers */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <h3 className="text-sm font-bold text-indigo-300 mb-2">
              4. Single-Phase vs Three-Phase Rectifiers
            </h3>
            <p>
              Single-phase converters produce a 2-pulse ripple (100 Hz for 50 Hz line).
              Three-phase full-bridge (6-pulse) converters produce a 6-pulse output at 300 Hz with significantly lower ripple factor ($RF \approx 0.04$ vs $0.48$), requiring much smaller smoothing inductors and capacitors for industrial DC motor drives and battery chargers.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#090f1d] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
