import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import {
  Box,
  Brush,
  Download,
  Eraser,
  Image,
  Menu,
  RotateCcw,
  Square,
} from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import ThemeSwitchButton from '../../components/theme-switch-button';
import BackAlertDialog from './BackAlertDialog';

const DrawPage: React.FC = () => {
  const [brushSize, setBrushSize] = useState(10);

  const handleBrushSizeChange = (value: number[]) => {
    setBrushSize(value[0]);
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
      <header className="border-b border-zinc-200 p-4 flex justify-between items-center dark:border-zinc-800">
        <div className="flex flex-row justify-center items-center text-2xl font-bold text-zinc-800 dark:text-zinc-100">
          <Box
            className="mr-0.5 text-main-700 dark:text-main-300"
            strokeWidth={3}
          />
          polygon
        </div>
        <div className="flex items-center space-x-2">
          <BackAlertDialog />

          <ThemeSwitchButton />
          {/* MOBILE RESPONSIVE SIDEBAR LAYOUT */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[300px] sm:w-[400px] bg-zinc-50 dark:bg-zinc-800"
            >
              <SheetHeader>
                <SheetTitle>Drawing Tools</SheetTitle>
                <SheetDescription>
                  Adjust your drawing settings here.
                </SheetDescription>
              </SheetHeader>
              <div className="py-4 space-y-4">
                {renderToolbar(brushSize, handleBrushSizeChange)}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* DESKTOP AND LARGER SCREENS LAYOUT */}
      <main className="p-4 flex flex-col md:flex-row gap-4">
        <div className="hidden md:block w-64 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Tools</h2>
          </div>
          {renderToolbar(brushSize, handleBrushSizeChange)}
        </div>
        <div className="flex-grow">
          <div className="aspect-video bg-zinc-200 rounded-lg flex items-center justify-center dark:bg-zinc-800">
            <p className="text-zinc-500 dark:text-zinc-500">Canvas Area</p>
          </div>
        </div>
      </main>
    </div>
  );
};

const renderToolbar = (
  brushSize: number,
  handleBrushSizeChange: (value: number[]) => void,
) => (
  <>
    <div className="space-y-2">
      <Label htmlFor="tool-select">Drawing Tool</Label>
      <Select defaultValue="brush">
        <SelectTrigger id="tool-select">
          <SelectValue placeholder="Select tool" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="brush">
            <div className="flex items-center">
              <Brush className="mr-2 h-4 w-4" />
              Brush
            </div>
          </SelectItem>
          <SelectItem value="polygon">
            <div className="flex items-center">
              <Square className="mr-2 h-4 w-4" />
              Polygon
            </div>
          </SelectItem>
          <SelectItem value="eraser">
            <div className="flex items-center">
              <Eraser className="mr-2 h-4 w-4" />
              Eraser
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div className="space-y-2">
      <Label htmlFor="brush-size">Brush Size</Label>
      <Slider
        id="brush-size"
        min={1}
        max={50}
        step={1}
        defaultValue={[10]}
        className="w-full"
        onValueChange={handleBrushSizeChange}
      />
      <p className="text-sm text-zinc-700 dark:text-zinc-400">{brushSize} px</p>
    </div>

    <div className="space-y-2">
      <Label htmlFor="class-select">Class</Label>
      <Select>
        <SelectTrigger id="class-select">
          <SelectValue placeholder="Select a class" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="class1">Class 1</SelectItem>
          <SelectItem value="class2">Class 2</SelectItem>
          <SelectItem value="class3">Class 3</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div className="space-y-2">
      <Label htmlFor="add-class">New Class</Label>
      <div className="flex space-x-2">
        <Input id="add-class" placeholder="Class name" />
        <Button>Add</Button>
      </div>
    </div>

    <div className="space-y-2">
      <Button className="w-full mt-4 sm:mt-1" variant="secondary">
        <RotateCcw className="mr-2 h-4 w-4" /> Undo
      </Button>
      <Button className="w-full" variant="outline">
        <Download className="mr-2 h-4 w-4" /> Export COCO
      </Button>
      <Button className="w-full" variant="outline">
        <Image className="mr-2 h-4 w-4" /> Save as SVG
      </Button>
    </div>
  </>
);

export default DrawPage;
