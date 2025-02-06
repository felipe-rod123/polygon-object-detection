import { ActiveSelection, Canvas, FabricImage, FabricObject } from 'fabric';
import { handleRemoveImageFromExports } from './imageHandlers';

let _clipboard: FabricObject | null = null;

export const deleteObject = (canvas: Canvas | null) => {
  if (!canvas) return;

  const activeObject = canvas?.getActiveObject();

  if (!activeObject) return;

  if (activeObject instanceof ActiveSelection) {
    activeObject.forEachObject(obj => {
      // remove image from the COCO export `images` section
      if (obj && obj.type === 'image') {
        const imageUrl = (obj as FabricImage).getSrc();
        handleRemoveImageFromExports(imageUrl);
      }

      canvas.remove(obj);
    });
  } else {
    canvas.remove(activeObject);
  }

  canvas.discardActiveObject();
  canvas.requestRenderAll();
};

export const copyObject = (canvas: Canvas | null) => {
  if (!canvas) return;

  const activeObject = canvas?.getActiveObject();

  if (!activeObject) return;
  activeObject.clone().then((cloned: FabricObject) => {
    _clipboard = cloned;
  });
};

export const pasteObject = async (canvas: Canvas | null) => {
  if (_clipboard && canvas) {
    const clonedObj = await _clipboard.clone();
    canvas.discardActiveObject();
    clonedObj.set({
      left: clonedObj.left + 10,
      top: clonedObj.top + 10,
      evented: true,
    });
    if (clonedObj instanceof ActiveSelection) {
      clonedObj.canvas = canvas;
      clonedObj.forEachObject(obj => {
        canvas.add(obj);
      });
      clonedObj.setCoords();
    } else {
      canvas.add(clonedObj);
    }
    _clipboard.top += 10;
    _clipboard.left += 10;
    canvas.setActiveObject(clonedObj);
    canvas.requestRenderAll();
  }
};

export const cutObject = (canvas: Canvas | null) => {
  if (!canvas) return;

  const activeObject = canvas?.getActiveObject();

  if (!activeObject) return;
  activeObject.clone().then((cloned: FabricObject) => {
    _clipboard = cloned;
    deleteObject(canvas);
  });
};

export const duplicateObject = (canvas: Canvas | null) => {
  if (!canvas) return;

  const activeObject = canvas?.getActiveObject();

  if (!activeObject) return;
  activeObject.clone().then((cloned: FabricObject) => {
    canvas.discardActiveObject();
    cloned.set({
      left: cloned.left + 10,
      top: cloned.top + 10,
      evented: true,
    });
    if (cloned instanceof ActiveSelection) {
      cloned.canvas = canvas;
      cloned.forEachObject(obj => {
        canvas.add(obj);
      });
      cloned.setCoords();
    } else {
      canvas.add(cloned);
    }
    canvas.setActiveObject(cloned);
    canvas.requestRenderAll();
  });
};
