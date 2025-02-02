import { useToast } from '@/hooks/use-toast';
import type { DrawClass } from '@/types/DrawClass';
import { getRandomColor } from '@/utils/getRandomColor';
import { useCallback, useState } from 'react';

export const useDrawHandlers = () => {
  const [brushSize, setBrushSize] = useState(10);
  const [classes, setClasses] = useState<Map<string, DrawClass>>(new Map());
  const [colorSet, setColorSet] = useState<Set<string>>(new Set());
  const [selectedClass, setSelectedClass] = useState<DrawClass | null>(null);
  const [newClassName, setNewClassName] = useState('');
  const [newClassColor, setNewClassColor] = useState(getRandomColor());
  const [toggle, setToggle] = useState('draw');

  const { toast } = useToast();

  const handleBrushSizeChange = (value: number[]) => {
    setBrushSize(value[0]);
  };

  const findClassByName = (className: string): DrawClass | null => {
    return classes.get(className) || null;
  };

  const handleClassSelected = (className: string) => {
    setSelectedClass(classes.get(className) || null);
  };

  const handleAddClass = useCallback(() => {
    if (!newClassName || !newClassColor) return;

    if (classes.has(newClassName)) {
      toast({
        variant: 'destructive',
        title: 'Duplicate Class Name',
        description: `A class with the name ${newClassName} already exists. Please choose a different name.`,
      });
      return;
    }

    if (colorSet.has(newClassColor)) {
      toast({
        variant: 'destructive',
        title: 'Duplicate Class Color',
        description: `A class with the color ${newClassColor} already exists. Please choose a different color.`,
      });
      return;
    }

    const newClass: DrawClass = { name: newClassName, color: newClassColor };
    setClasses(prev => new Map(prev).set(newClassName, newClass));
    setColorSet(prev => new Set(prev).add(newClassColor));
    setNewClassName('');
    setNewClassColor(getRandomColor());
  }, [newClassName, newClassColor, classes, colorSet]);

  const handleDeleteClass = (className: string) => {
    setClasses(prevClasses => {
      const newClasses = new Map(prevClasses);
      const classToDelete = newClasses.get(className);
      if (classToDelete) {
        setColorSet(prev => {
          const newSet = new Set(prev);
          newSet.delete(classToDelete.color);
          return newSet;
        });
        toast({
          title: 'Class Deleted',
          description: `The class ${className} has been successfully deleted.`,
        });
      }
      newClasses.delete(className);
      setSelectedClass(null);
      return newClasses;
    });
  };

  return {
    brushSize,
    classes,
    selectedClass,
    newClassName,
    newClassColor,
    toggle,
    handleBrushSizeChange,
    findClassByName,
    handleClassSelected,
    handleAddClass,
    handleDeleteClass,
    setNewClassName,
    setNewClassColor,
    setToggle,
  };
};
