import { DrawToolsEnum } from '@/types/enums/DrawToolsEnum';
import { ToolToggleEnum } from '@/types/enums/ToolToggleEnum';
import { useState } from 'react';

export const useDrawTools = () => {
  const [brushSize, setBrushSize] = useState(10);
  const [drawTool, setDrawTool] = useState<DrawToolsEnum>(DrawToolsEnum.BRUSH);
  const [toggle, setToggle] = useState<ToolToggleEnum>(ToolToggleEnum.DRAW);
  const [fillPolygon, setFillPolygon] = useState(true);

  const handleBrushSizeChange = (value: number[]) => {
    setBrushSize(value[0]);
  };

  const handleDrawToolChange = (value: string) => {
    if (Object.values(DrawToolsEnum).includes(value as DrawToolsEnum)) {
      setDrawTool(value as DrawToolsEnum);
    }
  };

  return {
    brushSize,
    drawTool,
    toggle,
    fillPolygon,
    handleBrushSizeChange,
    handleDrawToolChange,
    setToggle,
    setFillPolygon,
  };
};
