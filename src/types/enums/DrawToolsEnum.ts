export enum DrawToolsEnum {
  BRUSH = 'brush',
  POLYGON = 'polygon',
  RECTANGLE = 'rectangle',
  ERASER = 'eraser',
}

export class DrawTool {
  constructor(private tool: DrawToolsEnum) {}

  get isBrush(): boolean {
    return this.tool === DrawToolsEnum.BRUSH;
  }

  get isPolygon(): boolean {
    return this.tool === DrawToolsEnum.POLYGON;
  }

  get isRectangle(): boolean {
    return this.tool === DrawToolsEnum.RECTANGLE;
  }

  get isEraser(): boolean {
    return this.tool === DrawToolsEnum.ERASER;
  }
}
