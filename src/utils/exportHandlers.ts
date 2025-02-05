import { DrawClass } from '@/types/DrawClass';
import { Canvas, FabricObject, Path, Polygon, Rect } from 'fabric';
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
  classes: Map<string, DrawClass>,
) => {
  const canvas = fabricRef.current;
  if (!canvas) return;

  const objects = canvas.getObjects();
  const imageWidth = canvas.width ?? 0;
  const imageHeight = canvas.height ?? 0;

  let annotationId = 1;
  const categoryMap = new Map<string, number>();
  Array.from(classes.keys()).forEach((className, index) => {
    categoryMap.set(className, index + 1);
  });

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
    annotations: objects.map((obj: FabricObject) => {
      const bbox = obj.getBoundingRect();
      const className = (obj.get('class') as string) || 'default';
      const categoryId = categoryMap.get(className) || 1;

      let segmentation: number[][] = [];
      if (obj instanceof Polygon) {
        segmentation = [obj.points!.flatMap(point => [point.x, point.y])];
      } else if (obj instanceof Rect) {
        const { left, top, width, height } = obj;
        segmentation = [
          [
            left!,
            top!,
            left! + width!,
            top!,
            left! + width!,
            top! + height!,
            left!,
            top! + height!,
          ],
        ];
      } else if (obj instanceof Path) {
        segmentation = [
          obj.path!.flatMap(command => {
            if (command[0] === 'M' || command[0] === 'L') {
              return [command[1], command[2]];
            }
            return [];
          }),
        ];
      }

      return {
        segmentation,
        area: bbox.width * bbox.height,
        iscrowd: 0,
        image_id: 1,
        bbox: [bbox.left, bbox.top, bbox.width, bbox.height],
        category_id: categoryId,
        id: annotationId++,
      };
    }),
    categories: Array.from(classes.entries()).map(([name], index) => ({
      supercategory: 'shape',
      id: index + 1,
      name: name,
    })),
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
