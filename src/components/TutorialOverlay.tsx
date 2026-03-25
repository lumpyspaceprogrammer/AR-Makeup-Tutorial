import React, { useState } from 'react';
import { MakeupLook, MakeupStep } from '../types';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Sparkles, Camera as CameraIcon, LayoutGrid, Save, Sliders, Palette, Map as MapIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import FaceChart from './FaceChart';

interface TutorialOverlayProps {
  look: MakeupLook;
  currentStepIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  onToggleAll: (show: boolean) => void;
  showAll: boolean;
  onUpdateStep: (stepId: string, updates: Partial<MakeupStep>) => void;
  onSaveLook: () => void;
  isCustomizing: boolean;
  setIsCustomizing: (val: boolean) => void;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  look,
  currentStepIndex,
  onNext,
  onPrev,
  onClose,
  onToggleAll,
  showAll,
  onUpdateStep,
  onSaveLook,
  isCustomizing,
  setIsCustomizing
}) => {
  const [showFaceChart, setShowFaceChart] = useState(false);
  const currentStep = look.steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / look.steps.length) * 100;

  return (
    <div className="absolute inset-0 flex flex-col pointer-events-none z-30">
      {/* Header */}
      <div className="p-6 flex justify-between items-start pointer-events-auto">
        <button 
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full text-white/80 hover:text-white transition-all group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-semibold tracking-widest uppercase">Exit</span>
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => setShowFaceChart(!showFaceChart)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all",
              showFaceChart ? "bg-white text-black" : "bg-black/40 backdrop-blur-xl border border-white/10 text-white"
            )}
          >
            <MapIcon className="w-4 h-4" />
            Face Chart
          </button>
          <button
            onClick={onSaveLook}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full text-xs font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all"
          >
            <Save className="w-4 h-4" />
            Save Look
          </button>
          <div className="flex flex-col items-end">
            <h2 className="text-2xl font-light tracking-tight text-white drop-shadow-lg">{look.name}</h2>
            <p className="text-white/60 text-xs font-mono tracking-widest uppercase">Step {currentStepIndex + 1} of {look.steps.length}</p>
          </div>
        </div>
      </div>

      {/* Face Chart Preview (Floating) */}
      {showFaceChart && (
        <div className="absolute left-6 top-24 w-80 bg-white/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 pointer-events-auto shadow-2xl animate-in fade-in slide-in-from-left-4">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-black/40">Makeup Map</h4>
            <MapIcon className="w-4 h-4 text-black/20" />
          </div>
          <FaceChart 
            steps={look.steps} 
            showAll={true} 
            className="w-full border-none bg-transparent"
          />
          <p className="mt-6 text-[10px] text-black/40 font-medium uppercase tracking-widest text-center leading-relaxed">
            Reference guide for <br/> <span className="text-black">{look.name}</span>
          </p>
        </div>
      )}

      {/* Customization Panel (Floating) */}
      {isCustomizing && (
        <div className="absolute right-6 top-24 w-72 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 pointer-events-auto shadow-2xl animate-in fade-in slide-in-from-right-4">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-white/60">Customize</h4>
            <Palette className="w-4 h-4 text-white/40" />
          </div>

          <div className="space-y-6">
            {/* Color Picker (Simple hex input for now) */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Color</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={currentStep.color}
                  onChange={(e) => onUpdateStep(currentStep.id, { color: e.target.value })}
                  className="w-8 h-8 rounded-full bg-transparent border-none cursor-pointer"
                />
                <span className="text-xs font-mono text-white/60 uppercase">{currentStep.color}</span>
              </div>
            </div>

            {/* Opacity Slider */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Intensity</label>
                <span className="text-[10px] font-mono text-white/60">{Math.round(currentStep.opacity * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01"
                value={currentStep.opacity}
                onChange={(e) => onUpdateStep(currentStep.id, { opacity: parseFloat(e.target.value) })}
                className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1" />

      {/* Bottom Controls */}
      <div className="p-6 pointer-events-auto">
        <div className="max-w-xl mx-auto bg-black/60 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          {/* Progress Bar */}
          <div className="h-1 w-full bg-white/10">
            <div 
              className="h-full bg-white transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="p-8">
            <div className="flex items-start justify-between gap-6 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: currentStep.color }}
                  />
                  <span className="text-white/40 text-[10px] font-mono tracking-widest uppercase">
                    {currentStep.productType}
                  </span>
                </div>
                <h3 className="text-xl font-medium text-white mb-2">{currentStep.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{currentStep.description}</p>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => onToggleAll(!showAll)}
                  className={cn(
                    "p-3 rounded-2xl border transition-all",
                    showAll 
                      ? "bg-white border-white text-black" 
                      : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                  )}
                  title={showAll ? "Show Current Step" : "Show Full Look"}
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsCustomizing(!isCustomizing)}
                  className={cn(
                    "p-3 rounded-2xl border transition-all",
                    isCustomizing 
                      ? "bg-white border-white text-black" 
                      : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                  )}
                  title="Customize Step"
                >
                  <Sliders className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-white/10">
              <button
                onClick={onPrev}
                disabled={currentStepIndex === 0}
                className="flex items-center gap-2 text-white/40 hover:text-white disabled:opacity-0 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-widest">Previous</span>
              </button>

              <div className="flex gap-2">
                {look.steps.map((_, idx) => (
                  <div 
                    key={idx}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all duration-300",
                      idx === currentStepIndex ? "bg-white w-4" : "bg-white/20"
                    )}
                  />
                ))}
              </div>

              <button
                onClick={onNext}
                className="flex items-center gap-2 text-white hover:text-white/80 transition-all"
              >
                <span className="text-xs font-bold uppercase tracking-widest">
                  {currentStepIndex === look.steps.length - 1 ? 'Finish' : 'Next Step'}
                </span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialOverlay;
