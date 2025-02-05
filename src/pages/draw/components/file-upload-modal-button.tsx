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
import { Upload } from 'lucide-react';
import type React from 'react';
import { forwardRef, useState } from 'react';

const acceptedFileTypes = ['application/pdf', 'image/png', 'image/jpeg'];

const FileUploadModalButton = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>((_props, ref) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (acceptedFileTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
        if (selectedFile.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = e => setPreview(e.target?.result as string);
          reader.readAsDataURL(selectedFile);
        } else {
          setPreview(null);
        }
      } else {
        alert('Please select a PDF or image file.');
        e.target.value = '';
      }
    }
  };

  const handleUpload = () => {
    if (file) {
      // TODO: implement file upload logic here
      console.log('Uploading file:', file);

      // Reset state after upload
      setFile(null);
      setPreview(null);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="icon"
          ref={ref}
          className="bg-transparent border border-zinc-300 rounded-md p-2 hover:bg-zinc-100 dark:border-slate-800 dark:hover:bg-zinc-800 active:bg-main-400 dark:active:bg-main-600"
        >
          <Upload className="h-4 w-4 text-black dark:text-white" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
        <DialogHeader>
          <DialogTitle>Import file</DialogTitle>
          <DialogDescription>
            Upload a PDF or image file (PNG, JPEG).
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="file">File</Label>
            <Input
              id="file"
              type="file"
              accept={acceptedFileTypes.join(',')}
              onChange={handleFileChange}
              className="bg-zinc-200 text-zinc-900 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700"
            />
          </div>
          {preview && (
            <div className="relative w-full h-40">
              <img
                src={preview || '/placeholder.svg'}
                alt="File preview"
                className="w-full h-full object-contain"
              />
            </div>
          )}
          {file && !preview && (
            <div className="bg-zinc-200 text-zinc-900 p-4 rounded dark:bg-zinc-800 dark:text-zinc-100">
              <p>{file.name}</p>
              <p>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="text-zinc-900 hover:bg-zinc-200 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              Cancel
            </Button>
          </DialogTrigger>
          <Button
            onClick={handleUpload}
            disabled={!file}
            className="bg-main-600 text-zinc-100 hover:bg-main-500"
          >
            Upload
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});

export default FileUploadModalButton;
