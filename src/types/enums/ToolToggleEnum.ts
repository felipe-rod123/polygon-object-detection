export enum ToolToggleEnum {
  DRAW = 'draw',
  PAN = 'pan',
  ROTATION = 'rotation',
  SELECT = 'select',
  IMPORT = 'import',
}

export class ToolToggle {
  constructor(private tool: ToolToggleEnum) {}

  get isDraw(): boolean {
    return this.tool === ToolToggleEnum.DRAW;
  }

  get isPan(): boolean {
    return this.tool === ToolToggleEnum.PAN;
  }

  get isRotation(): boolean {
    return this.tool === ToolToggleEnum.ROTATION;
  }

  get isSelect(): boolean {
    return this.tool === ToolToggleEnum.SELECT;
  }

  get isImport(): boolean {
    return this.tool === ToolToggleEnum.IMPORT;
  }
}
