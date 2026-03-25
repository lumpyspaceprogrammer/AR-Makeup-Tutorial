import React, { useEffect, useRef, useState } from 'react';
import { FaceMesh, Results } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';
import { MakeupStep } from '../types';

interface ARCanvasProps {
  currentStep: MakeupStep | null;
  showAllSteps?: boolean;
  allSteps?: MakeupStep[];
  sourceImage?: string | null; // Added for photo upload support
}

const ARCanvas: React.FC<ARCanvasProps> = ({ currentStep, showAllSteps, allSteps, sourceImage }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const faceMeshRef = useRef<FaceMesh | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const faceMesh = new FaceMesh({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
      },
    });
    faceMeshRef.current = faceMesh;

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    const onResults = (results: Results) => {
      const canvasCtx = canvasRef.current?.getContext('2d');
      if (!canvasCtx || !canvasRef.current) return;

      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      // Draw the video/image frame
      canvasCtx.drawImage(
        results.image,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );

      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];

        const drawStep = (step: MakeupStep) => {
          canvasCtx.beginPath();
          canvasCtx.fillStyle = step.color;
          canvasCtx.strokeStyle = step.color;
          canvasCtx.globalAlpha = step.opacity;
          canvasCtx.lineWidth = 2;

          const points = step.landmarks.map(idx => landmarks[idx]);
          
          if (points.length > 0) {
            if (step.style === 'fill' || step.style === 'outline') {
              canvasCtx.moveTo(
                points[0].x * canvasRef.current!.width,
                points[0].y * canvasRef.current!.height
              );
              for (let i = 1; i < points.length; i++) {
                canvasCtx.lineTo(
                  points[i].x * canvasRef.current!.width,
                  points[i].y * canvasRef.current!.height
                );
              }
              if (step.style === 'fill') {
                canvasCtx.fill();
              } else {
                canvasCtx.stroke();
              }
            } else if (step.style === 'dots') {
              points.forEach(p => {
                canvasCtx.beginPath();
                canvasCtx.arc(
                  p.x * canvasRef.current!.width,
                  p.y * canvasRef.current!.height,
                  2, 0, 2 * Math.PI
                );
                canvasCtx.fill();
              });
            }
          }
        };

        if (showAllSteps && allSteps) {
          allSteps.forEach(step => drawStep(step));
        } else if (currentStep) {
          drawStep(currentStep);
        }
      }
      canvasCtx.restore();
    };

    faceMesh.onResults(onResults);

    let camera: Camera | null = null;

    if (sourceImage) {
      // Process static image
      const img = new Image();
      img.src = sourceImage;
      img.onload = async () => {
        setIsLoading(false);
        if (faceMeshRef.current) {
          await faceMeshRef.current.send({ image: img });
        }
      };
    } else if (videoRef.current) {
      // Process camera feed
      camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current && faceMeshRef.current) {
            await faceMeshRef.current.send({ image: videoRef.current });
          }
        },
        width: 1280,
        height: 720,
      });

      camera.start()
        .then(() => setIsLoading(false))
        .catch((err) => {
          console.error("Camera error:", err);
          setError("Could not access camera. Please ensure permissions are granted.");
          setIsLoading(false);
        });
    }

    return () => {
      if (camera) camera.stop();
      faceMesh.close();
    };
  }, [currentStep, showAllSteps, allSteps, sourceImage]);

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden rounded-2xl shadow-2xl border border-white/10">
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-20">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4" />
          <p className="text-white/60 font-medium animate-pulse">Initializing AR Experience...</p>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-20 p-8 text-center">
          <p className="text-red-400 font-medium mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-white text-black rounded-full font-semibold hover:bg-zinc-200 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      <video
        ref={videoRef}
        className="hidden"
        playsInline
      />
      <canvas
        ref={canvasRef}
        width={1280}
        height={720}
        className="w-full h-full object-cover"
      />
      
      {/* Ghostly Overlay Effect */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-transparent z-10" />
    </div>
  );
};

export default ARCanvas;
