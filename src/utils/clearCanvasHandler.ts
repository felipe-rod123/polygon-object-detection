import { Canvas, Circle, Polygon } from 'fabric';

export const handleClear = (
  fabricRef: React.MutableRefObject<Canvas | null>,
  updateUndoState: () => void,
  pointsRef: React.MutableRefObject<Circle[]>,
  polygonRef: React.MutableRefObject<Polygon | null>,
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
