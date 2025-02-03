import { Button } from '@/components/ui/button';
import { DrawToolsEnum } from '@/types/enums/DrawToolsEnum';
import { ToolToggleEnum } from '@/types/enums/ToolToggleEnum';

import { Canvas, PencilBrush } from 'fabric';
import { useEffect, useRef, useState } from 'react';

import { EraserBrush } from '@erase2d/fabric';


interface DrawCanvasProps {
  canvasMode: ToolToggleEnum;
  canvasDrawTool: DrawToolsEnum;
  strokeColor?: string;
  strokeWidth?: number;
}

const DrawCanvas: React.FC<DrawCanvasProps> = ({
  canvasMode = ToolToggleEnum.DRAW,
  canvasDrawTool = DrawToolsEnum.BRUSH,
  strokeColor = '#532ee3',
  strokeWidth = 10,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<Canvas | null>(null);

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

  useEffect(() => {
    if (!fabricCanvas) return;

    const updateDrawingMode = () => {
      if (canvasMode === ToolToggleEnum.DRAW) {
        fabricCanvas.set({ isDrawingMode: true });

        switch (canvasDrawTool) {
          case DrawToolsEnum.BRUSH:
            brushDraw();
            break;
          case DrawToolsEnum.POLYGON:
            polygonDraw();
            break;
          case DrawToolsEnum.ERASER:
            eraserBrushDraw();
            break;
          default:
            brushDraw();
            break;
        }
      } else {
        fabricCanvas.set({ isDrawingMode: false });
      }
    };

    updateDrawingMode();
  }, [fabricCanvas, canvasMode, canvasDrawTool, strokeColor, strokeWidth]);

  const brushDraw = () => {
    if (!fabricCanvas) return;
    fabricCanvas.set({ isDrawingMode: true });

    console.log('brush');

    const brush = new PencilBrush(fabricCanvas);
    brush.color = strokeColor;
    brush.width = strokeWidth;
    fabricCanvas.set({ freeDrawingBrush: brush });
  };

  //FIXME:
  const eraserBrushDraw = () => {
    if (!fabricCanvas) return;

    console.log('eraser');

    const eraser = new EraserBrush(fabricCanvas);
    eraser.width = 30;

    fabricCanvas.freeDrawingBrush = eraser;
    fabricCanvas.isDrawingMode = true;
  };

  //FIXME:
  const polygonDraw = () => {
    if (!fabricCanvas) return;

    console.log('polygon');
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
      </div>
    </div>
  );
};

export default DrawCanvas;
