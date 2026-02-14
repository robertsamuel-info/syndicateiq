import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';

interface PDFUploaderProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onRemove: () => void;
}

export function PDFUploader({ onFileSelect, selectedFile, onRemove }: PDFUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  if (selectedFile) {
    return (
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-semantic-danger/20 rounded-lg">
              <File className="h-6 w-6 text-semantic-danger" />
            </div>
            <div>
              <p className="font-medium text-white">{selectedFile.name}</p>
              <p className="text-sm text-gray-400">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onRemove}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
          ${
            isDragActive
              ? 'border-accent-gold bg-accent-gold/10'
              : 'border-gray-700 hover:border-accent-gold/50 hover:bg-gray-800/50'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-accent-gold/20 rounded-full">
            <Upload className="h-8 w-8 text-accent-gold" />
          </div>
          <div>
            <p className="text-lg font-medium text-white mb-1">
              {isDragActive ? 'Drop PDF here' : 'Upload Settlement Document'}
            </p>
            <p className="text-sm text-gray-400">
              Drag and drop a PDF file, or click to browse
            </p>
            <p className="text-xs text-gray-500 mt-2">Maximum file size: 10MB</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
