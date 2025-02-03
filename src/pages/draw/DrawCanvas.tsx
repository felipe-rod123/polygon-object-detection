'use client';

import { Button } from '@/components/ui/button';
import { ToolToggle, ToolToggleEnum } from '@/types/enums/ToolToggleEnum';
import { Canvas, PencilBrush, Rect } from 'fabric';
import { useEffect, useRef, useState } from 'react';

interface DrawCanvasProps {
  canvasMode: ToolToggleEnum;
  strokeColor?: string;
  strokeWidth?: number;
}

const DrawCanvas: React.FC<DrawCanvasProps> = ({
  canvasMode = ToolToggleEnum.SELECT,
  strokeColor = '#532ee3',
  strokeWidth = 10,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<Canvas | null>(null);

  const mode = new ToolToggle(canvasMode);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      backgroundColor: 'transparent', // dark mode compatible
      selection: true,
    });

    setFabricCanvas(canvas);

    const updateCanvasSize = () => {
      if (!containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      canvas.setDimensions({ width, height });
      canvas.renderAll();
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      canvas.dispose();
    };
  }, []);

  // Enable/disable free drawing
  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.set({ isDrawingMode: mode.isDraw });

    if (mode.isDraw) {
      const brush = new PencilBrush(fabricCanvas);
      brush.color = strokeColor;
      brush.width = strokeWidth;
      fabricCanvas.set({ freeDrawingBrush: brush });
    }
  }, [fabricCanvas, mode, strokeColor, strokeWidth]);

  const addRectangle = () => {
    if (!fabricCanvas) return;

    const rect = new Rect({
      left: 50,
      top: 50,
      fill: strokeColor,
      width: 100,
      height: 100,
    });

    fabricCanvas.add(rect);
    fabricCanvas.renderAll();
  };

  const clearCanvas = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen p-4 bg-zinc-200 dark:bg-zinc-800 rounded-lg shadow-lg overflow-hidden"
    >
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
      <div className="absolute top-4 left-4 flex gap-2">
        <Button onClick={clearCanvas}>Clear canvas</Button>
        <Button onClick={addRectangle}>Add Rectangle</Button>
      </div>
    </div>
  );
};

export default DrawCanvas;
