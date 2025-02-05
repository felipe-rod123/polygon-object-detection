import { ReactElement } from 'react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

interface TooltipToggleButtonProps {
  keyValue: string;
  onClick: () => void;
  icon: ReactElement;
  tooltipText: string;
  transparent?: boolean;
}

const TooltipToggleButton: React.FC<TooltipToggleButtonProps> = ({
  keyValue,
  onClick,
  icon,
  tooltipText,
  transparent,
}) => {
  return (
    <Tooltip key={keyValue}>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          className={`border border-zinc-300 rounded-md p-2 hover:bg-zinc-100 dark:border-slate-800 dark:hover:bg-zinc-800 active:bg-main-400 dark:active:bg-main-600 ${
            transparent ? 'bg-transparent' : 'bg-zinc-200 dark:bg-zinc-800'
          }`}
          onClick={onClick}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltipText}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default TooltipToggleButton;
