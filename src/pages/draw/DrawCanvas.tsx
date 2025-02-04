import { EraserBrush } from '@erase2d/fabric';
import * as fabric from 'fabric';
import { saveAs } from 'file-saver';
import { useCallback, useEffect, useRef, useState } from 'react';

import { DrawTool, type DrawToolsEnum } from '@/types/enums/DrawToolsEnum';
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

// Check [Performant Drag and Zoom using Fabric.js](https://medium.com/@Fjonan/performant-drag-and-zoom-using-fabric-js-3f320492f24b)
const handlePanMode = (
  fabricRef: React.MutableRefObject<fabric.Canvas | null>,
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

const handleClear = (
  fabricRef: React.MutableRefObject<fabric.Canvas | null>,
  updateUndoState: () => void,
  pointsRef: React.MutableRefObject<fabric.Circle[]>,
  polygonRef: React.MutableRefObject<fabric.Polygon | null>,
) => {
  const canvas = fabricRef.current;
  if (!canvas) return;
  canvas.clear();
  canvas.backgroundColor = 'transparent';
  canvas.renderAll();
  updateUndoState();
  pointsRef.current = [];
  polygonRef.current = null;
};

const handleUndo = (
  fabricRef: React.MutableRefObject<fabric.Canvas | null>,
  mode: ToolToggle,
  drawTool: DrawTool,
  updateUndoState: () => void,
  pointsRef: React.MutableRefObject<fabric.Circle[]>,
  polygonRef: React.MutableRefObject<fabric.Polygon | null>,
) => {
  const canvas = fabricRef.current;
  if (!canvas) return;
  const objects = canvas._objects;
  if (objects.length > 0) {
    if (mode.isDraw && drawTool.isPolygon) {
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
              objectCaching: true,
              noScaleCache: true,
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
};

const handleExportSVG = (
  fabricRef: React.MutableRefObject<fabric.Canvas | null>,
) => {
  const canvas = fabricRef.current;
  if (!canvas) return;

  const svg = canvas.toSVG();
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  saveAs(blob, 'canvas_export.svg');
};

const handleExportCOCO = (
  fabricRef: React.MutableRefObject<fabric.Canvas | null>,
) => {
  const canvas = fabricRef.current;
  if (!canvas) return;

  const objects = canvas.getObjects();
  const imageWidth = canvas.width;
  const imageHeight = canvas.height;

  const cocoData = {
    info: {
      description: 'Canvas Export',
      url: '',
      version: '1.0',
      year: new Date().getFullYear(),
      contributor: '',
      date_created: new Date().toISOString(),
    },
    licenses: [
      {
        url: 'http://creativecommons.org/licenses/by-nc-sa/2.0/',
        id: 1,
        name: 'Attribution-NonCommercial-ShareAlike License',
      },
    ],
    images: [
      {
        license: 1,
        file_name: 'canvas_export.png',
        coco_url: '',
        height: imageHeight,
        width: imageWidth,
        date_captured: new Date().toISOString(),
        flickr_url: '',
        id: 1,
      },
    ],
    annotations: objects.map((obj, index) => {
      const bbox = obj.getBoundingRect();
      return {
        segmentation: [], // We'll need to implement this for each shape type
        area: bbox.width * bbox.height,
        iscrowd: 0,
        image_id: 1,
        bbox: [bbox.left, bbox.top, bbox.width, bbox.height],
        category_id: 1, // We'll need to implement category mapping
        id: index + 1,
      };
    }),
    categories: [
      {
        supercategory: 'shape',
        id: 1,
        name: 'shape',
      },
    ],
  };

  const blob = new Blob([JSON.stringify(cocoData, null, 2)], {
    type: 'application/json',
  });
  saveAs(blob, 'coco_export.json');
};

const handleExportPNG = (
  fabricRef: React.MutableRefObject<fabric.Canvas | null>,
) => {
  const canvas = fabricRef.current;
  if (!canvas) return;

  canvas.getElement().toBlob(blob => {
    if (blob) {
      saveAs(blob, 'canvas_export.png');
    }
  });
};

const updateUndoState = (
  fabricRef: React.MutableRefObject<fabric.Canvas | null>,
  setCanUndo: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  const canvas = fabricRef.current;
  if (!canvas) return;

  setCanUndo(canvas._objects.length > 0);
};

const handleResetZoom = (
  fabricRef: React.MutableRefObject<fabric.Canvas | null>,
) => {
  const canvas = fabricRef.current;
  if (!canvas) return;

  canvas.setZoom(1);
  canvas.viewportTransform = [1, 0, 0, 1, 0, 0];
  canvas.renderAll();
};

const handleResetPan = (
  fabricRef: React.MutableRefObject<fabric.Canvas | null>,
) => {
  const canvas = fabricRef.current;
  if (!canvas) return;

  // TODO: implement
};

const setupRectangleDrawing = (
  canvas: fabric.Canvas,
  strokeColor: string,
  strokeWidth: number,
  updateUndoState: () => void,
  setCanvasToggle: React.Dispatch<React.SetStateAction<ToolToggleEnum>>,
) => {
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
      objectCaching: true,
      noScaleCache: true,
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
    canvas.renderAll();
    updateUndoState();
    setCanvasToggle(ToolToggleEnum.SELECT);
  });
};

const setupPolygonDrawing = (
  canvas: fabric.Canvas,
  pointsRef: React.MutableRefObject<
    fabric.Circle<
      Partial<fabric.CircleProps>,
      fabric.SerializedCircleProps,
      fabric.ObjectEvents
    >[]
  >,
  strokeColor: string,
  polygonRef: React.MutableRefObject<fabric.Polygon | null>,
  setCanvasToggle: React.Dispatch<React.SetStateAction<ToolToggleEnum>>,
  updateUndoState: () => void,
) => {
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
        objectCaching: true,
        noScaleCache: true,
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
          fill: fabric.Color.fromHex(strokeColor).setAlpha(0.3).toRgba(),
          stroke: strokeColor,
          strokeWidth: 2,
          erasable: true,
          objectCaching: true,
          noScaleCache: true,
        });

        canvas.remove(...pointsRef.current);
        if (polygonRef.current) canvas.remove(polygonRef.current); // Remove the polygon editing line
        canvas.add(polygon);
        canvas.renderAll();

        // Reset for next polygon
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
          objectCaching: true,
          noScaleCache: true,
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
          objectCaching: true,
          noScaleCache: true,
        });

        canvas.add(polygonRef.current);
        canvas.renderAll();
      }
    }
    updateUndoState();
  });
};

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

  const updateUndoStateCallback = useCallback(() => {
    updateUndoState(fabricRef, setCanUndo);
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

  const handleExportSVGCallback = useCallback(() => {
    handleExportSVG(fabricRef);
  }, []);

  const handleExportCOCOCallback = useCallback(() => {
    handleExportCOCO(fabricRef);
  }, []);

  const handleExportPNGCallback = useCallback(() => {
    handleExportPNG(fabricRef);
  }, []);

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

    const canvas = new fabric.Canvas(canvasRef.current, {
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

    // zoom control around a central point, limited between 1% and 2000%
    canvas.on('mouse:wheel', function (opt) {
      var delta = opt.e.deltaY;
      var zoom = canvas.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.01) zoom = 0.01;
      canvas.zoomToPoint(new fabric.Point(opt.e.offsetX, opt.e.offsetY), zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

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
        const pencilBrush = new fabric.PencilBrush(canvas);
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
        if (!(obj instanceof fabric.Rect)) {
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
        className="relative w-full h-screen bg-blue-400 rounded-lg overflow-visible"
      >
        <canvas
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
        <Button onClick={handleExportSVGCallback}>Export SVG</Button>
        <Button onClick={handleExportCOCOCallback}>Export COCO</Button>
        <Button onClick={handleExportPNGCallback}>Export PNG</Button>
        <Button onClick={handleResetZoomCallback}>Reset zoom</Button>
        <Button onClick={handleResetPanCallback}>Reset pan</Button>
      </div>
    </div>
  );
};

export default CanvasDrawing;
