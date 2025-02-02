import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import React, { ReactElement } from 'react';
import { Button } from '../../components/ui/button';

interface ButtonAlertDialogProps {
  buttonText: string;
  buttonClassName?: string;
  buttonIcon: ReactElement;
  dialogTitle: string | ReactElement;
  dialogDescription?: string | ReactElement;
  dialogCancel?: string;
  onClick: () => void;
}

const ButtonAlertDialog: React.FC<ButtonAlertDialogProps> = ({
  buttonText,
  buttonClassName,
  buttonIcon,
  dialogTitle,
  dialogDescription,
  dialogCancel,
  onClick,
}) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" className={buttonClassName}>
          {buttonIcon}
          <span className="hidden md:inline">{buttonText}</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
          <AlertDialogDescription>{dialogDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{dialogCancel ?? 'Cancel'}</AlertDialogCancel>
          <AlertDialogAction onClick={onClick}>
            {dialogCancel ?? 'Continue'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ButtonAlertDialog;
