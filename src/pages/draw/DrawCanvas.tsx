import { EraserBrush } from '@erase2d/fabric';
import * as fabric from 'fabric';
import { useCallback, useEffect, useRef, useState } from 'react';

type DrawingMode = 'brush' | 'eraser' | 'rectangle' | 'polygon';

export default function CanvasDrawing() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const [mode, setMode] = useState<DrawingMode>('brush');
  const [canUndo, setCanUndo] = useState(false);
  const polygonRef = useRef<fabric.Polygon | null>(null);
  const pointsRef = useRef<fabric.Circle[]>([]);

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
      updateUndoState();
    });

    // Listen for object modifications
    canvas.on('object:modified', updateUndoState);

    return () => {
      canvas.dispose();
    };
  }, []);

  // Update undo state
  const updateUndoState = useCallback(() => {
    const canvas = fabricRef.current;
    if (canvas) {
      setCanUndo(canvas._objects.length > 0);
    }
  }, []);

  // Handle mode changes
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = mode === 'brush' || mode === 'eraser';

    if (mode === 'brush') {
      const pencilBrush = new fabric.PencilBrush(canvas);
      pencilBrush.width = 5;
      pencilBrush.color = '#000000';
      canvas.freeDrawingBrush = pencilBrush;

      canvas.off('path:created');
      canvas.on('path:created', ({ path }) => {
        path.erasable = true;
        canvas.renderAll();
        updateUndoState();
      });
    } else if (mode === 'eraser') {
      const eraserBrush = new EraserBrush(canvas);
      eraserBrush.width = 30;
      canvas.freeDrawingBrush = eraserBrush;
    }

    // Remove all mode-specific listeners
    canvas.off('mouse:down');
    canvas.off('mouse:move');
    canvas.off('mouse:up');

    // Set up rectangle mode
    if (mode === 'rectangle') {
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
        updateUndoState();
      });
    }

    // Set up polygon mode
    if (mode === 'polygon') {
      canvas.on('mouse:down', options => {
        const pointer = canvas.getPointer(options.e);
        const x = pointer.x;
        const y = pointer.y;

        if (pointsRef.current.length === 0) {
          // First point (reference point)
          const firstPoint = new fabric.Circle({
            left: x,
            top: y,
            radius: 5,
            fill: 'red',
            originX: 'center',
            originY: 'center',
            erasable: true,
          });
          canvas.add(firstPoint);
          pointsRef.current.push(firstPoint);
        } else {
          const lastPoint = pointsRef.current[pointsRef.current.length - 1];
          const distanceToFirst = Math.sqrt(
            Math.pow(x - pointsRef.current[0].left!, 2) +
              Math.pow(y - pointsRef.current[0].top!, 2),
          );

          if (distanceToFirst < 10 && pointsRef.current.length > 2) {
            // Close the polygon
            const points = pointsRef.current.map(point => ({
              x: point.left!,
              y: point.top!,
            }));

            const polygon = new fabric.Polygon(points, {
              fill: 'rgba(0, 255, 0, 0.3)',
              stroke: 'green',
              strokeWidth: 2,
              erasable: true,
            });

            canvas.remove(...pointsRef.current);
            canvas.add(polygon);
            canvas.renderAll();

            // Reset for next polygon
            pointsRef.current = [];
            polygonRef.current = null;
          } else {
            // Add a new point
            const newPoint = new fabric.Circle({
              left: x,
              top: y,
              radius: 3,
              fill: 'blue',
              originX: 'center',
              originY: 'center',
              erasable: true,
            });
            canvas.add(newPoint);
            pointsRef.current.push(newPoint);

            // Update or create the polygon
            if (polygonRef.current) {
              canvas.remove(polygonRef.current);
            }

            const points = pointsRef.current.map(point => ({
              x: point.left!,
              y: point.top!,
            }));

            polygonRef.current = new fabric.Polygon(points, {
              fill: 'transparent',
              stroke: 'blue',
              strokeWidth: 2,
              erasable: true,
            });

            canvas.add(polygonRef.current);
            canvas.renderAll();
          }
        }
        updateUndoState();
      });
    }
  }, [mode, updateUndoState]);

  // Clear canvas handler
  const handleClear = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.clear();
    canvas.backgroundColor = '#ffffff';
    canvas.renderAll();
    updateUndoState();
    pointsRef.current = [];
    polygonRef.current = null;
  }, [updateUndoState]);

  // Undo handler
  const handleUndo = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const objects = canvas._objects;
    if (objects.length > 0) {
      if (mode === 'polygon') {
        // For polygon mode, remove the last point
        if (pointsRef.current.length > 0) {
          const lastPoint = pointsRef.current.pop();
          if (lastPoint) canvas.remove(lastPoint);

          if (polygonRef.current) {
            canvas.remove(polygonRef.current);
            if (pointsRef.current.length > 1) {
              const points = pointsRef.current.map(point => ({
                x: point.left!,
                y: point.top!,
              }));
              polygonRef.current = new fabric.Polygon(points, {
                fill: 'transparent',
                stroke: 'blue',
                strokeWidth: 2,
                erasable: true,
              });
              canvas.add(polygonRef.current);
            } else {
              polygonRef.current = null;
            }
          }
        }
      } else {
        // For other modes, remove the last object
        canvas.remove(objects[objects.length - 1]);
      }
      canvas.renderAll();
      updateUndoState();
    }
  }, [mode, updateUndoState]);

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
          onClick={() => setMode('rectangle')}
          style={{
            backgroundColor: mode === 'rectangle' ? '#007bff' : '#ffffff',
            color: mode === 'rectangle' ? '#ffffff' : '#000000',
          }}
        >
          Rectangle
        </button>
        <button
          onClick={() => setMode('polygon')}
          style={{
            backgroundColor: mode === 'polygon' ? '#007bff' : '#ffffff',
            color: mode === 'polygon' ? '#ffffff' : '#000000',
          }}
        >
          Polygon
        </button>
        <button onClick={handleClear}>Clear Canvas</button>
        <button onClick={handleUndo} disabled={!canUndo}>
          Undo
        </button>
      </div>
      <canvas ref={canvasRef} />
    </div>
  );
}
