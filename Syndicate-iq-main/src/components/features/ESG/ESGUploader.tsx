import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, FileText } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';

interface ESGUploaderProps {
  onFilesSelect: (files: File[]) => void;
  selectedFiles: File[];
  onRemove: (index: number) => void;
  onClear: () => void;
}

export function ESGUploader({
  onFilesSelect,
  selectedFiles,
  onRemove,
  onClear,
}: ESGUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesSelect([...selectedFiles, ...acceptedFiles]);
    },
    [onFilesSelect, selectedFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls', '.xlsx'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB per file
  });

  return (
    <div className="space-y-4">
      {selectedFiles.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-white">Selected Files ({selectedFiles.length})</h4>
            <Button variant="ghost" size="sm" onClick={onClear}>
              Clear All
            </Button>
          </div>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-semantic-success/20 rounded-lg">
                    <FileText className="h-4 w-4 text-semantic-success" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{file.name}</p>
                    <p className="text-xs text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onRemove(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

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
                {isDragActive ? 'Drop files here' : 'Upload ESG Reports'}
              </p>
              <p className="text-sm text-gray-400">
                Drag and drop ESG report files, or click to browse
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Accepted formats: PDF, CSV, Excel (Maximum 10MB per file)
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
