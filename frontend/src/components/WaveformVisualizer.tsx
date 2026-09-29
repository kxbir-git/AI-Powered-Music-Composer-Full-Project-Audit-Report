import React, { useEffect, useRef } from 'react';

interface WaveformProps {
  isPlaying: boolean;
  audioRef: React.RefObject<HTMLAudioElement>;
}

export const WaveformVisualizer: React.FC<WaveformProps> = ({ isPlaying, audioRef }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const bars = 48;
      const barWidth = width / bars;

      for (let i = 0; i < bars; i++) {
        let barHeight = 6;
        if (isPlaying) {
          barHeight = Math.sin(phase + i * 0.2) * 20 + Math.cos(phase * 1.5 + i * 0.1) * 15 + 25;
        } else {
          barHeight = Math.abs(Math.sin(i * 0.3)) * 12 + 4;
        }

        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, '#8B5CF6');
        gradient.addColorStop(0.5, '#EC4899');
        gradient.addColorStop(1, '#06B6D4');

        ctx.fillStyle = gradient;
        ctx.fillRect(i * barWidth + 2, (height - barHeight) / 2, barWidth - 4, barHeight);
      }

      phase += 0.08;
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, [isPlaying]);

  return (
    <div className="w-full h-16 bg-dark-900/60 rounded-xl border border-white/10 p-2 flex items-center justify-center">
      <canvas ref={canvasRef} width={400} height={48} className="w-full h-full" />
    </div>
  );
};
