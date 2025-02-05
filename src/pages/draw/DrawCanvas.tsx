import { EraserBrush } from '@erase2d/fabric';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { DrawTool, type DrawToolsEnum } from '@/types/enums/DrawToolsEnum';
import { ToolToggle, type ToolToggleEnum } from '@/types/enums/ToolToggleEnum';
import { handleClear } from '@/utils/clearCanvasHandler';
import { setupPolygonDrawing } from '@/utils/polygonBuilder';
import { setupRectangleDrawing } from '@/utils/rectangleBuilder';
import { handleUndo, updateUndoState } from '@/utils/undoActionHandler';
import { handleResetZoom, handleZoom } from '@/utils/zoomHandler';
import {
  Canvas,
  type Circle,
  PencilBrush,
  Point,
  type Polygon,
  Rect,
} from 'fabric';
import { Focus, ImageOff, Undo2, Video } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../components/ui/tooltip';
import {
  handleRemoveImageBackground,
  handleSetImageBackground,
} from '../../utils/backgroundImageHandler';

interface CanvasDrawingProps {
  canvasMode: ToolToggleEnum;
  canvasDrawTool: DrawToolsEnum;
  setCanvasToggle: React.Dispatch<React.SetStateAction<ToolToggleEnum>>;
  strokeColor: string;
  strokeWidth: number;
  fabricRef: React.MutableRefObject<Canvas | null>;
}

// Check [Performant Drag and Zoom using Fabric.js](https://medium.com/@Fjonan/performant-drag-and-zoom-using-fabric-js-3f320492f24b)

const CanvasDrawing: React.FC<CanvasDrawingProps> = ({
  canvasMode,
  canvasDrawTool,
  setCanvasToggle,
  strokeColor,
  strokeWidth,
  fabricRef,
}: CanvasDrawingProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [canUndo, setCanUndo] = useState(false);
  const polygonRef = useRef<Polygon | null>(null);
  const pointsRef = useRef<Circle[]>([]);

  const mode = new ToolToggle(canvasMode);
  const drawTool = new DrawTool(canvasDrawTool);

  const updateUndoStateCallback = useCallback(() => {
    updateUndoState(fabricRef, setCanUndo);
  }, [fabricRef]);

  const updateZoomCallback = useCallback(() => {
    handleZoom(fabricRef);
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

  const handleResetZoomCallback = useCallback(() => {
    handleResetZoom(fabricRef);
  }, [fabricRef]);

  const handleResetPanCallback = useCallback(() => {
    if (fabricRef.current) {
      fabricRef.current.absolutePan(new Point(0, 0));
      fabricRef.current.renderAll();
    }
  }, [fabricRef]);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      backgroundColor: 'transparent', // dark mode compatible
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

    /**
     * `perPixelTargetFind`
     * By default, all Fabric objects on canvas can be dragged by the bounding box. However, in order to click/drag objects only by its actual contents, we need to set “perPixelTargetFind” as true.
     *
     * `noScaleCache`
     * During the scaling transformation the object is not regenerated.
     */

    // make sure all drawn paths are erasable

    canvas.on('path:created', ({ path }) => {
      path.erasable = true;
      path.perPixelTargetFind = true;
      path.objectCaching = true;
      path.noScaleCache = true;
      canvas.renderAll();
      updateUndoStateCallback();
    });

    // listen for object modifications
    canvas.on('object:modified', updateUndoStateCallback);

    updateZoomCallback();

    // cleanup
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      canvas.dispose();
    };
  }, [updateUndoStateCallback, updateZoomCallback, fabricRef]);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.isDrawingMode =
      mode.isDraw && (drawTool.isBrush || drawTool.isEraser);

    // Remove all mode-specific listeners
    canvas.off('mouse:down' as any);
    canvas.off('mouse:move' as any);
    canvas.off('mouse:up' as any);

    if (mode.isDraw) {
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
        );
      } else if (drawTool.isPolygon) {
        setupPolygonDrawing(
          canvas,
          pointsRef,
          strokeColor,
          polygonRef,
          setCanvasToggle,
          updateUndoStateCallback,
        );
      }
    } else if (mode.isPan) {
      canvas.defaultCursor = 'grab';
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

      canvas.on('mouse:up', () => {
        isDragging = false;
        canvas.defaultCursor = 'grab';
        canvas.renderAll();
      });
    } else {
      // Set up selection mode
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
      </div>
      <div className="absolute top-4 left-4 flex gap-2">
        <TooltipProvider>
          <Button onClick={handleClearCallback}>Clear canvas</Button>
          <Button onClick={handleUndoCallback} disabled={!canUndo}>
            <Undo2 className="h-4 w-4" />
            Undo
          </Button>

          <Tooltip key="reset-zoom">
            <TooltipTrigger asChild>
              <Button
                size="icon"
                className="bg-transparent border border-zinc-300 rounded-md p-2 hover:bg-zinc-100 dark:border-slate-800 dark:hover:bg-zinc-800 active:bg-main-400 dark:active:bg-main-600"
                onClick={handleResetZoomCallback}
              >
                <Video className="h-4 w-4 text-black dark:text-white" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Reset zoom</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip key="reset-pan">
            <TooltipTrigger asChild>
              <Button
                size="icon"
                className="bg-transparent border border-zinc-300 rounded-md p-2 hover:bg-zinc-100 dark:border-slate-800 dark:hover:bg-zinc-800 active:bg-main-400 dark:active:bg-main-600"
                onClick={handleResetPanCallback}
              >
                <Focus className="h-4 w-4 text-black dark:text-white" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Reset mouse pan</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip key="remove-bg">
            <TooltipTrigger asChild>
              <Button
                size="icon"
                className="bg-transparent border border-zinc-300 rounded-md p-2 hover:bg-zinc-100 dark:border-slate-800 dark:hover:bg-zinc-800 active:bg-main-400 dark:active:bg-main-600"
                onClick={() => handleRemoveImageBackground(fabricRef)}
              >
                <ImageOff className="h-4 w-4 text-black dark:text-white" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Remove background</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Button
          onClick={() =>
            handleSetImageBackground(
              fabricRef,
              'https://upload.wikimedia.org/wikipedia/commons/a/aa/Oi_logo_2022.png',
            )
          }
        >
          Change bg img
        </Button>
      </div>
    </div>
  );
};

export default CanvasDrawing;
