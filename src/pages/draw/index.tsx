import ColorPicker from '@/components/color-picker';
import ThemeSwitchButton from '@/components/theme-switch-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { DrawClass } from '@/types/DrawClass';
import { getRandomColor } from '@/utils/getRandomColor';
import {
  ArrowLeft,
  Box,
  Brush,
  Download,
  Eraser,
  Image,
  Menu,
  RotateCcw,
  Square,
  X,
} from 'lucide-react';
import type React from 'react';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import ButtonAlertDialog from './ButtonAlertDialog';
import ToolSelectorToggleGroup from './ToolSelectorToggleGroup';

const DrawPage: React.FC = () => {
  let navigate = useNavigate();

  const [brushSize, setBrushSize] = useState(10);

  const [classes, setClasses] = useState<Map<string, DrawClass>>(new Map());
  const colorSet = new Set<string>();

  const [selectedClass, setSelectedClass] = useState<DrawClass | null>(null);
  const [newClassName, setNewClassName] = useState('');
  const [newClassColor, setNewClassColor] = useState(getRandomColor());
  const [toggle, setToggle] = useState('draw');

  const handleBrushSizeChange = (value: number[]) => {
    setBrushSize(value[0]);
  };

  const { toast } = useToast();

  // O(1) because uses a Map to search an index
  const findClassByName = (className: string): DrawClass | null => {
    return classes.get(className) || null;
  };

  // O(1) because Map allows direct lookup by key
  const handleClassSelected = (className: string) => {
    setSelectedClass(classes.get(className) || null);
  };

  // O(n), where n is the number of classes in the `classes` Map
  const handleAddClass = useCallback(() => {
    if (!newClassName || !newClassColor) return;

    if (classes.has(newClassName)) {
      toast({
        title: 'Duplicate Class Name',
        description: `A class with the name ${newClassName} already exists. Please choose a different name.`,
      });
      return;
    }

    if (colorSet.has(newClassColor)) {
      toast({
        title: 'Duplicate Class Color',
        description: `A class with the color ${newClassColor} already exists. Please choose a different color.`,
      });
      return;
    }

    const newClass: DrawClass = { name: newClassName, color: newClassColor };
    setClasses(prev => new Map(prev).set(newClassName, newClass));
    colorSet.add(newClassColor);
    setNewClassName('');
    setNewClassColor(getRandomColor());
  }, [newClassName, newClassColor, classes]);

  // O(1) deletion because Map and Set support direct key removal
  const handleDeleteClass = (className: string) => {
    setClasses(prevClasses => {
      const newClasses = new Map(prevClasses);
      const classToDelete = newClasses.get(className);
      if (classToDelete) {
        colorSet.delete(classToDelete.color);
      }
      newClasses.delete(className);
      return newClasses;
    });
  };

  const renderToolbar = () => (
    <>
      <div className="flex md:justify-start justify-center">
        <ToolSelectorToggleGroup setToggle={setToggle} />
      </div>
      <div className="space-y-6">
        <Toaster />

        {toggle == 'draw' && (
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
                value={[brushSize]}
                onValueChange={handleBrushSizeChange}
                className="w-full"
              />
              <p className="text-sm text-zinc-700 dark:text-zinc-400">
                {brushSize} px
              </p>
            </div>
          </>
        )}

        <div className="flex flex-col space-y-2">
          <Label htmlFor="class-select">Class</Label>
          <Select onValueChange={handleClassSelected}>
            <SelectTrigger id="class-select">
              <SelectValue placeholder="Select a class" />
            </SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto">
              {Array.from(classes.values()).map((c, index) => (
                <SelectItem key={index} value={c.name}>
                  <div className="flex items-center">
                    <div
                      className="w-4 h-4 rounded-full mr-2"
                      style={{ backgroundColor: c.color }}
                    />
                    {c.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedClass && (
            <ButtonAlertDialog
              buttonText="Delete class"
              buttonIcon={<X className="h-3 w-3" />}
              dialogTitle="Confirm Deletion"
              dialogDescription={
                <>
                  Are you certain you want to delete the class "
                  <strong>{selectedClass.name}</strong>"? This action cannot be
                  undone.
                </>
              }
              onClick={() => handleDeleteClass(selectedClass.name)}
            />
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="add-class">New Class</Label>
          <div className="flex space-x-2 items-center">
            <Input
              id="add-class"
              placeholder="Class name"
              value={newClassName}
              onChange={e => setNewClassName(e.target.value)}
            />
            <ColorPicker
              onChange={setNewClassColor}
              initialColor={newClassColor}
              key={newClassColor} // Add key to force re-render
            />
          </div>
          <Button onClick={handleAddClass} className="w-full">
            Add Class
          </Button>
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
      </div>
    </>
  );

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
        <ScrollArea className="flex items-center space-x-2 overflow-y-auto max-h-screen">
          <div className="flex space-x-2">
            <ButtonAlertDialog
              buttonText="Back"
              buttonIcon={<ArrowLeft className="h-6 w-6" />}
              dialogTitle="Are you sure?"
              dialogDescription="You are about to leave this page. Any unsaved changes on the canvas will be lost. Please ensure you have exported your work before
            proceeding."
              onClick={() => {
                navigate('/');
              }}
            />
            <ThemeSwitchButton />
          </div>

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
              <div className="py-4 space-y-4">{renderToolbar()}</div>
            </SheetContent>
          </Sheet>
        </ScrollArea>
      </header>

      {/* DESKTOP AND LARGER SCREENS LAYOUT */}
      <main className="p-4 flex flex-col md:flex-row gap-4">
        <div className="hidden md:block w-64 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Tools</h2>
          </div>
          {renderToolbar()}
        </div>
        <div className="flex-grow">
          <div className="w-full h-screen bg-zinc-200 rounded-lg flex items-center justify-center dark:bg-zinc-800">
            <p className="text-zinc-500 dark:text-zinc-500">Canvas Area</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DrawPage;
