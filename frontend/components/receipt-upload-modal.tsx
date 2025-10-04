"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, FileText, Paperclip } from "lucide-react";

interface ReceiptUploadModalProps {
  selectedFiles: File[];
  onFilesChange: (files: File[]) => void;
  disabled?: boolean;
}

export default function ReceiptUploadModal({
  selectedFiles,
  onFilesChange,
  disabled = false,
}: ReceiptUploadModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    onFilesChange([...selectedFiles, ...files]);
  };

  const removeFile = (index: number) => {
    onFilesChange(selectedFiles.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className="border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 hover:border-zinc-300 transition-colors"
        >
          <Paperclip className="h-4 w-4" />
          Attach Receipt
          {selectedFiles.length > 0 && (
            <span className="ml-2 bg-zinc-900 text-white text-xs px-2 py-0.5 rounded-full font-medium">
              {selectedFiles.length}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg border-zinc-200">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-zinc-900 font-semibold">
            Attach Receipt
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <label htmlFor="receipt-upload" className="cursor-pointer block">
              <div className="border-2 border-dashed border-zinc-200 rounded-xl p-8 text-center hover:border-zinc-300 hover:bg-zinc-50/50 transition-all duration-200">
                <Upload className="h-10 w-10 mx-auto mb-4 text-zinc-400" />
                <p className="text-sm font-medium text-zinc-700 mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-zinc-500">
                  PNG, JPG, PDF up to 10MB
                </p>
              </div>
            </label>
            <Input
              id="receipt-upload"
              type="file"
              accept="image/*,.pdf"
              multiple
              onChange={handleFileUpload}
              className="sr-only"
            />
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-zinc-700">
                Uploaded Files
              </h4>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-100"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <FileText className="h-4 w-4 text-zinc-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-zinc-700 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 h-8 w-8 p-0 flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button
              onClick={() => setIsOpen(false)}
              className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium px-6"
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
