export enum ToolToggleEnum {
  DRAW = 'draw',
  PAN = 'pan',
  SELECT = 'select',
}

export class ToolToggle {
  constructor(private tool: ToolToggleEnum) {}

  get isDraw(): boolean {
    return this.tool === ToolToggleEnum.DRAW;
  }

  get isPan(): boolean {
    return this.tool === ToolToggleEnum.PAN;
  }

  get isSelect(): boolean {
    return this.tool === ToolToggleEnum.SELECT;
  }
}
