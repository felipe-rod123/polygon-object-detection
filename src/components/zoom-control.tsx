import { Button } from '@/components/ui/button';
import { handleResetZoom, handleZoom } from '@/utils/zoomHandler';
import { Canvas } from 'fabric';
import { ZoomIn, ZoomOut } from 'lucide-react';
import React, { useEffect } from 'react';

const ZoomControl: React.FC<{
  fabricRef: React.MutableRefObject<Canvas | null>;
  zoomLevel: number;
  setZoomLevel: React.Dispatch<React.SetStateAction<number>>;
}> = ({ fabricRef, zoomLevel, setZoomLevel }) => {
  useEffect(() => {
    handleZoom(fabricRef, setZoomLevel, undefined);
  }, [fabricRef]);

  const adjustZoom = (delta: number) => {
    const newZoom = Math.min(Math.max(zoomLevel + delta, 1), 2000);
    setZoomLevel(newZoom);
    handleZoom(fabricRef, setZoomLevel, newZoom / 100);
  };

  return (
    <div className="absolute top-0 right-0 flex items-center">
      <p className="text-sm mr-4">{zoomLevel.toFixed(0)}%</p>
      <div className="ml-4 mr-2">
        <Button onClick={() => adjustZoom(-10)} variant="ghost" size="icon">
          <ZoomOut />
        </Button>
        <Button onClick={() => adjustZoom(10)} variant="ghost" size="icon">
          <ZoomIn />
        </Button>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleResetZoom(fabricRef, setZoomLevel)}
      >
        Reset
      </Button>
    </div>
  );
};

export default ZoomControl;
