import { Hand, Pen, Save, SquareDashedMousePointer } from 'lucide-react';
import React, { ReactElement, useState } from 'react';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ToolToggleEnum } from '@/types/enums/ToolToggleEnum';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { useToast } from '@/hooks/use-toast';
import FileUploadModalButton from './FileUploadModalButton';

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
    value: ToolToggleEnum.SELECT,
    ariaLabel: 'Toggle selection',
    icon: <SquareDashedMousePointer className="h-4 w-4" />,
  },
  {
    value: ToolToggleEnum.PAN,
    ariaLabel: 'Toggle mouse pan',
    icon: <Hand className="h-4 w-4" />,
  },
];

export default function ToolSelectorToggleGroup({
  setToggle,
}: {
  setToggle: React.Dispatch<React.SetStateAction<ToolToggleEnum>>;
}) {
  const { toast } = useToast();

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
      <div className="flex flex-row space-x-1">
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
        <Tooltip key="save">
          <TooltipTrigger asChild>
            <Button
              className="bg-transparent border border-zinc-300 rounded-md p-2 hover:bg-zinc-100 dark:border-slate-800 dark:hover:bg-zinc-800 active:bg-main-400 dark:active:bg-main-600"
              onClick={() => {
                toast({
                  title: 'Save not implemented yet',
                  description: 'Your files have not been saved locally.',
                  variant: 'destructive',
                });
              }}
            >
              <Save className="h-4 w-4 text-black dark:text-white" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Save files locally</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip key="import">
          <TooltipTrigger asChild>
            <FileUploadModalButton />
          </TooltipTrigger>
          <TooltipContent>
            <p>Import file</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
