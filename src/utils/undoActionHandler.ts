import { Canvas, Circle, Polygon } from 'fabric';
import { DrawTool } from '../types/enums/DrawToolsEnum';
import { ToolToggle } from '../types/enums/ToolToggleEnum';

export const handleUndo = (
  fabricRef: React.MutableRefObject<Canvas | null>,
  mode: ToolToggle,
  drawTool: DrawTool,
  updateUndoState: () => void,
  pointsRef: React.MutableRefObject<Circle[]>,
  polygonRef: React.MutableRefObject<Polygon | null>,
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
            polygonRef.current = new Polygon(points, {
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

export const updateUndoState = (
  fabricRef: React.MutableRefObject<Canvas | null>,
  setCanUndo: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  const canvas = fabricRef.current;
  if (!canvas) return;

  setCanUndo(canvas._objects.length > 0);
};
