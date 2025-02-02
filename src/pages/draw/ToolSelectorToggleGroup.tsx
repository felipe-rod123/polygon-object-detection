import {
  Hand,
  Pen,
  Rotate3D,
  SquareDashedMousePointer,
  Upload,
} from 'lucide-react';
import React, { useState } from 'react';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function ToolSelectorToggleGroup({
  setToggle,
}: {
  setToggle: React.Dispatch<React.SetStateAction<string>>;
}) {
  const [toggleState, setToggleState] = useState<string>('draw');

  const handleToggleChange = (value: string) => {
    if (value) {
      setToggleState(value);
      setToggle(value);
    }
  };

  // TODO: Refactor this code and write using Enums and Object Literals

  return (
    <TooltipProvider>
      <ToggleGroup
        type="single"
        variant="outline"
        onValueChange={handleToggleChange}
        value={toggleState}
      >
        <Tooltip>
          <TooltipTrigger>
            <ToggleGroupItem
              className="data-[state=on]:bg-main-400 dark:data-[state=on]:bg-main-600"
              asChild
              value="draw"
              aria-label="Toggle drawing"
            >
              <Pen className="h-4 w-4" />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent>
            <p>Drawing</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger>
            <ToggleGroupItem
              className="data-[state=on]:bg-main-400 dark:data-[state=on]:bg-main-600"
              asChild
              value="pan"
              aria-label="Toggle mouse pan"
            >
              <Hand className="h-4 w-4" />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent>
            <p>Mouse pan</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger>
            <ToggleGroupItem
              className="data-[state=on]:bg-main-400 dark:data-[state=on]:bg-main-600"
              asChild
              value="rotation"
              aria-label="Toggle rotation"
            >
              <Rotate3D className="h-4 w-4" />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent>
            <p>Rotation</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger>
            <ToggleGroupItem
              className="data-[state=on]:bg-main-400 dark:data-[state=on]:bg-main-600"
              asChild
              value="select"
              aria-label="Toggle selection"
            >
              <SquareDashedMousePointer className="h-4 w-4" />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent>
            <p>Selection</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger>
            <ToggleGroupItem
              className="data-[state=on]:bg-main-400 dark:data-[state=on]:bg-main-600"
              asChild
              value="import"
              aria-label="Import file"
            >
              <Upload className="h-4 w-4" />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent>
            <p>Import file</p>
          </TooltipContent>
        </Tooltip>
      </ToggleGroup>
    </TooltipProvider>
  );
}
