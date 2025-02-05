import { Canvas, FabricImage } from 'fabric';

export const imagePaths: string[] = [];

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

    // used for `image` section on COCO export
    imagePaths.push(imageUrl);
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

      // used for `image` section on COCO export
      imagePaths.push(imageUrl);
    });
  } catch (error) {
    console.error('Error adding image object to canvas:\n', error);
  }
};
