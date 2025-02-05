import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import type { Canvas } from 'fabric';
import { Upload } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

interface FileUploadModalButtonProps {
  fabricRef: React.MutableRefObject<Canvas | null>;
  handleSetImageBackground: (
    fabricRef: React.MutableRefObject<Canvas | null>,
    imageUrl: string,
  ) => void;
  handleAddImageObject: (
    fabricRef: React.MutableRefObject<Canvas | null>,
    imageUrl: string,
  ) => void;
}

const FileUploadModalButton: React.FC<FileUploadModalButtonProps> = ({
  fabricRef,
  handleSetImageBackground,
  handleAddImageObject,
}) => {
  const { toast } = useToast();
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploadType, setUploadType] = useState<'background' | 'object'>(
    'object',
  );
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files);
    }
  };

  const handleUpload = async () => {
    setLoading(true);
    try {
      if (files && files.length > 0) {
        await Promise.all(
          Array.from(files).map(
            file =>
              new Promise<void>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = e => {
                  const result = e.target?.result;
                  if (typeof result === 'string') {
                    if (uploadType === 'background') {
                      handleSetImageBackground(fabricRef, result);
                    } else {
                      handleAddImageObject(fabricRef, result);
                    }
                    resolve();
                  } else {
                    reject(new Error('Failed to read file'));
                  }
                };
                reader.onerror = () => reject(new Error('Failed to read file'));
                reader.readAsDataURL(file);
              }),
          ),
        );
      } else if (imageUrl) {
        if (uploadType === 'background') {
          handleSetImageBackground(fabricRef, imageUrl);
        } else {
          handleAddImageObject(fabricRef, imageUrl);
        }
      }
      setOpen(false);
    } catch (error) {
      console.log(error);
      toast({
        title: 'Upload Error',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          className="bg-transparent border border-zinc-300 rounded-md p-2 hover:bg-zinc-100 dark:border-slate-800 dark:hover:bg-zinc-800 active:bg-main-400 dark:active:bg-main-600"
        >
          <Upload className="h-4 w-4 text-black dark:text-white" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
        <DialogHeader>
          <DialogTitle>Upload Image</DialogTitle>
          <DialogDescription>
            Upload an image from your device or provide a URL.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <RadioGroup
            defaultValue="object"
            onValueChange={(value: string) =>
              setUploadType(value as 'background' | 'object')
            }
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="object" id="object" />
              <Label htmlFor="object">Add as object</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="background" id="background" />
              <Label htmlFor="background">Set as background</Label>
            </div>
          </RadioGroup>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="file">Upload from device</Label>
            <Input
              id="file"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              multiple={uploadType === 'object'}
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="url">Image URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
            />
          </div>
        </div>
        <Button onClick={handleUpload} disabled={loading}>
          {loading ? 'Uploading...' : 'Upload'}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default FileUploadModalButton;
