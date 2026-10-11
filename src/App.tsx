import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ConverterConfig, WaveformPoint } from './types/rectifier';
import { simulateRectifier } from './simulation/rectifierMath';
import { Header } from './components/Header';
import { PlaybackBar } from './components/PlaybackBar';
import { ControlPanel } from './components/ControlPanel';
import { MetricsCards } from './components/MetricsCards';
import { TheoreticalBanner } from './components/TheoreticalBanner';
import { CircuitSchematic } from './components/CircuitSchematic';
import { WaveformOscilloscope } from './components/WaveformOscilloscope';
import { DerivationsModal } from './components/DerivationsModal';
import { TheoryModal } from './components/TheoryModal';
import { PresetsModal } from './components/PresetsModal';

const DEFAULT_CONFIG: ConverterConfig = {
  phase: '1P',
  bridge: 'half',
  deviceSetup: 'all_diodes',
  switchTypes: {},
  firingAngle: 45,
  hasFWD: false,
  loadType: 'RL',
  resistance: 20,
  inductance: 45,
  backEMF: 0,
  sourceRms: 230,
  frequency: 50,
};

export default function App() {
  const [config, setConfig] = useState<ConverterConfig>(DEFAULT_CONFIG);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(0.1);
  const [currentAngleDeg, setCurrentAngleDeg] = useState<number>(110.0);
  const [isLightMode, setIsLightMode] = useState<boolean>(false);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  // Modals state
  const [showDerivations, setShowDerivations] = useState<boolean>(false);
  const [showTheory, setShowTheory] = useState<boolean>(false);
  const [showPresets, setShowPresets] = useState<boolean>(false);

  // Simulation execution
  const simResult = React.useMemo(() => {
    return simulateRectifier(config);
  }, [config]);

  const { points, metrics, intervals, harmonics } = simResult;

  // Find active waveform point for current playhead angle
  const activePoint: WaveformPoint = React.useMemo(() => {
    const cycleAngle = currentAngleDeg % 720;
    const pt = points.find((p) => Math.abs(p.angleDeg - cycleAngle) < 0.7);
    return pt || points[0] || {
      index: 0,
      timeMs: 0,
      angleDeg: 0,
      angleRad: 0,
      vSource: 0,
      vOutput: 0,
      iOutput: 0,
      iSource: 0,
      iFWD: 0,
      activeDevices: [],
      activeLabel: 'OFF',
    };
  }, [points, currentAngleDeg]);

  // Real-Time Playhead Animation Loop
  const lastTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const animate = useCallback(
    (time: number) => {
      if (lastTimeRef.current !== null && isPlaying) {
        const deltaSec = (time - lastTimeRef.current) / 1000;
        // Human-scale visualization: 120 deg/sec at 1.0x (1 cycle every 3 seconds)
        // At default 0.1x: 12 deg/sec (1 cycle every 30 seconds) for clear inspection
        const baseDegPerSec = 120;
        const degDelta = deltaSec * baseDegPerSec * speed;
        setCurrentAngleDeg((prev) => (prev + degDelta) % 720);
      }
      lastTimeRef.current = time;
      if (isPlaying) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    },
    [isPlaying, speed]
  );

  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = null;
      animFrameRef.current = requestAnimationFrame(animate);
    } else {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      lastTimeRef.current = null;
    }

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, animate]);

  // Handlers
  const handleConfigChange = (updated: Partial<ConverterConfig>) => {
    setConfig((prev) => ({ ...prev, ...updated }));
  };

  const handleStepBack = () => {
    setCurrentAngleDeg((prev) => (prev - 5 + 720) % 720);
  };

  const handleStepForward = () => {
    setCurrentAngleDeg((prev) => (prev + 5) % 720);
  };

  const handleReset = () => {
    setCurrentAngleDeg(0);
  };

  const handleResetAll = () => {
    setConfig(DEFAULT_CONFIG);
    setCurrentAngleDeg(0);
    setIsPlaying(false);
  };

  return (
    <div
      className={`min-h-screen ${
        isLightMode
          ? 'bg-slate-100 text-slate-900'
          : 'bg-[#080d1a] text-slate-100'
      } flex flex-col transition-colors selection:bg-cyan-500/30 selection:text-cyan-200`}
    >
      {/* Header */}
      <Header
        onOpenDerivations={() => setShowDerivations(true)}
        onOpenTheory={() => setShowTheory(true)}
        onOpenPresets={() => setShowPresets(true)}
        onResetAll={handleResetAll}
        isLightMode={isLightMode}
        onToggleLightMode={() => setIsLightMode(!isLightMode)}
        isFullScreen={isFullScreen}
        onToggleFullScreen={() => setIsFullScreen(!isFullScreen)}
      />

      {/* Main Studio Container */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 space-y-4">
        {/* Playback Control Bar */}
        <PlaybackBar
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          onStepBack={handleStepBack}
          onStepForward={handleStepForward}
          onReset={handleReset}
          speed={speed}
          onChangeSpeed={setSpeed}
        />

        {/* 3 Parameter Control Cards */}
        <ControlPanel config={config} onChange={handleConfigChange} />

        {/* Quantitative Metrics Bar (6 Cards) */}
        <MetricsCards metrics={metrics} />

        {/* Theoretical Formula Banner */}
        <TheoreticalBanner metrics={metrics} />

        {/* Display Panes (Circuit Schematic on Left, Waveform Oscilloscope on Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch min-h-[500px]">
          {/* Left: Interactive Circuit Schematic Diagram */}
          <div className="h-full">
            <CircuitSchematic
              config={config}
              onUpdateConfig={handleConfigChange}
              currentPoint={activePoint}
            />
          </div>

          {/* Right: Waveforms Oscilloscope & FFT */}
          <div className="h-full">
            <WaveformOscilloscope
              points={points}
              intervals={intervals}
              harmonics={harmonics}
              vDc={metrics.vDc}
              currentAngleDeg={currentAngleDeg}
              onSeekAngle={(angle) => setCurrentAngleDeg(angle)}
              frequency={config.frequency}
              isFullScreen={isFullScreen}
              onToggleFullScreen={() => setIsFullScreen(!isFullScreen)}
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      <DerivationsModal
        isOpen={showDerivations}
        onClose={() => setShowDerivations(false)}
        config={config}
        metrics={metrics}
      />

      <TheoryModal
        isOpen={showTheory}
        onClose={() => setShowTheory(false)}
      />

      <PresetsModal
        isOpen={showPresets}
        onClose={() => setShowPresets(false)}
        onSelectPreset={(preset) => handleConfigChange(preset)}
      />
    </div>
  );
}
