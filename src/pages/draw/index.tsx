import ButtonAlertDialog from '@/components/button-alert-dialog';
import ThemeSwitchButton from '@/components/theme-switch-button';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Toaster } from '@/components/ui/toaster';
import { useDrawHandlers } from '@/utils/drawHandlers';
import { ArrowLeft, Box, Menu } from 'lucide-react';
import type React from 'react';
import { useNavigate } from 'react-router';
import CanvasDrawing from './DrawCanvas';
import Toolbar from './Toolbar';
import { useCallback } from 'react';

const DrawPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    brushSize,
    drawTool,
    classes,
    selectedClass,
    newClassName,
    newClassColor,
    toggle,
    handleBrushSizeChange,
    handleDrawToolChange,
    handleClassSelected,
    handleAddClass,
    handleDeleteClass,
    setNewClassName,
    setNewClassColor,
    setToggle,
  } = useDrawHandlers();

  const handleExportSVG = useCallback(() => {
    // This function will be implemented in CanvasDrawing
  }, []);

  const handleExportCOCO = useCallback(() => {
    // This function will be implemented in CanvasDrawing
  }, []);

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
              dialogDescription="You are about to leave this page. Any unsaved changes on the canvas will be lost. Please ensure you have exported your work before proceeding."
              onClick={() => {
                navigate('/');
              }}
            />
            <ThemeSwitchButton />

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
                <div className="py-4 space-y-4">
                  <Toolbar
                    toggle={toggle}
                    setToggle={setToggle}
                    handleDrawToolChange={handleDrawToolChange}
                    drawTool={drawTool}
                    brushSize={brushSize}
                    handleBrushSizeChange={handleBrushSizeChange}
                    classes={classes}
                    selectedClass={selectedClass}
                    handleClassSelected={handleClassSelected}
                    handleDeleteClass={handleDeleteClass}
                    newClassName={newClassName}
                    setNewClassName={setNewClassName}
                    newClassColor={newClassColor}
                    setNewClassColor={setNewClassColor}
                    handleAddClass={handleAddClass}
                    handleExportSVG={handleExportSVG}
                    handleExportCOCO={handleExportCOCO}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </ScrollArea>
      </header>

      {/* DESKTOP AND LARGER SCREENS LAYOUT */}
      <main className="p-4 flex flex-col md:flex-row gap-4">
        <div className="hidden md:block w-64 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Tools</h2>
          </div>
          <Toolbar
            toggle={toggle}
            setToggle={setToggle}
            handleDrawToolChange={handleDrawToolChange}
            drawTool={drawTool}
            brushSize={brushSize}
            handleBrushSizeChange={handleBrushSizeChange}
            classes={classes}
            selectedClass={selectedClass}
            handleClassSelected={handleClassSelected}
            handleDeleteClass={handleDeleteClass}
            newClassName={newClassName}
            setNewClassName={setNewClassName}
            newClassColor={newClassColor}
            setNewClassColor={setNewClassColor}
            handleAddClass={handleAddClass}
            handleExportSVG={handleExportSVG}
            handleExportCOCO={handleExportCOCO}
          />
        </div>
        <CanvasDrawing
          canvasMode={toggle}
          canvasDrawTool={drawTool}
          setCanvasToggle={setToggle}
          strokeColor={selectedClass?.color ?? '#532ee3'}
          strokeWidth={brushSize}
          handleExportSVG={handleExportSVG}
          handleExportCOCO={handleExportCOCO}
        />
      </main>
      <Toaster />
    </div>
  );
};

export default DrawPage;
