import React from 'react';
import { PlayIcon, PauseIcon, ResetIcon, ZoomInIcon, ZoomOutIcon, TargetCrosshairIcon } from './Icons';

interface ControlsPanelProps {
  isRunning: boolean;
  simulationSpeed: number;
  onTogglePlayPause: () => void;
  onReset: () => void;
  onSpeedChange: (newSpeed: number) => void;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  isBodyFocused: boolean;
}

const Button: React.FC<{ 
  onClick: () => void; 
  children: React.ReactNode; 
  title: string; 
  className?: string;
  disabled?: boolean;
}> = ({ onClick, children, title, className = '', disabled = false }) => (
  <button
    onClick={onClick}
    title={title}
    disabled={disabled}
    className={`p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50 flex items-center justify-center space-x-2 ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    aria-disabled={disabled}
  >
    {children}
  </button>
);


const ControlsPanel: React.FC<ControlsPanelProps> = ({
  isRunning,
  simulationSpeed,
  onTogglePlayPause,
  onReset,
  onSpeedChange,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  isBodyFocused
}) => {
  const handleSpeedSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSpeedChange(parseFloat(event.target.value));
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-gray-800 rounded-b-lg shadow-lg flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0 lg:space-x-4">
      {/* Left: Playback Controls */}
      <div className="flex items-center space-x-3">
        <Button onClick={onTogglePlayPause} title={isRunning ? "Pause Simulation" : "Play Simulation"}>
          {isRunning ? <PauseIcon /> : <PlayIcon />}
          <span className="hidden sm:inline">{isRunning ? "Pause" : "Play"}</span>
        </Button>
        <Button onClick={onReset} title="Reset Simulation State & View">
          <ResetIcon />
           <span className="hidden sm:inline">Reset All</span>
        </Button>
      </div>
      
      {/* Middle: Speed Control */}
      <div className="flex flex-col items-center sm:items-start w-full sm:w-auto">
        <label htmlFor="speedControl" className="text-sm text-gray-300 mb-1">Simulation Speed</label>
        <input
          type="range"
          id="speedControl"
          min="0.1"
          max="5"
          step="0.1"
          value={simulationSpeed}
          onChange={handleSpeedSliderChange}
          className="w-48 sm:w-56 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-sky-500"
          title={`Current speed: ${simulationSpeed.toFixed(1)}x`}
          aria-label="Simulation speed control"
        />
        <div className="text-xs text-gray-400 mt-1 w-full text-center sm:text-right">{simulationSpeed.toFixed(1)}x</div>
      </div>

      {/* Right: Zoom Controls */}
      <div className="flex items-center space-x-3">
        <Button onClick={onZoomOut} title="Zoom Out" disabled={isBodyFocused}>
          <ZoomOutIcon />
        </Button>
        <Button onClick={onResetZoom} title={isBodyFocused ? "Reset View & Unfocus" : "Reset Zoom & View"}>
          <TargetCrosshairIcon />
          <span className="hidden sm:inline text-xs px-1">{zoomLevel.toFixed(1)}x</span>
        </Button>
        <Button onClick={onZoomIn} title="Zoom In" disabled={isBodyFocused}>
          <ZoomInIcon />
        </Button>
      </div>
    </div>
  );
};

export default ControlsPanel;
