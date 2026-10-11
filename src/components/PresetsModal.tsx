import React from 'react';
import { X, Sparkles, Check, ArrowRight } from 'lucide-react';
import { ConverterConfig } from '../types/rectifier';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (presetConfig: Partial<ConverterConfig>) => void;
}

interface PresetItem {
  id: string;
  title: string;
  category: string;
  description: string;
  config: Partial<ConverterConfig>;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
}) => {
  if (!isOpen) return null;

  const presets: PresetItem[] = [
    {
      id: '1p_hw_diode_r',
      title: '1Φ Half-Wave Diode (R Load)',
      category: '1-Phase Half-Wave',
      description: 'Classic single diode half-wave rectification across pure 20 Ω resistive load. Pure sinusoidal positive pulse.',
      config: {
        phase: '1P',
        bridge: 'half',
        deviceSetup: 'all_diodes',
        loadType: 'R',
        resistance: 20,
        inductance: 0,
        hasFWD: false,
        sourceRms: 230,
      },
    },
    {
      id: '1p_hw_diode_rl_fwd',
      title: '1Φ Half-Wave Diode with Freewheeling Diode (RL Load)',
      category: '1-Phase Half-Wave',
      description: 'RL load with freewheeling diode clamping negative voltage spikes at zero, sustaining load current.',
      config: {
        phase: '1P',
        bridge: 'half',
        deviceSetup: 'all_diodes',
        loadType: 'RL',
        resistance: 20,
        inductance: 45,
        hasFWD: true,
        sourceRms: 230,
      },
    },
    {
      id: '1p_hw_thyristor_rl_nofwd',
      title: '1Φ Half-Wave Thyristor (RL without FWD - Negative Excursion)',
      category: '1-Phase Half-Wave',
      description: 'Controlled firing at α = 45°. The inductor forces conduction past 180° into negative voltage region until extinction angle β.',
      config: {
        phase: '1P',
        bridge: 'half',
        deviceSetup: 'all_thyristors',
        firingAngle: 45,
        loadType: 'RL',
        resistance: 20,
        inductance: 50,
        hasFWD: false,
        sourceRms: 230,
      },
    },
    {
      id: '1p_fw_diode_bridge',
      title: '1Φ Full-Wave Diode Bridge (RL Load)',
      category: '1-Phase Full-Bridge',
      description: '4-diode full bridge converter supplying RL load. Continuous conduction with 100 Hz output ripple.',
      config: {
        phase: '1P',
        bridge: 'full',
        deviceSetup: 'all_diodes',
        loadType: 'RL',
        resistance: 20,
        inductance: 40,
        hasFWD: false,
        sourceRms: 230,
      },
    },
    {
      id: '1p_semi_converter',
      title: '1Φ Semi-Converter (Half-Controlled Bridge, α = 45°)',
      category: '1-Phase Full-Bridge',
      description: '2 thyristors and 2 diodes. Features intrinsic freewheeling action, clamping negative voltage spikes to 0V.',
      config: {
        phase: '1P',
        bridge: 'full',
        deviceSetup: 'semi_converter',
        firingAngle: 45,
        loadType: 'RL',
        resistance: 20,
        inductance: 45,
        hasFWD: true,
        sourceRms: 230,
      },
    },
    {
      id: '1p_fully_controlled',
      title: '1Φ Fully-Controlled Thyristor Bridge (α = 60°)',
      category: '1-Phase Full-Bridge',
      description: '4 thyristors with continuous inductor current. Load voltage displays negative dips during commutation intervals.',
      config: {
        phase: '1P',
        bridge: 'full',
        deviceSetup: 'all_thyristors',
        firingAngle: 60,
        loadType: 'RL',
        resistance: 20,
        inductance: 60,
        hasFWD: false,
        sourceRms: 230,
      },
    },
    {
      id: '3p_hw_diode',
      title: '3Φ Half-Wave 3-Pulse Diode Rectifier',
      category: '3-Phase Half-Wave',
      description: '3 diodes connected to star source with neutral return. Each phase conducts for 120° with 150 Hz ripple.',
      config: {
        phase: '3P',
        bridge: 'half',
        deviceSetup: 'all_diodes',
        loadType: 'RL',
        resistance: 25,
        inductance: 35,
        hasFWD: false,
        sourceRms: 230,
      },
    },
    {
      id: '3p_fw_6pulse_diode',
      title: '3Φ Full-Wave 6-Pulse Diode Bridge (Industrial Standard)',
      category: '3-Phase Full-Bridge',
      description: 'Standard 6-diode bridge converter. High efficiency, ultra-low ripple 300 Hz DC output for industrial drives.',
      config: {
        phase: '3P',
        bridge: 'full',
        deviceSetup: 'all_diodes',
        loadType: 'RL',
        resistance: 15,
        inductance: 40,
        hasFWD: false,
        sourceRms: 230,
      },
    },
    {
      id: '3p_fw_6pulse_thyristor',
      title: '3Φ Full-Wave Controlled Converter (α = 45°)',
      category: '3-Phase Full-Bridge',
      description: 'Fully controlled 6-thyristor converter for DC drive speed control with delayed firing angle.',
      config: {
        phase: '3P',
        bridge: 'full',
        deviceSetup: 'all_thyristors',
        firingAngle: 45,
        loadType: 'RL',
        resistance: 15,
        inductance: 50,
        hasFWD: false,
        sourceRms: 230,
      },
    },
    {
      id: 'battery_charger_rle',
      title: 'Battery Charger / DC Motor (RLE Load with Back EMF)',
      category: 'Special Application',
      description: 'Full-bridge rectifier charging a DC battery or DC motor with back EMF E = 45V and series filter inductance.',
      config: {
        phase: '1P',
        bridge: 'full',
        deviceSetup: 'all_diodes',
        loadType: 'RLE',
        resistance: 10,
        inductance: 30,
        backEMF: 45,
        hasFWD: true,
        sourceRms: 110,
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-[#0c1324] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#090f1d]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Laboratory Circuit Presets</h2>
              <p className="text-xs text-slate-400">
                Pre-configured test circuits matching textbook experiments and industrial standards
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

        {/* List of Presets */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          {presets.map((preset) => (
            <div
              key={preset.id}
              onClick={() => {
                onSelectPreset(preset.config);
                onClose();
              }}
              className="p-4 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/60 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 block mb-1">
                  {preset.category}
                </span>
                <h3 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors mb-1.5">
                  {preset.title}
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                  {preset.description}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-cyan-400 font-semibold pt-2 border-t border-slate-800/80">
                <span>Load Preset</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#090f1d] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
