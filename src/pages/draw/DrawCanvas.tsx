import { Button } from '@/components/ui/button';
import { Canvas, Rect } from 'fabric';
import { useEffect, useRef, useState } from 'react';

const CanvasComponent = () => {
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

      canvas.setDimensions({
        width,
        height,
      });

      canvas.renderAll();
    };

    // set initial size
    updateCanvasSize();

    // Resize listener
    const handleResize = () => {
      updateCanvasSize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
    };
  }, []);

  const addRectangle = () => {
    if (!fabricCanvas) return;

    const rect = new Rect({
      left: 50,
      top: 50,
      fill: '#3b82f6',
      width: 100,
      height: 100,
    });

    fabricCanvas.add(rect);
    fabricCanvas.renderAll();
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen p-4 bg-zinc-200 dark:bg-zinc-800 rounded-lg shadow-lg overflow-hidden"
    >
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
      <div className="absolute bottom-4 left-4">
        <Button onClick={addRectangle}>Add Rectangle</Button>
      </div>
    </div>
  );
};

export default CanvasComponent;
