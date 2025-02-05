import { Canvas, Point } from 'fabric';

// zoom control around a central point, limited between 1% and 2000%
export const handleZoom = (
  fabricRef: React.MutableRefObject<Canvas | null>,
  setZoomLevel: React.Dispatch<React.SetStateAction<number>>,
  zoomLevel?: number,
) => {
  const canvas = fabricRef.current;
  if (!canvas) return;

  if (zoomLevel !== undefined) {
    const zoom = Math.min(Math.max(zoomLevel, 0.01), 20);
    canvas.setZoom(zoom);
    canvas.viewportTransform = [zoom, 0, 0, zoom, 0, 0];
    canvas.renderAll();
    if (setZoomLevel) setZoomLevel(zoom * 100);
  }

  canvas.on('mouse:wheel', opt => {
    if (opt.e.ctrlKey) {
      opt.e.preventDefault();
      const delta = opt.e.deltaY;
      let zoom = canvas.getZoom();
      zoom *= 0.9999 ** delta; // Adjust sensitivity
      zoom = Math.min(Math.max(zoom, 0.01), 20);
      canvas.zoomToPoint(new Point(opt.e.offsetX, opt.e.offsetY), zoom);
      if (setZoomLevel) setZoomLevel(zoom * 100);
      opt.e.stopPropagation();
    }
  });
};

export const handleResetZoom = (
  fabricRef: React.MutableRefObject<Canvas | null>,
  setZoomLevel?: React.Dispatch<React.SetStateAction<number>>,
) => {
  const canvas = fabricRef.current;
  if (!canvas) return;

  canvas.setZoom(1);
  canvas.viewportTransform = [1, 0, 0, 1, 0, 0];
  canvas.renderAll();

  if (setZoomLevel) setZoomLevel(100);
};
