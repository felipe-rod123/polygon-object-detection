import { EraserBrush } from '@erase2d/fabric';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { DrawTool, type DrawToolsEnum } from '@/types/enums/DrawToolsEnum';
import { ToolToggle, ToolToggleEnum } from '@/types/enums/ToolToggleEnum';
import { handleClear } from '@/utils/clearCanvasHandler';
import { setupPolygonDrawing } from '@/utils/polygonBuilder';
import { setupRectangleDrawing } from '@/utils/rectangleBuilder';
import { handleUndo, updateUndoState } from '@/utils/undoActionHandler';
import { handleResetZoom, handleZoom } from '@/utils/zoomHandler';
import { Canvas, Circle, PencilBrush, Polygon, Rect } from 'fabric';
import { Undo2 } from 'lucide-react';
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
// FIXME: can't get out of the pan mode, once it started
const handlePanMode = (
  fabricRef: React.MutableRefObject<Canvas | null>,
  containerRef: React.MutableRefObject<HTMLDivElement | null>,
) => {
  const canvas = fabricRef.current;
  if (!canvas || !containerRef.current) return;

  let lastPosX = 0;
  let lastPosY = 0;
  let isDragging = false;

  const wrapper = containerRef.current;

  const onMouseDown = (event: MouseEvent) => {
    isDragging = true;
    lastPosX = event.clientX;
    lastPosY = event.clientY;
    wrapper.style.cursor = 'grabbing';
  };

  const onMouseMove = (event: MouseEvent) => {
    if (!isDragging) return;
    const dx = event.clientX - lastPosX;
    const dy = event.clientY - lastPosY;
    lastPosX = event.clientX;
    lastPosY = event.clientY;

    const transform = wrapper.style.transform.match(
      /translate\(([-\d.]+)px, ([-\d.]+)px\)/,
    );
    let offsetX = transform ? parseFloat(transform[1]) + dx : dx;
    let offsetY = transform ? parseFloat(transform[2]) + dy : dy;

    wrapper.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
  };

  const onMouseUp = () => {
    isDragging = false;
    wrapper.style.cursor = 'grab';
  };

  wrapper.addEventListener('mousedown', onMouseDown);
  wrapper.addEventListener('mousemove', onMouseMove);
  wrapper.addEventListener('mouseup', onMouseUp);

  return () => {
    wrapper.removeEventListener('mousedown', onMouseDown);
    wrapper.removeEventListener('mousemove', onMouseMove);
    wrapper.removeEventListener('mouseup', onMouseUp);
  };
};

const handleResetPan = (fabricRef: React.MutableRefObject<Canvas | null>) => {
  const canvas = fabricRef.current;
  if (!canvas) return;

  // TODO: implement
};

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
  }, []);

  const updateZoomCallback = useCallback(() => {
    handleZoom(fabricRef);
  }, []);

  const handleClearCallback = useCallback(() => {
    handleClear(fabricRef, updateUndoStateCallback, pointsRef, polygonRef);
  }, [updateUndoStateCallback]);

  const handleUndoCallback = useCallback(() => {
    handleUndo(
      fabricRef,
      mode,
      drawTool,
      updateUndoStateCallback,
      pointsRef,
      polygonRef,
    );
  }, [mode, drawTool, updateUndoStateCallback]);

  const handleResetZoomCallback = useCallback(() => {
    handleResetZoom(fabricRef);
  }, []);

  const handleResetPanCallback = useCallback(() => {
    handleResetPan(fabricRef);
  }, []);

  const handlePanModeCallback = useCallback(() => {
    handlePanMode(fabricRef, containerRef);
  }, []);

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
  }, [updateUndoStateCallback]);

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

        canvas.off('path:created' as any);
        canvas.on('path:created', ({ path }) => {
          path.erasable = true;
          path.perPixelTargetFind = true;
          path.objectCaching = true;
          path.noScaleCache = true;
          canvas.renderAll();
          updateUndoStateCallback();
        });
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
    } else {
      // Set up selection mode
      canvas.selection = true;
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
    if (mode.isPan) handlePanModeCallback();
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
        className="relative w-full h-screen rounded-lg overflow-visible"
      >
        <canvas
          id="canvasId"
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
          style={{ transform: 'translate(0px, 0px)' }}
        />
      </div>
      <div className="absolute top-4 left-4 flex gap-2">
        <Button onClick={handleClearCallback}>Clear canvas</Button>
        <Button onClick={handleUndoCallback} disabled={!canUndo}>
          <Undo2 className="h-4 w-4" />
          Undo
        </Button>

        <Button onClick={handleResetZoomCallback}>Reset zoom</Button>
        <Button onClick={handleResetPanCallback}>Reset pan</Button>
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
        <Button onClick={() => handleRemoveImageBackground(fabricRef)}>
          Remove bg img
        </Button>
      </div>
    </div>
  );
};

export default CanvasDrawing;
