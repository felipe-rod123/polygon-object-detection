import { Canvas, Color, Rect } from 'fabric';
import { ToolToggleEnum } from '../types/enums/ToolToggleEnum';

let objectIdCounter = 0;

export const setupRectangleDrawing = (
  canvas: Canvas,
  strokeColor: string,
  strokeWidth: number,
  updateUndoState: () => void,
  setCanvasToggle: React.Dispatch<React.SetStateAction<ToolToggleEnum>>,
  classColorName: string,
  fillPolygon: boolean,
) => {
  let isDrawing = false;
  let startX = 0;
  let startY = 0;
  let rect: Rect | null = null;

  canvas.on('mouse:down', options => {
    isDrawing = true;
    const pointer = canvas.getPointer(options.e);
    startX = pointer.x;
    startY = pointer.y;

    rect = new Rect({
      left: startX,
      top: startY,
      width: 0,
      height: 0,
      fill: fillPolygon
        ? Color.fromHex(strokeColor).setAlpha(0.3).toRgba()
        : 'transparent',
      stroke: strokeColor,
      strokeWidth: strokeWidth,
      erasable: true,
      objectCaching: true,
      noScaleCache: true,
      classColorName: classColorName,
      objectCategory: 'rectangle',
      objectId: `rectangle-${objectIdCounter++}`,
    });

    // console.log(
    //   'Rectangle created with classColorName:',
    //   classColorName,
    //   ', objectCategory:',
    //   rect.objectCategory,
    //   ', objectId:',
    //   rect.objectId,
    // );

    canvas.add(rect);
  });

  canvas.on('mouse:move', options => {
    if (!isDrawing || !rect) return;

    const pointer = canvas.getPointer(options.e);
    const width = pointer.x - startX;
    const height = pointer.y - startY;

    rect.set({
      width: Math.abs(width),
      height: Math.abs(height),
      left: width > 0 ? startX : pointer.x,
      top: height > 0 ? startY : pointer.y,
    });

    canvas.renderAll();
  });

  canvas.on('mouse:up', () => {
    isDrawing = false;
    rect = null;
    canvas.renderAll();
    updateUndoState();
    setCanvasToggle(ToolToggleEnum.SELECT);
  });
};
