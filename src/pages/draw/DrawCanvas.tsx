import TooltipToggleButton from '@/components/tooltip-toggle-button';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import ZoomControl from '@/components/zoom-control';
import { DrawTool, type DrawToolsEnum } from '@/types/enums/DrawToolsEnum';
import { ToolToggle, type ToolToggleEnum } from '@/types/enums/ToolToggleEnum';
import { handleClear } from '@/utils/clearCanvasHandler';
import {
  copyObject,
  cutObject,
  deleteObject,
  duplicateObject,
  pasteObject,
} from '@/utils/keyboardShortcutHandlers';
import { setupPolygonDrawing } from '@/utils/polygonBuilder';
import { setupRectangleDrawing } from '@/utils/rectangleBuilder';
import { handleUndo, updateUndoState } from '@/utils/undoActionHandler';
import { handleZoom } from '@/utils/zoomHandler';
import { EraserBrush } from '@erase2d/fabric';
import {
  Canvas,
  type Circle,
  PencilBrush,
  Point,
  type Polygon,
  Rect,
  TEvent,
} from 'fabric';
import { Focus, Undo2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface CanvasDrawingProps {
  canvasMode: ToolToggleEnum;
  canvasDrawTool: DrawToolsEnum;
  setCanvasToggle: React.Dispatch<React.SetStateAction<ToolToggleEnum>>;
  strokeColor: string;
  strokeWidth: number;
  fabricRef: React.MutableRefObject<Canvas | null>;
  selectedClass: string;
  fillPolygon: boolean;
}

const CanvasDrawing: React.FC<CanvasDrawingProps> = ({
  canvasMode,
  canvasDrawTool,
  setCanvasToggle,
  strokeColor,
  strokeWidth,
  fabricRef,
  selectedClass,
  fillPolygon,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [canUndo, setCanUndo] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const polygonRef = useRef<Polygon | null>(null);
  const pointsRef = useRef<Circle[]>([]);
  const objectIdCounter = useRef(0);

  const mode = new ToolToggle(canvasMode);
  const drawTool = new DrawTool(canvasDrawTool);

  const updateUndoStateCallback = useCallback(() => {
    updateUndoState(fabricRef, setCanUndo);
  }, [fabricRef]);

  const updateZoomCallback = useCallback(() => {
    handleZoom(fabricRef, setZoomLevel);
  }, [fabricRef]);

  const handleClearCallback = useCallback(() => {
    handleClear(fabricRef, updateUndoStateCallback, pointsRef, polygonRef);
  }, [fabricRef, updateUndoStateCallback]);

  const handleUndoCallback = useCallback(() => {
    handleUndo(
      fabricRef,
      mode,
      drawTool,
      updateUndoStateCallback,
      pointsRef,
      polygonRef,
    );
  }, [fabricRef, mode, drawTool, updateUndoStateCallback]);

  const handleResetPanCallback = useCallback(() => {
    if (fabricRef.current) {
      fabricRef.current.absolutePan(new Point(0, 0));
      fabricRef.current.renderAll();
    }
  }, [fabricRef]);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      backgroundColor: 'transparent',
      uniformScaling: true,
      uniScaleKey: 'shiftKey',
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
    updateZoomCallback();

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      canvas.dispose();
    };
  }, [fabricRef, updateZoomCallback]);

  useEffect(() => {
    if (!fabricRef.current) return;

    const canvas = fabricRef.current;

    const handlePathCreated = ({ path }: { path: any }) => {
      path.erasable = true;
      path.perPixelTargetFind = true;
      path.objectCaching = true;
      path.noScaleCache = true;
      path.classColorName = selectedClass;
      path.objectCategory = 'path';
      path.objectId = `path-${objectIdCounter.current++}`;
      canvas.renderAll();
      updateUndoStateCallback();
    };

    canvas.on('path:created', handlePathCreated);
    canvas.on('object:modified', updateUndoStateCallback);

    return () => {
      canvas.off('path:created', handlePathCreated);
      canvas.off('object:modified', updateUndoStateCallback);
    };
  }, [selectedClass, updateUndoStateCallback, fabricRef]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!fabricRef.current) return;

      const keyActions: Record<string, () => void> = {
        Delete: () => {
          deleteObject(fabricRef.current);
          updateUndoStateCallback();
        },
        Backspace: () => {
          deleteObject(fabricRef.current);
          updateUndoStateCallback();
        },
        c: () => {
          if (event.ctrlKey) {
            copyObject(fabricRef.current);
          }
        },
        v: () => {
          if (event.ctrlKey) {
            pasteObject(fabricRef.current);
          }
        },
        x: () => {
          if (event.ctrlKey) {
            event.preventDefault();
            cutObject(fabricRef.current);
            updateUndoStateCallback();
          }
        },
        d: () => {
          if (event.ctrlKey) {
            event.preventDefault();
            duplicateObject(fabricRef.current);
            updateUndoStateCallback();
          }
        },
        z: () => {
          if (event.ctrlKey) {
            event.preventDefault();
            handleUndoCallback();
          }
        },
        Escape: () => {
          fabricRef.current?.discardActiveObject();
          fabricRef.current?.renderAll();
        },
      };

      if (keyActions[event.key]) keyActions[event.key]();
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [fabricRef, updateUndoStateCallback, handleUndoCallback]);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.isDrawingMode =
      mode.isDraw && (drawTool.isBrush || drawTool.isEraser);

    canvas.off('mouse:down' as any);
    canvas.off('mouse:move' as any);
    canvas.off('mouse:up' as any);

    if (mode.isDraw) {
      canvas.defaultCursor = 'default';

      if (drawTool.isBrush) {
        const pencilBrush = new PencilBrush(canvas);
        pencilBrush.width = strokeWidth;
        pencilBrush.color = strokeColor;
        canvas.freeDrawingBrush = pencilBrush;
      } else if (drawTool.isEraser) {
        const eraserBrush = new EraserBrush(canvas);
        eraserBrush.width = strokeWidth;
        canvas.freeDrawingBrush = eraserBrush;
      } else if (drawTool.isRectangle) {
        setupRectangleDrawing(
          canvas,
          strokeColor,
          strokeWidth,
          updateUndoStateCallback,
          setCanvasToggle,
          selectedClass,
          fillPolygon,
        );
      } else if (drawTool.isPolygon) {
        setupPolygonDrawing(
          canvas,
          pointsRef,
          polygonRef,
          setCanvasToggle,
          updateUndoStateCallback,
          {
            guidance: true,
            completeDistance: 10,
            minDistance: 2,
            strokeColor,
            fillPolygon,
            classColorName: selectedClass,
          },
        );
      }
    } else if (mode.isPan) {
      canvas.hoverCursor = 'grab';
      canvas.selection = false;
      canvas.forEachObject(obj => {
        obj.selectable = false;
        obj.evented = false;
      });

      let isDragging = false;
      let lastPosX: number;
      let lastPosY: number;

      canvas.on('mouse:down', opt => {
        const evt = opt.e;
        isDragging = true;
        canvas.selection = false;
        if (evt instanceof MouseEvent) {
          lastPosX = evt.clientX;
          lastPosY = evt.clientY;
        } else if (evt instanceof TouchEvent) {
          lastPosX = evt.touches[0].clientX;
          lastPosY = evt.touches[0].clientY;
        }
        canvas.defaultCursor = 'grabbing';
        canvas.renderAll();
      });

      canvas.on('mouse:move', opt => {
        if (isDragging) {
          const evt = opt.e;
          const vpt = canvas.viewportTransform;
          if (!vpt) return;
          if (evt instanceof MouseEvent) {
            vpt[4] += evt.clientX - lastPosX;
            vpt[5] += evt.clientY - lastPosY;
            lastPosX = evt.clientX;
            lastPosY = evt.clientY;
          } else if (evt instanceof TouchEvent) {
            vpt[4] += evt.touches[0].clientX - lastPosX;
            vpt[5] += evt.touches[0].clientY - lastPosY;
            lastPosX = evt.touches[0].clientX;
            lastPosY = evt.touches[0].clientY;
          }
          canvas.requestRenderAll();
        }
      });

      const handleMouseUp = () => {
        isDragging = false;
        canvas.defaultCursor = 'grab';
        canvas.renderAll();
      };

      const handleMouseDown = (opt: TEvent<MouseEvent | TouchEvent>) => {
        const evt = opt.e;
        isDragging = true;
        canvas.selection = false;
        if (evt instanceof MouseEvent) {
          lastPosX = evt.clientX;
          lastPosY = evt.clientY;
        }
        canvas.defaultCursor = 'grabbing';
        canvas.renderAll();
      };

      const handleMouseMove = (opt: TEvent<MouseEvent | TouchEvent>) => {
        if (isDragging) {
          const evt = opt.e;
          const vpt = canvas.viewportTransform;
          if (!vpt) return;
          if (evt instanceof MouseEvent) {
            vpt[4] += evt.clientX - lastPosX;
            vpt[5] += evt.clientY - lastPosY;
            lastPosX = evt.clientX;
            lastPosY = evt.clientY;
          } else if (evt instanceof TouchEvent) {
            vpt[4] += evt.touches[0].clientX - lastPosX;
            vpt[5] += evt.touches[0].clientY - lastPosY;
            lastPosX = evt.touches[0].clientX;
            lastPosY = evt.touches[0].clientY;
          }
          canvas.requestRenderAll();
        }
      };

      canvas.on('mouse:down', handleMouseDown);
      canvas.on('mouse:move', handleMouseMove);
      canvas.on('mouse:up', handleMouseUp);
    } else {
      canvas.selection = true;
      canvas.defaultCursor = 'default';
      canvas.hoverCursor = 'move';
      canvas.forEachObject(obj => {
        obj.selectable = true;
        obj.evented = true;
        obj.objectCaching = true;
        obj.noScaleCache = true;
        if (!(obj instanceof Rect)) {
          obj.perPixelTargetFind = true;
        }
      });
    }
  }, [
    mode,
    drawTool,
    strokeColor,
    strokeWidth,
    updateUndoStateCallback,
    setCanvasToggle,
    fillPolygon,
    fabricRef,
    selectedClass,
  ]);

  return (
    <div className="relative w-full h-screen p-4 bg-zinc-200 dark:bg-zinc-800 rounded-lg shadow-lg overflow-hidden">
      <div
        ref={containerRef}
        className="relative w-full h-screen rounded-lg overflow-hidden"
      >
        <canvas
          id="canvasId"
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
        />
        <ZoomControl
          fabricRef={fabricRef}
          zoomLevel={zoomLevel}
          setZoomLevel={setZoomLevel}
        />
      </div>
      <div className="absolute top-4 left-4 flex gap-2">
        <TooltipProvider>
          <Button onClick={handleClearCallback}>Clear canvas</Button>

          <Button onClick={handleUndoCallback} disabled={!canUndo}>
            <Undo2 className="h-4 w-4" />
            Undo
          </Button>

          <TooltipToggleButton
            keyValue="reset-pan"
            onClick={handleResetPanCallback}
            icon={<Focus className="h-4 w-4 text-black dark:text-white" />}
            tooltipText="Reset mouse pan"
          />
        </TooltipProvider>
      </div>
    </div>
  );
};

export default CanvasDrawing;
