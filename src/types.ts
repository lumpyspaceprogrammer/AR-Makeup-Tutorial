export interface MakeupStep {
  id: string;
  title: string;
  description: string;
  productType: 'foundation' | 'concealer' | 'blush' | 'contour' | 'highlight' | 'eyeshadow' | 'eyeliner' | 'lipstick' | 'brows';
  color: string;
  opacity: number;
  // Indices of MediaPipe Face Mesh landmarks to highlight
  landmarks: number[];
  // Optional: specific drawing style for this step (e.g., 'fill', 'outline', 'gradient')
  style: 'fill' | 'outline' | 'dots';
}

export interface MakeupLook {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  steps: MakeupStep[];
  isCustom?: boolean;
}
