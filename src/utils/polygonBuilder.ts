import { ToolToggleEnum } from '@/types/enums/ToolToggleEnum';
import {
  Canvas,
  Circle,
  CircleProps,
  Color,
  ObjectEvents,
  Polygon,
  SerializedCircleProps,
} from 'fabric';

let objectIdCounter = 0;

interface PolygonToolOptions {
  guidance: boolean;
  completeDistance: number;
  minDistance: number;
  strokeColor: string;
  fillPolygon: boolean;
  classColorName: string;
}

export const setupPolygonDrawing = (
  canvas: Canvas,
  pointsRef: React.MutableRefObject<
    Circle<Partial<CircleProps>, SerializedCircleProps, ObjectEvents>[]
  >,
  polygonRef: React.MutableRefObject<Polygon | null>,
  setCanvasToggle: React.Dispatch<React.SetStateAction<ToolToggleEnum>>,
  updateUndoState: () => void,
  options: PolygonToolOptions,
) => {
  const {
    guidance = true,
    completeDistance,
    minDistance,
    strokeColor,
    fillPolygon = true,
    classColorName,
  } = options;

  const createPolygon = () => {
    const points = pointsRef.current.map(point => ({
      x: point.left!,
      y: point.top!,
    }));

    const polygon = new Polygon(points, {
      fill: fillPolygon
        ? Color.fromHex(strokeColor).setAlpha(0.3).toRgba()
        : 'transparent',
      stroke: strokeColor,
      strokeWidth: 2,
      erasable: true,
      objectCaching: true,
      noScaleCache: true,
      classColorName: classColorName,
      objectCategory: 'polygon',
      objectId: `polygon-${objectIdCounter++}`,
    });

    return polygon;
  };

  // use a²=b²+c² to check if the distance is less than the accepted complete distance
  const autoComplete = (x: number, y: number) => {
    const distanceToFirst = Math.sqrt(
      Math.pow(x - pointsRef.current[0].left!, 2) +
        Math.pow(y - pointsRef.current[0].top!, 2),
    );

    if (
      distanceToFirst < completeDistance &&
      pointsRef.current.length > minDistance
    ) {
      const polygon = createPolygon();
      // can't edit after polygon is created, but logic to edit would require a more complex implentation
      // (perhaps new drawTool mode, adding groups, changing COCO export to iscrowd, so on)
      canvas.remove(...pointsRef.current);
      if (polygonRef.current) canvas.remove(polygonRef.current);
      canvas.add(polygon);
      canvas.renderAll();

      // console.log(
      //   'Polygon created with classColorName:',
      //   classColorName,
      //   ', objectCategory:',
      //   polygon.objectCategory,
      //   ', objectId:',
      //   polygon.objectId,
      // );

      setCanvasToggle(ToolToggleEnum.SELECT);
      pointsRef.current = [];
      polygonRef.current = null;
      updateUndoState();
      return true;
    }
    return false;
  };

  canvas.on('mouse:down', options => {
    const pointer = canvas.getPointer(options.e);
    const x = pointer.x;
    const y = pointer.y;

    if (pointsRef.current.length === 0) {
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
        classColorName: classColorName,
        objectCategory: 'path',
        objectId: `point-${objectIdCounter++}`,
      });
      canvas.add(firstPoint);
      pointsRef.current.push(firstPoint);
    } else {
      if (autoComplete(x, y)) return;

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
        classColorName: classColorName,
        objectCategory: 'path',
        objectId: `point-${objectIdCounter++}`,
      });
      canvas.add(newPoint);
      pointsRef.current.push(newPoint);

      if (polygonRef.current) {
        canvas.remove(polygonRef.current);
      }

      polygonRef.current = createPolygon();
      canvas.add(polygonRef.current);
      canvas.renderAll();
    }
    updateUndoState();
  });

  if (guidance) {
    canvas.on('mouse:move', options => {
      if (pointsRef.current.length === 0) return;

      const pointer = canvas.getPointer(options.e);
      const x = pointer.x;
      const y = pointer.y;

      if (polygonRef.current) {
        canvas.remove(polygonRef.current);
      }

      const points = pointsRef.current.map(point => ({
        x: point.left!,
        y: point.top!,
      }));
      points.push({ x, y });

      polygonRef.current = new Polygon(points, {
        fill: fillPolygon
          ? Color.fromHex(strokeColor).setAlpha(0.3).toRgba()
          : 'transparent',
        stroke: strokeColor,
        strokeWidth: 2,
        erasable: true,
        objectCaching: true,
        noScaleCache: true,
        classColorName: classColorName,
        objectCategory: 'polygon',
        objectId: `polygon-${objectIdCounter++}`,
      });

      canvas.add(polygonRef.current);
      canvas.renderAll();
    });
    updateUndoState();
  }
};
