import { useToast } from '@/hooks/use-toast';
import type { DrawClass } from '@/types/DrawClass';
import { getRandomColor } from '@/utils/getRandomColor';
import { useCallback, useState } from 'react';

export const useClassManagement = () => {
  const [classes, setClasses] = useState<Map<string, DrawClass>>(new Map());
  const [colorSet, setColorSet] = useState<Set<string>>(new Set());
  const [selectedClass, setSelectedClass] = useState<DrawClass | null>(null);
  const [newClassName, setNewClassName] = useState('');
  const [newClassColor, setNewClassColor] = useState(getRandomColor());

  const { toast } = useToast();

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
        title: 'Duplicate Class Name',
        description: (
          <>
            A class with the name <strong>{newClassName}</strong> already
            exists. Please choose a different name.
          </>
        ),
      });
      return;
    }

    if (colorSet.has(newClassColor)) {
      toast({
        title: 'Duplicate Class Color',
        description: (
          <div className="flex flex-row items-center align-middle">
            <div
              className="w-4 h-4 p-4 m-4 rounded-full"
              style={{ backgroundColor: newClassColor }}
            />
            <p>
              A class with the color <strong>{newClassColor}</strong> already
              exists. Please choose a different color.
            </p>
          </div>
        ),
      });
      return;
    }

    const newClass: DrawClass = { name: newClassName, color: newClassColor };
    setClasses(prev => new Map(prev).set(newClassName, newClass));
    setColorSet(prev => new Set(prev).add(newClassColor));
    setNewClassName('');
    setNewClassColor(getRandomColor());
  }, [newClassName, newClassColor, classes, colorSet, toast]);

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
          description: (
            <>
              The class <strong>{className}</strong> has been successfully
              deleted.
            </>
          ),
        });
      }
      newClasses.delete(className);
      setSelectedClass(null);
      return newClasses;
    });
  };

  return {
    classes,
    selectedClass,
    newClassName,
    newClassColor,
    findClassByName,
    handleClassSelected,
    handleAddClass,
    handleDeleteClass,
    setNewClassName,
    setNewClassColor,
  };
};
