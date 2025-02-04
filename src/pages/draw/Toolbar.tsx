import ButtonAlertDialog from '@/components/button-alert-dialog';
import ColorPicker from '@/components/color-picker';
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
import { Slider } from '@/components/ui/slider';
import type { DrawClass } from '@/types/DrawClass';
import { ToolToggleEnum } from '@/types/enums/ToolToggleEnum';
import { Brush, Download, Eraser, Image, Square, Tangent, X } from 'lucide-react';
import type React from 'react';
import ToolSelectorToggleGroup from './ToolSelectorToggleGroup';

interface ToolbarProps {
  toggle: string;
  setToggle: React.Dispatch<React.SetStateAction<ToolToggleEnum>>;
  handleDrawToolChange: (value: string) => void;
  brushSize: number;
  drawTool: string;
  handleBrushSizeChange: (value: number[]) => void;
  classes: Map<string, DrawClass>;
  selectedClass: DrawClass | null;
  handleClassSelected: (className: string) => void;
  handleDeleteClass: (className: string) => void;
  newClassName: string;
  setNewClassName: (name: string) => void;
  newClassColor: string;
  setNewClassColor: (color: string) => void;
  handleAddClass: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  toggle,
  setToggle,
  handleDrawToolChange,
  brushSize,
  drawTool,
  handleBrushSizeChange,
  classes,
  selectedClass,
  handleClassSelected,
  handleDeleteClass,
  newClassName,
  setNewClassName,
  newClassColor,
  setNewClassColor,
  handleAddClass,
}) => {
  return (
    <>
      <div className="flex md:justify-start justify-center">
        <ToolSelectorToggleGroup setToggle={setToggle} />
      </div>
      <div className="space-y-6">
        {toggle === 'draw' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="tool-select">Drawing Tool</Label>
              <Select
                defaultValue="brush"
                onValueChange={handleDrawToolChange}
                value={drawTool}
              >
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
                      <Tangent className="mr-2 h-4 w-4" />
                      Polygon
                    </div>
                  </SelectItem>
                  <SelectItem value="rectangle">
                    <div className="flex items-center">
                      <Square className="mr-2 h-4 w-4" />
                      Rectangle
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
              <Label htmlFor="brush-size">Stroke Size</Label>
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
          <Select
            onValueChange={handleClassSelected}
            value={selectedClass ? selectedClass.name : ''}
          >
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
              key={newClassColor}
            />
          </div>
          <Button
            onClick={handleAddClass}
            className="w-full"
            // disabled={!newClassName.trim()}
          >
            Add Class
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="export">Export canvas</Label>
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
};

export default Toolbar;
