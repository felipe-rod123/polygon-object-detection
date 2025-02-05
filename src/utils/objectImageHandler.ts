import { Canvas, FabricImage } from 'fabric';

export const handleAddImageObject = (
  fabricRef: React.MutableRefObject<Canvas | null>,
  imageUrl: string,
) => {
  const canvas = fabricRef.current;
  if (!canvas) return;

  try {
    // Add CORS header
    FabricImage.fromURL(imageUrl).then(img => {
      img.set({ crossOrigin: 'anonymous' });
      img.canvas = canvas;
      canvas.add(img);
      canvas.renderAll();
    });
  } catch (error) {
    console.error('Error adding image object to canvas:\n', error);
  }
};
