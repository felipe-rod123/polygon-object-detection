import { Canvas } from 'fabric';
import saveAs from 'file-saver';

export const handleExportSVG = (
  fabricRef: React.MutableRefObject<Canvas | null>,
) => {
  const canvas = fabricRef.current;
  if (!canvas) return;

  const svg = canvas.toSVG();
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  saveAs(blob, 'canvas_export.svg');
};

export const handleExportCOCO = (
  fabricRef: React.MutableRefObject<Canvas | null>,
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

export const handleExportPNG = (
  fabricRef: React.MutableRefObject<Canvas | null>,
) => {
  const canvas = fabricRef.current;
  if (!canvas) return;

  canvas.getElement().toBlob(blob => {
    if (blob) {
      saveAs(blob, 'canvas_export.png');
    }
  });
};
