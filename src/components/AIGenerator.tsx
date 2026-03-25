import React, { useState, useRef } from 'react';
import { generateLookFromTrend, generateLookFromImage } from '../services/geminiService';
import { MakeupLook } from '../types';
import { Sparkles, Search, Image as ImageIcon, Loader2, X, Wand2, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface AIGeneratorProps {
  onLookGenerated: (look: MakeupLook) => void;
  onClose: () => void;
}

const AIGenerator: React.FC<AIGeneratorProps> = ({ onLookGenerated, onClose }) => {
  const [mode, setMode] = useState<'trend' | 'image'>('trend');
  const [trend, setTrend] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      let look: MakeupLook;
      if (mode === 'trend') {
        if (!trend) throw new Error("Please enter a trend name.");
        look = await generateLookFromTrend(trend);
      } else {
        if (!image) throw new Error("Please upload a reference image.");
        look = await generateLookFromImage(image, description);
      }
      
      // Add a custom flag and unique ID
      look.isCustom = true;
      look.id = `ai_${Date.now()}`;
      look.thumbnail = image || `https://picsum.photos/seed/${trend || 'ai'}/400/300`;
      
      onLookGenerated(look);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong during generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/5 rounded-xl">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-medium">AI Look Generator</h2>
              <p className="text-xs text-white/40 font-mono tracking-widest uppercase">Powered by Gemini AI</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X className="w-5 h-5 text-white/40" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5">
          <button 
            onClick={() => setMode('trend')}
            className={cn(
              "flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all relative",
              mode === 'trend' ? "text-white" : "text-white/20 hover:text-white/40"
            )}
          >
            Trend Lookup
            {mode === 'trend' && <motion.div layoutId="ai-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
          </button>
          <button 
            onClick={() => setMode('image')}
            className={cn(
              "flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all relative",
              mode === 'image' ? "text-white" : "text-white/20 hover:text-white/40"
            )}
          >
            Copy from Image
            {mode === 'image' && <motion.div layoutId="ai-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {mode === 'trend' ? (
            <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Enter a trend name</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                <input 
                  type="text"
                  value={trend}
                  onChange={(e) => setTrend(e.target.value)}
                  placeholder="e.g. Clean Girl Look, Mob Wife Aesthetic..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-all"
                />
              </div>
              <p className="text-xs text-white/30 italic">AI will search for the latest trends and create a step-by-step guide for you.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Reference Image</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "aspect-square rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all overflow-hidden relative group",
                      image && "border-solid border-white/20"
                    )}
                  >
                    {image ? (
                      <>
                        <img src={image} className="w-full h-full object-cover" alt="Reference" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Upload className="w-6 h-6 text-white" />
                        </div>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-white/20 mb-2" />
                        <span className="text-xs text-white/40">Upload Photo</span>
                      </>
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">What to copy?</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. I love the sharp eyeliner and the soft pink blush..."
                    className="w-full h-[calc(100%-2rem)] bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-all resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-4 bg-white text-black rounded-2xl font-bold uppercase tracking-widest hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Look...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Create Makeup Map
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AIGenerator;
