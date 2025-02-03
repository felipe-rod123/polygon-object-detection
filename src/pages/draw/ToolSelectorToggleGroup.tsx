import {
  Hand,
  Pen,
  Rotate3D,
  SquareDashedMousePointer,
  Upload,
} from 'lucide-react';
import React, { ReactElement, useState } from 'react';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ToolToggleEnum } from '@/types/enums/ToolToggleEnum';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface toolToogleConfigs {
  value: ToolToggleEnum;
  ariaLabel: string;
  icon: ReactElement;
}

const toolToggleGroup: toolToogleConfigs[] = [
  {
    value: ToolToggleEnum.DRAW,
    ariaLabel: 'Toggle drawing',
    icon: <Pen className="h-4 w-4" />,
  },
  {
    value: ToolToggleEnum.PAN,
    ariaLabel: 'Toggle mouse pan',
    icon: <Hand className="h-4 w-4" />,
  },
  {
    value: ToolToggleEnum.ROTATION,
    ariaLabel: 'Toggle rotation',
    icon: <Rotate3D className="h-4 w-4" />,
  },
  {
    value: ToolToggleEnum.SELECT,
    ariaLabel: 'Toggle selection',
    icon: <SquareDashedMousePointer className="h-4 w-4" />,
  },
  {
    value: ToolToggleEnum.IMPORT,
    ariaLabel: 'Import file',
    icon: <Upload className="h-4 w-4" />,
  },
];

export default function ToolSelectorToggleGroup({
  setToggle,
}: {
  setToggle: React.Dispatch<React.SetStateAction<ToolToggleEnum>>;
}) {
  const [toggleState, setToggleState] = useState<ToolToggleEnum>(
    ToolToggleEnum.DRAW,
  );

  const handleToggleChange = (value: ToolToggleEnum) => {
    if (value) {
      setToggleState(value);
      setToggle(value);
    }
  };

  return (
    <TooltipProvider>
      <ToggleGroup
        type="single"
        variant="outline"
        onValueChange={handleToggleChange}
        value={toggleState}
      >
        {toolToggleGroup.map(tool => (
          <Tooltip key={tool.value}>
            <TooltipTrigger>
              <ToggleGroupItem
                className="data-[state=on]:bg-main-400 dark:data-[state=on]:bg-main-600"
                asChild
                value={tool.value}
                aria-label={tool.ariaLabel}
              >
                {tool.icon}
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>
              <p>{tool.ariaLabel}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </ToggleGroup>
    </TooltipProvider>
  );
}
