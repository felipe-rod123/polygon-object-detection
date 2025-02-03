'use client';

import { Button } from '@/components/ui/button';
import { DrawTool, DrawToolsEnum } from '@/types/enums/DrawToolsEnum';
import { ToolToggle, ToolToggleEnum } from '@/types/enums/ToolToggleEnum';

import {
  ActiveSelection,
  Canvas,
  FabricObject,
  PencilBrush,
  Rect,
} from 'fabric';
import { useEffect, useRef, useState } from 'react';

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

  const mode = new ToolToggle(canvasMode);
  const drawTool = new DrawTool(canvasDrawTool);

  let _clipboard: FabricObject | ActiveSelection | null = null;

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

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!fabricCanvas) return;

      switch (event.key) {
        case 'Delete':
        case 'Backspace':
          deleteSelectedObjects();
          break;
        case 'c':
          if (event.ctrlKey) copyObjectsToClipboard();
          break;
        case 'v':
          if (event.ctrlKey) pasteObjectsFromClipboard();
          break;
        case 'd':
          if (event.ctrlKey) duplicateSelectedObjects();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // cleanup
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      window.removeEventListener('keydown', handleKeyDown);
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (!fabricCanvas) return;

    if (canvasMode === ToolToggleEnum.DRAW) {
      if (drawTool.isBrush) {
        console.log('isBrush');
        freeDraw();
      }
      if (drawTool.isPolygon) console.log('isPolygon');
      if (drawTool.isEraser) console.log('isEraser');
    } else {
      fabricCanvas.set({ isDrawingMode: false });
    }
  }, [fabricCanvas, canvasMode, canvasDrawTool, strokeColor, strokeWidth]);

  const freeDraw = () => {
    if (!fabricCanvas || !mode.isDraw) return;

    fabricCanvas.set({ isDrawingMode: true });

    const brush = new PencilBrush(fabricCanvas);
    brush.color = strokeColor;
    brush.width = strokeWidth;
    fabricCanvas.set({ freeDrawingBrush: brush });
  };

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

  const copyObjectsToClipboard = () => {
    if (!fabricCanvas) return;

    const activeObject = fabricCanvas.getActiveObject();
    if (!activeObject) return;

    activeObject.clone().then(cloned => {
      _clipboard = cloned;
    });
  };

  const pasteObjectsFromClipboard = async () => {
    if (!fabricCanvas || !_clipboard) return;

    const clonedObj = await _clipboard.clone();
    fabricCanvas.discardActiveObject();

    clonedObj.set({
      left: clonedObj.left + 10,
      top: clonedObj.top + 10,
      evented: true,
    });

    if (clonedObj instanceof ActiveSelection) {
      clonedObj.canvas = fabricCanvas;
      clonedObj.forEachObject((obj: FabricObject) => {
        fabricCanvas.add(obj);
      });

      clonedObj.setCoords();
    } else {
      fabricCanvas.add(clonedObj);
    }

    _clipboard.top += 10;
    _clipboard.left += 10;

    fabricCanvas.setActiveObject(clonedObj);
    fabricCanvas.requestRenderAll();
  };

  const duplicateSelectedObjects = () => {
    if (!fabricCanvas) return;

    copyObjectsToClipboard();
    pasteObjectsFromClipboard();
  };

  const deleteSelectedObjects = () => {
    if (!fabricCanvas) return;

    const activeObject = fabricCanvas.getActiveObject();
    if (activeObject) {
      fabricCanvas.remove(activeObject);
    }
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
