import React from 'react';
import { MakeupStep } from '../types';
import { cn } from '../lib/utils';

interface FaceChartProps {
  steps: MakeupStep[];
  currentStepIndex?: number;
  showAll?: boolean;
  className?: string;
}

// Canonical coordinates for the face chart (0-100 scale)
// These are manually mapped to fit the static illustration
const CHART_COORDS: Record<number, { x: number; y: number }> = {
  // Lips (Simplified mapping)
  61: { x: 40, y: 65 }, 146: { x: 42, y: 67 }, 91: { x: 45, y: 68 }, 181: { x: 48, y: 69 }, 84: { x: 50, y: 69 }, 
  17: { x: 52, y: 69 }, 314: { x: 55, y: 68 }, 405: { x: 58, y: 67 }, 321: { x: 60, y: 65 }, 375: { x: 58, y: 63 }, 
  291: { x: 55, y: 62 }, 308: { x: 50, y: 61 }, 324: { x: 45, y: 62 }, 318: { x: 42, y: 63 }, 0: { x: 50, y: 64 },
  
  // Left Eye (Open) - centered around x=35, y=40
  33: { x: 28, y: 40 }, 133: { x: 42, y: 40 }, 159: { x: 35, y: 35 }, 145: { x: 35, y: 45 },
  
  // Right Eye (Closed) - centered around x=65, y=40
  362: { x: 58, y: 40 }, 263: { x: 72, y: 40 }, 386: { x: 65, y: 41 }, 374: { x: 65, y: 41 }, // Flat for closed
  
  // Brows
  70: { x: 25, y: 30 }, 107: { x: 45, y: 30 }, // Left
  300: { x: 55, y: 30 }, 336: { x: 75, y: 30 }, // Right
  
  // Cheeks
  123: { x: 30, y: 55 }, // Left
  352: { x: 70, y: 55 }, // Right
  
  // Nose
  168: { x: 50, y: 35 }, 6: { x: 50, y: 45 }, 197: { x: 50, y: 50 }, 5: { x: 50, y: 55 },
  
  // Face Oval (Simplified)
  10: { x: 50, y: 15 }, 152: { x: 50, y: 85 }, 234: { x: 20, y: 45 }, 454: { x: 80, y: 45 }
};

// Helper to get a point for a landmark, fallback to center if not mapped
const getPoint = (idx: number) => {
  return CHART_COORDS[idx] || { x: 50, y: 50 };
};

const FaceChart: React.FC<FaceChartProps> = ({ steps, currentStepIndex, showAll, className }) => {
  const drawStep = (step: MakeupStep) => {
    const points = step.landmarks
      .filter(idx => CHART_COORDS[idx]) // Only draw points we have mapped
      .map(idx => CHART_COORDS[idx]);

    if (points.length < 2) return null;

    if (step.style === 'dots') {
      return points.map((p, i) => (
        <circle 
          key={i} 
          cx={p.x} cy={p.y} r="1" 
          fill={step.color} 
          fillOpacity={step.opacity} 
        />
      ));
    }

    // Create a path string
    const d = points.reduce((acc, p, i) => {
      return acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`);
    }, '') + (step.style === 'fill' ? ' Z' : '');

    return (
      <path
        key={step.id}
        d={d}
        fill={step.style === 'fill' ? step.color : 'none'}
        stroke={step.style === 'outline' ? step.color : 'none'}
        fillOpacity={step.opacity}
        strokeOpacity={step.opacity}
        strokeWidth="1"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    );
  };

  return (
    <div className={cn("relative aspect-square bg-white rounded-3xl overflow-hidden border border-black/5", className)}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Base Face Illustration (Simplified SVG) */}
        <g fill="none" stroke="black" strokeWidth="0.5" strokeLinecap="round" opacity="0.2">
          {/* Face Shape */}
          <path d="M50,15 C25,15 15,35 15,55 C15,75 35,85 50,85 C65,85 85,75 85,55 C85,35 75,15 50,15" />
          
          {/* Hair Outline */}
          <path d="M20,30 C10,10 40,5 50,15 C60,5 90,10 80,30 C85,50 85,70 80,80 M20,30 C15,50 15,70 20,80" />
          
          {/* Shoulders */}
          <path d="M15,80 C10,90 5,95 0,100 M85,80 C90,90 95,95 100,100" />

          {/* Left Eye (Open) */}
          <path d="M28,40 C30,35 40,35 42,40 C40,45 30,45 28,40" />
          <circle cx="35" cy="40" r="2" />
          
          {/* Right Eye (Closed) */}
          <path d="M58,40 C60,41 70,41 72,40" />
          <path d="M60,42 L62,44 M65,42 L65,45 M68,42 L70,44" strokeWidth="0.3" />

          {/* Nose */}
          <path d="M48,55 C49,57 51,57 52,55" />
          <path d="M50,35 L50,50" opacity="0.5" />

          {/* Lips */}
          <path d="M40,65 C45,62 55,62 60,65 C55,69 45,69 40,65" />
          <path d="M40,65 C45,66 55,66 60,65" opacity="0.5" />

          {/* Brows */}
          <path d="M25,32 C30,28 40,28 45,32" strokeWidth="1" />
          <path d="M55,32 C60,28 70,28 75,32" strokeWidth="1" />
        </g>

        {/* Makeup Overlays */}
        <g>
          {showAll 
            ? steps.map(step => drawStep(step))
            : currentStepIndex !== undefined && drawStep(steps[currentStepIndex])
          }
        </g>
      </svg>
    </div>
  );
};

export default FaceChart;
