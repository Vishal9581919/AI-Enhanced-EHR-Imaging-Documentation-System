import { Upload, X, ZoomIn } from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "./ui/button";

interface MRIUploadProps {
  onImageUpload: (file: File, preview: string) => void;
  uploadedImage?: string;
  onClearImage: () => void;
}

export function MRIUpload({ onImageUpload, uploadedImage, onClearImage }: MRIUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        onImageUpload(file, preview);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      {!uploadedImage ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          className={`
            border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all
            ${isDragging ? 'border-[#0E6BA8] bg-[#F0F9FF]' : 'border-[#CBD5E1] hover:border-[#007B83]'}
          `}
          style={{ backgroundColor: isDragging ? '#F0F9FF' : '#FFFFFF' }}
        >
          <div className="flex flex-col items-center gap-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#E0F2FE' }}
            >
              <Upload className="w-8 h-8" style={{ color: '#0E6BA8' }} />
            </div>
            <div>
              <p style={{ color: '#1E2A35' }}>
                Drag and drop your MRI scan here
              </p>
              <p className="mt-2 text-[0.875rem]" style={{ color: '#64748B' }}>
                or click to browse
              </p>
            </div>
            <p className="text-[0.8125rem]" style={{ color: '#94A3B8' }}>
              Supports: .jpg, .png, .dcm files
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.dcm"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-lg overflow-hidden border-2" style={{ borderColor: '#CBD5E1' }}>
            <img 
              src={uploadedImage} 
              alt="Uploaded MRI" 
              className="w-full h-64 object-cover"
            />
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onClearImage();
              }}
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              style={{ borderColor: '#CBD5E1', color: '#64748B' }}
            >
              <ZoomIn className="w-4 h-4 mr-2" />
              View Full Size
            </Button>
            <Button
              onClick={handleClick}
              variant="outline"
              className="flex-1"
              style={{ borderColor: '#CBD5E1', color: '#64748B' }}
            >
              <Upload className="w-4 h-4 mr-2" />
              Replace Image
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.dcm"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
