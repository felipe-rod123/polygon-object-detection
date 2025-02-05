import { Canvas, FabricImage } from 'fabric';

// FIXME: blocked by CORS policy sometimes
export const handleSetImageBackground = (
  fabricRef: React.MutableRefObject<Canvas | null>,
  imageUrl: string,
) => {
  const canvas = fabricRef.current;
  if (!canvas) return;

  /**
   * If you must load resources from another domain, you need to ensure that the server hosting those resources explicitly allows your domain to access them.
   * This is done through Cross-Origin Resource Sharing (CORS) headers
   */

  FabricImage.fromURL(imageUrl, {
    crossOrigin: 'anonymous',
  }).then(img => {
    img.canvas = canvas;
    // Not working to remove the background before export...
    img.excludeFromExport = true;
    canvas.backgroundImage = img;

    canvas.renderAll();
  });
};

export const handleRemoveImageBackground = (
  fabricRef: React.MutableRefObject<Canvas | null>,
) => {
  const canvas = fabricRef.current;
  if (!canvas) return;

  FabricImage.fromURL('').then(img => {
    img.canvas = canvas;
    canvas.backgroundImage = img;

    canvas.renderAll();
  });
};
