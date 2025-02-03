export enum DrawToolsEnum {
  BRUSH = 'brush',
  POLYGON = 'polygon',
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

  get isEraser(): boolean {
    return this.tool === DrawToolsEnum.ERASER;
  }
}
