import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
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
  const [importType, setImportType] = useState<'file' | 'url' | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(e.target.files);
      setImportType('file');
      setImageUrl('');

      const firstFile = e.target.files[0];
      if (firstFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = e => setPreview(e.target?.result as string);
        reader.readAsDataURL(firstFile);
      } else {
        setPreview(null);
      }
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
    setImportType('url');
    setFiles(null);
  };

  const handleUpload = () => {
    if (importType === 'file' && files && files.length > 0) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = e => {
          const result = e.target?.result;
          if (typeof result === 'string') {
            if (uploadType === 'background') {
              handleSetImageBackground(fabricRef, result);
            } else {
              handleAddImageObject(fabricRef, result);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    } else if (importType === 'url' && imageUrl) {
      const urlRegex =
        /^(https?:\/\/|data:image\/[a-zA-Z]+;base64,)[\w\d+&@#/%?=~_|!:,.;-]+$/;
      if (!urlRegex.test(imageUrl)) {
        toast({
          title: 'Invalid URL',
          description: 'Please enter a valid URL',
          variant: 'destructive',
        });
        return;
      }
      if (uploadType === 'background') {
        handleSetImageBackground(fabricRef, imageUrl);
      } else {
        handleAddImageObject(fabricRef, imageUrl);
      }
    }
    handleDialogClose();
  };

  const handleDialogClose = () => {
    setFiles(null);
    setImageUrl('');
    setImportType(null);
    setUploadType('object');
    setPreview(null);
  };

  return (
    <Dialog onOpenChange={open => !open && handleDialogClose()}>
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
            onValueChange={value =>
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
              disabled={importType === 'url'}
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="url">Image URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={handleUrlChange}
              disabled={importType === 'file'}
            />
          </div>
        </div>
        {preview && (
          <div className="relative w-full h-40 -my-2">
            <img
              src={preview || '/placeholder.png'}
              alt="File preview"
              className="w-full h-full object-contain"
            />
          </div>
        )}
        {files && !preview && (
          <div className="bg-zinc-800 text-zinc-100 p-4 rounded">
            {Array.from(files).map((file, index) => (
              <div key={index} className="flex justify-between">
                <p>{file.name}</p>
                <p>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ))}
          </div>
        )}
        <div className="flex flex-row w-full justify-end space-x-2 mt-4">
          <DialogClose asChild>
            <Button
              variant="secondary"
              className="hover:bg-zinc-200 dark:hover:bg-zinc-700"
            >
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              onClick={handleUpload}
              className="px-8 bg-main-500 text-zinc-50 hover:bg-main-700"
              disabled={!files && !imageUrl}
            >
              Upload
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FileUploadModalButton;
