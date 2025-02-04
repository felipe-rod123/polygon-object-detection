import { EraserBrush } from '@erase2d/fabric';
import * as fabric from 'fabric';
import { useCallback, useEffect, useRef, useState } from 'react';

import { DrawTool, DrawToolsEnum } from '@/types/enums/DrawToolsEnum';
import { ToolToggle, ToolToggleEnum } from '@/types/enums/ToolToggleEnum';
import { Undo2 } from 'lucide-react';
import { Button } from '../../components/ui/button';

interface CanvasDrawingProps {
  canvasMode: ToolToggleEnum;
  canvasDrawTool: DrawToolsEnum;
  setCanvasToggle: React.Dispatch<React.SetStateAction<ToolToggleEnum>>;
  strokeColor: string;
  strokeWidth: number;
}

const CanvasDrawing: React.FC<CanvasDrawingProps> = ({
  canvasMode,
  canvasDrawTool,
  setCanvasToggle,
  strokeColor,
  strokeWidth,
}: CanvasDrawingProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  const [canUndo, setCanUndo] = useState(false);
  const polygonRef = useRef<fabric.Polygon | null>(null);
  const pointsRef = useRef<fabric.Circle[]>([]);

  const mode = new ToolToggle(canvasMode);
  const drawTool = new DrawTool(canvasDrawTool);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      backgroundColor: 'transparent', // dark mode compatible
    });

    fabricRef.current = canvas;

    const updateCanvasSize = () => {
      if (!containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      canvas.setDimensions({ width, height });
      canvas.renderAll();
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // make sure all drawn paths are erasable
    canvas.on('path:created', ({ path }) => {
      path.erasable = true;
      canvas.renderAll();
      updateUndoState();
    });

    // listen for object modifications
    canvas.on('object:modified', updateUndoState);

    // cleanup
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      canvas.dispose();
    };
  }, []);

  const updateUndoState = useCallback(() => {
    const canvas = fabricRef.current;
    if (canvas) {
      setCanUndo(canvas._objects.length > 0);
    }
  }, []);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = mode.isDraw;

    if (drawTool.isBrush) {
      const pencilBrush = new fabric.PencilBrush(canvas);
      pencilBrush.width = strokeWidth;
      pencilBrush.color = strokeColor;
      canvas.freeDrawingBrush = pencilBrush;

      canvas.off('path:created');
      canvas.on('path:created', ({ path }) => {
        path.erasable = true;
        canvas.renderAll();
        updateUndoState();
      });
    } else if (drawTool.isEraser) {
      const eraserBrush = new EraserBrush(canvas);
      eraserBrush.width = strokeWidth;
      canvas.freeDrawingBrush = eraserBrush;
    }

    // Remove all mode-specific listeners
    canvas.off('mouse:down');
    canvas.off('mouse:move');
    canvas.off('mouse:up');

    if (drawTool.isRectangle) {
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
          stroke: strokeColor,
          strokeWidth: strokeWidth,
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

    if (drawTool.isPolygon) {
      canvas.on('mouse:down', options => {
        const pointer = canvas.getPointer(options.e);
        const x = pointer.x;
        const y = pointer.y;

        if (pointsRef.current.length === 0) {
          // reference starting point
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
          // const lastPoint = pointsRef.current[pointsRef.current.length - 1];
          const distanceToFirst = Math.sqrt(
            Math.pow(x - pointsRef.current[0].left!, 2) +
              Math.pow(y - pointsRef.current[0].top!, 2),
          );

          if (distanceToFirst < 10 && pointsRef.current.length > 2) {
            // close the polygon
            const points = pointsRef.current.map(point => ({
              x: point.left!,
              y: point.top!,
            }));

            const polygon = new fabric.Polygon(points, {
              fill: strokeColor,
              stroke: strokeColor,
              strokeWidth: 2,
              erasable: true,
              opacity: 0.3,
            });

            canvas.remove(...pointsRef.current);
            if (polygonRef.current) canvas.remove(polygonRef.current); // Remove the polygon editing line
            canvas.add(polygon);
            canvas.renderAll();

            // Reset for next polygon
            // TODO: change to select toggle mode here!
            setCanvasToggle(ToolToggleEnum.SELECT);
            pointsRef.current = [];
            polygonRef.current = null;
          } else {
            // add new point
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

  const handleClear = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.clear();
    canvas.backgroundColor = 'transparent';
    canvas.renderAll();
    updateUndoState();
    pointsRef.current = [];
    polygonRef.current = null;
  }, [updateUndoState]);

  const handleUndo = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const objects = canvas._objects;
    if (objects.length > 0) {
      if (drawTool.isPolygon) {
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
    <div
      ref={containerRef}
      className="relative w-full h-screen p-4 bg-zinc-200 dark:bg-zinc-800 rounded-lg shadow-lg overflow-hidden"
    >
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
      <div className="absolute top-4 left-4 flex gap-2">
        <Button onClick={handleClear}>Clear canvas</Button>
        <Button onClick={handleUndo} disabled={!canUndo}>
          <Undo2 className="h-4 w-4" />
          Undo
        </Button>
      </div>
    </div>
  );
};

export default CanvasDrawing;
