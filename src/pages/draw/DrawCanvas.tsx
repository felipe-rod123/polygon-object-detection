import { EraserBrush } from '@erase2d/fabric';
import * as fabric from 'fabric';
import { useCallback, useEffect, useRef, useState } from 'react';

type DrawingMode = 'brush' | 'eraser' | 'polygon';

export default function CanvasDrawing() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const [mode, setMode] = useState<DrawingMode>('brush');

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
    });

    fabricRef.current = canvas;

    // Make sure all drawn paths are erasable
    canvas.on('path:created', ({ path }) => {
      path.erasable = true;
      canvas.renderAll();
    });

    // Initialize brushes
    const pencilBrush = new fabric.PencilBrush(canvas);
    pencilBrush.width = 5;
    pencilBrush.color = '#000000';

    const eraserBrush = new EraserBrush(canvas);
    eraserBrush.width = 20;

    return () => {
      canvas.dispose();
    };
  }, []);

  // Handle mode changes
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = mode !== 'polygon';

    if (mode === 'brush') {
      const pencilBrush = new fabric.PencilBrush(canvas);
      pencilBrush.width = 5;
      pencilBrush.color = '#000000';
      canvas.freeDrawingBrush = pencilBrush;

      // Ensure any new paths created are erasable
      canvas.off('path:created');
      canvas.on('path:created', ({ path }) => {
        path.erasable = true;
        canvas.renderAll();
      });
    } else if (mode === 'eraser') {
      const eraserBrush = new EraserBrush(canvas);
      eraserBrush.width = 30; // increased from 20 to 30 for better visibility
      canvas.freeDrawingBrush = eraserBrush;
    }

    // Remove polygon mode listeners when switching to other modes
    canvas.off('mouse:down');
    canvas.off('mouse:move');
    canvas.off('mouse:up');

    // Set up polygon (rectangle) mode
    if (mode === 'polygon') {
      let isDrawing = false;
      let startX = 0;
      let startY = 0;
      let rect: fabric.Rect | null = null;

      canvas.on('mouse:down', options => {
        isDrawing = true;
        const pointer = canvas.getPointer(options.e);
        startX = pointer.x;
        startY = pointer.y;

        rect = new fabric.Rect({
          left: startX,
          top: startY,
          width: 0,
          height: 0,
          fill: 'transparent',
          stroke: '#000000',
          strokeWidth: 2,
          erasable: true,
        });

        canvas.add(rect);
      });

      canvas.on('mouse:move', options => {
        if (!isDrawing || !rect) return;

        const pointer = canvas.getPointer(options.e);
        const width = pointer.x - startX;
        const height = pointer.y - startY;

        rect.set({
          width: Math.abs(width),
          height: Math.abs(height),
          left: width > 0 ? startX : pointer.x,
          top: height > 0 ? startY : pointer.y,
        });

        canvas.renderAll();
      });

      canvas.on('mouse:up', () => {
        isDrawing = false;
        rect = null;
      });
    }
  }, [mode]);

  // Clear canvas handler
  const handleClear = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.clear();
    canvas.backgroundColor = '#ffffff';
    canvas.renderAll();
  }, []);

  return (
    <div className="canvas-container">
      <div className="toolbar" style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => setMode('brush')}
          style={{
            backgroundColor: mode === 'brush' ? '#007bff' : '#ffffff',
            color: mode === 'brush' ? '#ffffff' : '#000000',
          }}
        >
          Brush
        </button>
        <button
          onClick={() => setMode('eraser')}
          style={{
            backgroundColor: mode === 'eraser' ? '#007bff' : '#ffffff',
            color: mode === 'eraser' ? '#ffffff' : '#000000',
          }}
        >
          Eraser
        </button>
        <button
          onClick={() => setMode('polygon')}
          style={{
            backgroundColor: mode === 'polygon' ? '#007bff' : '#ffffff',
            color: mode === 'polygon' ? '#ffffff' : '#000000',
          }}
        >
          Rectangle
        </button>
        <button onClick={handleClear}>Clear Canvas</button>
      </div>
      <canvas ref={canvasRef} />
    </div>
  );
}
