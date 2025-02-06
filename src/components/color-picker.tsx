import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type React from 'react';
import { useState } from 'react';
import { HexColorInput, HexColorPicker } from 'react-colorful';
import { getRandomColor } from '../utils/getRandomColor';
import { Button } from './ui/button';

interface ColorPickerProps {
  onChange: (color: string) => void;
  initialColor?: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  onChange,
  initialColor,
}) => {
  const [color, setColor] = useState(initialColor || getRandomColor());

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    onChange(newColor);
  };

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="default"
            className="rounded-full w-8 h-8"
            style={{
              backgroundColor: color,
              border: '1px solid #18181b54', // zinc-950 color
            }}
          >
            <span className="sr-only">Pick a color</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="flex flex-col px-4 py-6 space-y-2 max-w-[240px] justify-center items-center">
          <Label htmlFor="color" className="self-start">
            Pick a color
          </Label>
          <HexColorPicker
            color={color}
            onChange={handleColorChange}
            className="rounded-none"
          />
          <HexColorInput
            color={color}
            onChange={handleColorChange}
            className="flex w-full px-2 py-1 rounded-sm bg-zinc-200 shadow-sm dark:bg-zinc-800"
          />
        </PopoverContent>
      </Popover>
    </>
  );
};

export default ColorPicker;
