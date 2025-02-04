import {
  Canvas,
  Circle,
  CircleProps,
  Color,
  ObjectEvents,
  Polygon,
  SerializedCircleProps,
} from 'fabric';
import { ToolToggleEnum } from '../types/enums/ToolToggleEnum';

export const setupPolygonDrawing = (
  canvas: Canvas,
  pointsRef: React.MutableRefObject<
    Circle<Partial<CircleProps>, SerializedCircleProps, ObjectEvents>[]
  >,
  strokeColor: string,
  polygonRef: React.MutableRefObject<Polygon | null>,
  setCanvasToggle: React.Dispatch<React.SetStateAction<ToolToggleEnum>>,
  updateUndoState: () => void,
) => {
  canvas.on('mouse:down', options => {
    const pointer = canvas.getPointer(options.e);
    const x = pointer.x;
    const y = pointer.y;

    if (pointsRef.current.length === 0) {
      // reference starting point
      const firstPoint = new Circle({
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

        const polygon = new Polygon(points, {
          fill: Color.fromHex(strokeColor).setAlpha(0.3).toRgba(),
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
        const newPoint = new Circle({
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

        polygonRef.current = new Polygon(points, {
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
