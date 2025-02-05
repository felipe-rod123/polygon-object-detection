import { Hand, Pen, Save, SquareDashedMousePointer } from 'lucide-react';
import React, { ReactElement, useEffect, useState } from 'react';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ToolToggleEnum } from '@/types/enums/ToolToggleEnum';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import TooltipToggleButton from '@/components/tooltip-toggle-button';
import { useToast } from '@/hooks/use-toast';
import { handleSetImageBackground } from '@/utils/imageHandlers';
import { handleAddImageObject } from '@/utils/imageHandlers';
import { Canvas } from 'fabric';
import FileUploadModalButton from './file-upload-modal-button';

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
  toggle,
  setToggle,
  fabricRef,
}: {
  toggle: ToolToggleEnum;
  setToggle: React.Dispatch<React.SetStateAction<ToolToggleEnum>>;
  fabricRef: React.MutableRefObject<Canvas | null>;
}) {
  const { toast } = useToast();

  const [toggleState, setToggleState] = useState<ToolToggleEnum>(toggle);

  useEffect(() => {
    setToggleState(toggle);
  }, [toggle]);

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

        <TooltipToggleButton
          keyValue="save"
          onClick={() => {
            toast({
              title: 'Save not implemented yet',
              description: 'Your files have not been saved locally.',
              variant: 'destructive',
            });
          }}
          icon={<Save className="h-4 w-4 text-black dark:text-white" />}
          tooltipText="Save files locally"
        />

        <Tooltip key="import">
          <TooltipTrigger>
            <FileUploadModalButton
              fabricRef={fabricRef}
              handleSetImageBackground={handleSetImageBackground}
              handleAddImageObject={handleAddImageObject}
            />
          </TooltipTrigger>
          <TooltipContent>
            <p>Import file</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
