import React, { useState, useEffect, useRef } from 'react';
import { MAKEUP_LOOKS } from './data/looks';
import { MakeupLook, MakeupStep } from './types';
import ARCanvas from './components/ARCanvas';
import TutorialOverlay from './components/TutorialOverlay';
import AIGenerator from './components/AIGenerator';
import FaceChart from './components/FaceChart';
import { Sparkles, Camera, ArrowRight, Info, Heart, Upload, X, Trash2, Wand2, Map as MapIcon } from 'lucide-react';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [selectedLook, setSelectedLook] = useState<MakeupLook | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showAllSteps, setShowAllSteps] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [savedLooks, setSavedLooks] = useState<MakeupLook[]>([]);
  const [activeTab, setActiveTab] = useState<'presets' | 'saved'>('presets');
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved looks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('glowguide_saved_looks');
    if (saved) {
      try {
        setSavedLooks(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved looks", e);
      }
    }
  }, []);

  const handleSelectLook = (look: MakeupLook) => {
    // Clone the look to avoid modifying the original preset
    setSelectedLook(JSON.parse(JSON.stringify(look)));
    setCurrentStepIndex(0);
    setShowAllSteps(false);
    setIsCustomizing(false);
  };

  const handleNextStep = () => {
    if (selectedLook && currentStepIndex < selectedLook.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      setSelectedLook(null);
      setSourceImage(null);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleUpdateStep = (stepId: string, updates: Partial<MakeupStep>) => {
    if (!selectedLook) return;
    const newSteps = selectedLook.steps.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    );
    setSelectedLook({ ...selectedLook, steps: newSteps });
  };

  const handleSaveLook = () => {
    if (!selectedLook) return;
    
    const lookToSave = {
      ...selectedLook,
      id: selectedLook.isCustom ? selectedLook.id : `${selectedLook.id}_custom_${Date.now()}`,
      name: selectedLook.isCustom ? selectedLook.name : `${selectedLook.name} (Custom)`,
      isCustom: true
    };

    const newSaved = [lookToSave, ...savedLooks.filter(l => l.id !== lookToSave.id)];
    setSavedLooks(newSaved);
    localStorage.setItem('glowguide_saved_looks', JSON.stringify(newSaved));
    alert("Look saved to your collection!");
  };

  const handleDeleteSavedLook = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newSaved = savedLooks.filter(l => l.id !== id);
    setSavedLooks(newSaved);
    localStorage.setItem('glowguide_saved_looks', JSON.stringify(newSaved));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSourceImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const displayedLooks = activeTab === 'presets' ? MAKEUP_LOOKS : savedLooks;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-white selection:text-black">
      <AnimatePresence mode="wait">
        {!selectedLook ? (
          <motion.main 
            key="selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-7xl mx-auto px-6 py-20"
          >
            {/* Hero Section */}
            <header className="mb-24 text-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full mb-8"
              >
                <Sparkles className="w-4 h-4 text-white/60" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">Next-Gen AR Beauty</span>
              </motion.div>
              
              <h1 className="text-7xl md:text-9xl font-light tracking-tighter mb-8 leading-[0.85]">
                GLOW<br />
                <span className="italic font-serif">GUIDE</span>
              </h1>
              
              <div className="flex flex-col items-center gap-8">
                <p className="max-w-xl mx-auto text-white/40 text-lg font-light leading-relaxed">
                  Experience professional makeup tutorials in real-time. Our AR technology maps precise guides directly onto your face.
                </p>

                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setShowAIGenerator(true)}
                    className="flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full text-sm font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-xl shadow-white/5"
                  >
                    <Wand2 className="w-5 h-5" />
                    Generate with AI
                  </button>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-6 py-4 bg-white/5 border border-white/10 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
                  >
                    <Upload className="w-4 h-4" />
                    Try On Photo
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    className="hidden" 
                    accept="image/*"
                  />
                </div>
              </div>
            </header>

            {/* Tabs */}
            <div className="flex items-center justify-center gap-8 mb-12 border-b border-white/5">
              <button 
                onClick={() => setActiveTab('presets')}
                className={cn(
                  "pb-4 text-xs font-bold uppercase tracking-[0.2em] transition-all relative",
                  activeTab === 'presets' ? "text-white" : "text-white/20 hover:text-white/40"
                )}
              >
                Preset Looks
                {activeTab === 'presets' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
              </button>
              <button 
                onClick={() => setActiveTab('saved')}
                className={cn(
                  "pb-4 text-xs font-bold uppercase tracking-[0.2em] transition-all relative flex items-center gap-2",
                  activeTab === 'saved' ? "text-white" : "text-white/20 hover:text-white/40"
                )}
              >
                <Heart className={cn("w-3 h-3", activeTab === 'saved' && "fill-white")} />
                Saved Collection
                {activeTab === 'saved' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
              </button>
            </div>

            {/* Look Grid */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {displayedLooks.length > 0 ? (
                displayedLooks.map((look, idx) => (
                  <motion.div
                    key={look.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    onClick={() => handleSelectLook(look)}
                    className="group relative cursor-pointer"
                  >
                    <div className="aspect-[3/4] overflow-hidden rounded-3xl bg-zinc-900 border border-white/5 transition-all duration-500 group-hover:border-white/20 group-hover:scale-[1.02]">
                      <img 
                        src={look.thumbnail} 
                        alt={look.name}
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-30 transition-all duration-700"
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Face Chart Preview Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center p-12 opacity-0 group-hover:opacity-100 transition-all duration-700 scale-90 group-hover:scale-100">
                        <FaceChart 
                          steps={look.steps} 
                          showAll={true} 
                          className="w-full h-full bg-transparent border-none"
                        />
                      </div>
                      
                      {/* Overlay Info */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-8 flex flex-col justify-end">
                        <div className="flex items-center justify-between mb-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono tracking-widest uppercase text-white/60">{look.steps.length} Steps</span>
                            <div className="w-1 h-1 rounded-full bg-white/20" />
                            <span className="text-[10px] font-mono tracking-widest uppercase text-white/60">AR Enabled</span>
                          </div>
                          {activeTab === 'saved' && (
                            <button 
                              onClick={(e) => handleDeleteSavedLook(e, look.id)}
                              className="p-2 bg-white/10 hover:bg-red-500/20 text-white/40 hover:text-red-400 rounded-full transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <h3 className="text-3xl font-light tracking-tight mb-2">{look.name}</h3>
                        <p className="text-white/40 text-sm line-clamp-2 mb-6 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-75 translate-y-4 group-hover:translate-y-0">
                          {look.description}
                        </p>
                        
                        <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-widest group-hover:gap-4 transition-all duration-500">
                          Start Tutorial <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-3xl">
                  <Heart className="w-12 h-12 text-white/5 mx-auto mb-4" />
                  <p className="text-white/20 font-light italic">Your saved collection is empty.</p>
                </div>
              )}
            </section>

            {/* Footer Info */}
            <footer className="mt-32 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-white/20">
              <div className="flex items-center gap-8">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest mb-1">Technology</span>
                  <span className="text-xs">MediaPipe Face Mesh</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest mb-1">Precision</span>
                  <span className="text-xs">468 Landmarks</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Info className="w-4 h-4" />
                <p className="text-xs max-w-xs leading-relaxed italic">
                  For the best experience, ensure you are in a well-lit environment and your face is clearly visible to the camera.
                </p>
              </div>
            </footer>
          </motion.main>
        ) : (
          <motion.div 
            key="tutorial"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50"
          >
            <ARCanvas 
              currentStep={selectedLook.steps[currentStepIndex]} 
              showAllSteps={showAllSteps}
              allSteps={selectedLook.steps}
              sourceImage={sourceImage}
            />
            
            <TutorialOverlay 
              look={selectedLook}
              currentStepIndex={currentStepIndex}
              onNext={handleNextStep}
              onPrev={handlePrevStep}
              onClose={() => {
                setSelectedLook(null);
                setSourceImage(null);
              }}
              onToggleAll={setShowAllSteps}
              showAll={showAllSteps}
              onUpdateStep={handleUpdateStep}
              onSaveLook={handleSaveLook}
              isCustomizing={isCustomizing}
              setIsCustomizing={setIsCustomizing}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAIGenerator && (
          <AIGenerator 
            onLookGenerated={(look) => {
              handleSelectLook(look);
              setShowAIGenerator(false);
            }}
            onClose={() => setShowAIGenerator(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
